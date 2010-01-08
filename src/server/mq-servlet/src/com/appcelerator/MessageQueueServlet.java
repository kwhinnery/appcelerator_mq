package com.appcelerator;

import java.io.IOException;
import java.lang.reflect.Constructor;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.codehaus.jackson.map.ObjectMapper;

import com.appcelerator.annotation.Pattern;
import com.appcelerator.annotation.Priority;
import com.appcelerator.annotation.Scope;

@SuppressWarnings("serial")
public class MessageQueueServlet extends HttpServlet {

	// Store reference to listeners
	private static List<Listener> LISTENERS;

	/**
	 * Create a simple hash with message information to return on an error
	 * 
	 * @param message
	 * @return
	 */
	private static HashMap<String, Object> defaultMessage(String message) {
		HashMap<String, Object> result = new HashMap<String, Object>();
		result.put("success", false);
		result.put("systemGenerated", true);
		result.put("message", message);
		return result;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * javax.servlet.http.HttpServlet#doGet(javax.servlet.http.HttpServletRequest
	 * , javax.servlet.http.HttpServletResponse)
	 */
	public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		resp.setContentType("text/plain");
		resp.getWriter().println("MQ Servlet is running.  Code Strong!");
	}

	/*
	 * Process requests to the 'service broker' servlet
	 * 
	 * (non-Javadoc)
	 * 
	 * @see
	 * javax.servlet.http.HttpServlet#doPost(javax.servlet.http.HttpServletRequest
	 * , javax.servlet.http.HttpServletResponse)
	 */
	@SuppressWarnings("unchecked")
	public void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		// First, validate Content-Type is JSON - prevents CSRF and validates
		// that we can parse the input
		if (req.getContentType().indexOf("application/json") < 0) {
			resp.setStatus(500);
			resp.setContentType("text/plain");
			resp.getWriter().println("Content-Type must be application/json to communicate with the MQ servlet.");
			return;
		}

		// Read in JSON
		ObjectMapper mapper = new ObjectMapper();
		Message request = mapper.readValue(req.getInputStream(), Message.class);
		
		// The return message that we will serialize to JSON
		resp.setStatus(200);
		Message response = new Message();
		response.setName(request.getName().replace(".request", ".response"));
		response.setScope(request.getScope());
		
		//Go through listener queue and execute any methods we have
		Iterator it = LISTENERS.iterator();
		while (it.hasNext()) {
			Listener listener = (Listener) it.next();
			//Determine if this listener does in fact listen for the request message
			if (listener.getScope().equalsIgnoreCase(request.getScope()) && listener.getPattern().matcher(request.getName()).matches()) {
				Class[] paramTypes = new Class[1];
				paramTypes[0] = Message.class;
				Object[] args = new Object[1];
				args[0] = request;
				Object result = null;
				try {
					result = listener.getMethod().invoke(listener.getListenerInstance(), args);
				} catch (Exception e) {
					response.setPayload(MessageQueueServlet.defaultMessage("We couldn't instantiate and call your service class - check spelling of listener package in web.xml."));
					e.printStackTrace();
				}
				//Process result - if it's null, continue processing other messages
				if (result == null) { }
				//if it's Boolean.TRUE, then squash the message from further processing
				else if (result instanceof Boolean && Boolean.TRUE.equals(result)) {
					break;
				}
				//If it's a message, go ahead and return it, assume the service knows what it's doing.
				else if (result instanceof Message) {
					response = (Message) result;
					break;
				}
				//otherwise, treat the response as the message payload for the response
				else {
					response.setPayload(result);
					break;
				}
			}
		}

		resp.setContentType("application/json");
		mapper.writeValue(resp.getOutputStream(), response);
	}

	/*
	 * Process listener classes that we can keep on hand for processing messages
	 * 
	 * (non-Javadoc)
	 * 
	 * @see javax.servlet.GenericServlet#init()
	 */
	@SuppressWarnings("unchecked")
	public void init() throws ServletException {
		try {
			List<Class> listenerClasses = ClasspathScanner.getClasses(this.getInitParameter(Constants.LISTENERS_INIT_PARAMETER));
			LISTENERS = new ArrayList<Listener>();
			Iterator<Class> it = listenerClasses.iterator();
			while (it.hasNext()) {
				Class current = it.next();
				//We can only work with classes with a visible default constructor, skip any that don't have one
				if (current.getConstructors().length == 0) {
					break;
				}
				Constructor cons = current.getConstructors()[0];
				Object[] consArgs = new Object[0];
				Object instance = cons.newInstance(consArgs);
				Method[] currentMethods = current.getDeclaredMethods();
				for (int i = 0;i < currentMethods.length;i++) {
					Method meth = currentMethods[i];
					if (meth.getAnnotation(Pattern.class) != null) {
						Listener listener = new Listener();
						listener.setListenerInstance(instance);
						listener.setMethod(meth);
						listener.setType(current);
						
						//Compile pattern for listener
						listener.setPattern(java.util.regex.Pattern.compile(meth.getAnnotation(Pattern.class).value()));
						
						//Set listener priority
						int priority = -1;
						if (meth.getAnnotation(Priority.class) != null) {
							priority = meth.getAnnotation(Priority.class).value();
						}
						listener.setPriority(priority);
						
						//Set listener scope
						String scope = Constants.DEFAULT_SCOPE;
						if (meth.getAnnotation(Scope.class) != null) {
							scope = meth.getAnnotation(Scope.class).value();
						}
						listener.setScope(scope);
						
						//Place listener in the proper location
						if (LISTENERS.size() == 0) {
							LISTENERS.add(listener);
						}
						else {
							for (int k = 0; k < LISTENERS.size(); k++) {
								Listener currentListener = (Listener) LISTENERS.get(k);
								if (currentListener.getPriority() <= listener.getPriority()) {
									LISTENERS.add(k, listener);
									break;
								}
								if (k+1 == LISTENERS.size()) {
									LISTENERS.add(listener);
								}
							}
						}
					}
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}
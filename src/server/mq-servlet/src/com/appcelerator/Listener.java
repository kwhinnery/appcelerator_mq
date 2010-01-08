package com.appcelerator;

import java.lang.reflect.Method;
import java.util.regex.Pattern;

public class Listener {
	private Pattern pattern;
	private Object listenerInstance;
	private Method method;
	@SuppressWarnings("unchecked")
	private Class type;
	private int priority;
	private String scope;

	public Object getListenerInstance() {
		return listenerInstance;
	}

	public Method getMethod() {
		return method;
	}

	public Pattern getPattern() {
		return pattern;
	}

	public int getPriority() {
		return priority;
	}

	public String getScope() {
		return scope;
	}

	@SuppressWarnings("unchecked")
	public Class getType() {
		return type;
	}

	public void setListenerInstance(Object listenerInstance) {
		this.listenerInstance = listenerInstance;
	}

	public void setMethod(Method method) {
		this.method = method;
	}

	public void setPattern(Pattern pattern) {
		this.pattern = pattern;
	}

	public void setPriority(int priority) {
		this.priority = priority;
	}

	public void setScope(String scope) {
		this.scope = scope;
	}

	@SuppressWarnings("unchecked")
	public void setType(Class type) {
		this.type = type;
	}
}

package com.appcelerator.listeners;

import com.appcelerator.Constants;
import com.appcelerator.Message;
import com.appcelerator.annotation.Pattern;
import com.appcelerator.annotation.Priority;

public class TestFilteringListener {
	
	/**
	 * A test filter - the priority 1 should allow it to execute before default priority -1 messages
	 * @param msg
	 */
	@Pattern("^r:filter\\.*")
	@Priority(1)
	public Message filterListener(Message msg) {
		//returning this as a null will allow further processing of messages
		Message filterResult = null;
		
		//create a new response message and return that instead for this message type
		if ("r:filter.yourmom.request".equals(msg.getName())) {
			filterResult = new Message();
			filterResult.setName("r:yomamma.response");
			filterResult.setPayload(false);
			filterResult.setScope(Constants.DEFAULT_SCOPE);
		}
		
		return filterResult;
	}
	
	/**
	 * This should not get filtered out by the above filter, should happily return
	 * r:filter.nothing.response with true in the payload.
	 * 
	 * @param msg
	 * @return
	 */
	@Pattern("^r:filter.nothing.request$")
	public boolean filterNothing(Message msg) {
		return true;
	}
}

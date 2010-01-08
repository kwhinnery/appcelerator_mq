package com.appcelerator;

public class Message {
	private String name;
	private String scope;
	private Object payload;

	public String getName() {
		return name;
	}

	public Object getPayload() {
		return payload;
	}

	public String getScope() {
		return scope;
	}

	public void setName(String name) {
		this.name = name;
	}

	public void setPayload(Object payload) {
		this.payload = payload;
	}

	public void setScope(String scope) {
		this.scope = scope;
	}
}

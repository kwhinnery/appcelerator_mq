package com.appcelerator.listeners;

import com.appcelerator.Message;
import com.appcelerator.annotation.Pattern;

public class TestListener {
	@Pattern("^r:say.hello.request$")
	public String sayHello(Message msg) {
		return "Hello World!";
	}
}

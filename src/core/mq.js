(function() {
  //MQ configuration options
  App.mq.config = {
    scan_interval: 150 //amount of time between queue scans
  };
  
  //Implement MQ API
	var MESSAGE_QUEUE = []; //this array represents the current message queue
	var FILTERS = []; //this array holds filters - first in gets priority, and can cancel others 
	var LISTENERS = []; //this array represents the message listeners
	
	//Scan the message queue and deliver messages to listeners
	function deliver() {
	  var hadMessages = false;
		while (MESSAGE_QUEUE.length > 0) {
		  hadMessages = true;
			var message = MESSAGE_QUEUE.shift();
			//Allow filters to process (or squash) messages
			var send_message = true;
			for(filter_index in FILTERS) {
				var filter = FILTERS[filter_index];
				if (listensFor(message,filter)) {
				  var result = filter.callback.call(this, message);
				  if (result != null && !result) {
            send_message = false;
            break;
          }
				}
			}
			//If the message was not squashed by an interceptor, let the listeners process it
			if (send_message) {
				for(listener_index in LISTENERS) {
					var listener = LISTENERS[listener_index];
					if (listensFor(message,listener)) {
					  listener.callback.call(this, message);
					}
				}
			}
		}
		//Scan the queue again using the configured value
		setTimeout(deliver, App.mq.config.scan_interval);
	};
	
	//Determine whether or not the given listener listens for the given message
	function listensFor(message, listener) {
	  var listens = false;
	  if (message.scope === listener.scope) {
      if ((listener.pattern.test && listener.pattern.test(message.name)) ||
			  (listener.pattern === message.name )) {
				listens = true;
			}
    }
	  return listens;
	};
	
	
	//Publish a message to the message queue
  App.mq.pub = function(_name,_payload,_args) {
    var message = App.mq.api.extend({
      name: _name,
      payload: (_payload) ? _payload : {},
      scope: "appcelerator"
    },_args||{});
    MESSAGE_QUEUE.push(message);
  };
  
  //Subscribe to a message
  App.mq.sub = function(_pattern,_callback,_args) {
    var listener = App.mq.api.extend({
      pattern: _pattern,
      callback: _callback,
      scope: "appcelerator",
      handle: "listener"+Math.random().toString()
    },_args||{});
    LISTENERS.push(listener);
    return listener;
  };
  
  //Remove an event listener
  App.mq.unsub = function(_listener) {
		for(listener_index in LISTENERS) {
			var current = LISTENERS[listener_index];
			if (_listener.handle === current.handle) {
				LISTENERS.splice(listener_index,1);
			}
		}
  };
  
  //Filter a message
  App.mq.filter = function(_pattern,_callback,_args) {
    var filter = App.mq.api.extend({
      pattern: _pattern,
      callback: _callback,
      scope: "appcelerator",
      handle: "filter"+Math.random().toString()
    },_args||{});
    FILTERS.push(filter);
    return filter;
  };
  
  //Remove a message filter
  App.mq.unfilter = function(_filter) {
		for(filter_index in FILTERS) {
			var current = FILTERS[filter_index];
			if (_filter.handle === current.handle) {
				FILTERS.splice(filter_index,1);
			}
		}
  };
  
  //begin first queue scan
  deliver();
})();

//Define convenience macros for main MQ API
function $MQ(_name,_payload,_args) {
  App.mq.pub(_name,_payload,_args);
}
function $MQL(_pattern,_callback,_args) {
  return App.mq.sub(_pattern,_callback,_args);
}


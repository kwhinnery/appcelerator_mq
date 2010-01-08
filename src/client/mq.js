(function() {  
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
		setTimeout(deliver, mq.config.scan_interval);
	}
	
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
	}
	
	
	//Publish a message to the message queue
  mq.extend(true, {
    config: {
      scan_interval: 150 //amount of time between queue scans
    },
    pub: function(_name_or_message,_payload,_args) {
      var message = null;
      if (typeof _name_or_message == 'string') {
        message = mq.extend({
          name: _name_or_message,
          payload: (_payload) ? _payload : {},
          scope: "default"
        },_args||{});
      }
      else {
        message = mq.extend({
          name: "message",
          payload: {},
          scope: "default"
        },_name_or_message);
      }
      MESSAGE_QUEUE.push(message);
    },
    sub: function(_pattern,_callback,_args) {
      var listener = mq.extend({
        pattern: _pattern,
        callback: _callback,
        scope: "default",
        handle: "listener"+Math.random().toString()
      },_args||{});
      LISTENERS.push(listener);
      return listener;
    },
    unsub: function(_listener) {
  		for(listener_index in LISTENERS) {
  			var current = LISTENERS[listener_index];
  			if (_listener.handle === current.handle) {
  				LISTENERS.splice(listener_index,1);
  			}
  		}
    },
    filter: function(_pattern,_callback,_args) {
      var filter = mq.extend({
        pattern: _pattern,
        callback: _callback,
        scope: "default",
        handle: "filter"+Math.random().toString()
      },_args||{});
      FILTERS.push(filter);
      return filter;
    },
    unfilter: function(_filter) {
  		for(filter_index in FILTERS) {
  			var current = FILTERS[filter_index];
  			if (_filter.handle === current.handle) {
  				FILTERS.splice(filter_index,1);
  			}
  		}
    }
  });
  
  //begin first queue scan
  deliver();
})();


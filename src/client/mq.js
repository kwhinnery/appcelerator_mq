(function() {  
  //Implement MQ API
	var MESSAGE_QUEUE = []; //this array represents the current message queue
	var LISTENERS = []; //this array represents the message listeners
	
	//Scan the message queue and deliver messages to listeners
	function deliver() {
		while (MESSAGE_QUEUE.length > 0) {
			var message = MESSAGE_QUEUE.shift();
			for(listener_index in LISTENERS) {
				var listener = LISTENERS[listener_index];
				if (listensFor(message,listener)) {
				  //execute listener, break if a true is returned
				  if (listener.callback.call(this, message) == true) {
				    break;
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
        priority: -1,
        handle: "listener"+Math.random().toString()
      },_args||{});
      LISTENERS.push(listener);
      //sort according to priority, highest coming first
      LISTENERS.sort(function(a,b) {
        return b.priority - a.priority;
      });
      return listener;
    },
    unsub: function(_listener) {
  		for(listener_index in LISTENERS) {
  			var current = LISTENERS[listener_index];
  			if (_listener.handle === current.handle) {
  				LISTENERS.splice(listener_index,1);
  			}
  		}
    }
  });
  
  //begin first queue scan
  deliver();
})();


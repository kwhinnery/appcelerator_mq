/*!
 * Copyright 2009 Appcelerator, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * Appcelerator Message Queue (Appcelerator MQ)
 * --------------------------------------------
 * Author: 
 * Appcelerator Inc.
 *
 * Description: 
 * Lightweight message queue implementation for client side UI programming.
 * Features pub/sub message architecture with a simple JavaScript API.
 * This file has three parts:
 * 1.) A JSON library adapted from http://www.json.org
 * 2.) A wrapper for ajax and other utility methods from a variety of libraries
 * 3.) The message queue implementation
 *
 **/
(function() {
  //Define necessary 'App' namespaces
  window.App = (typeof App == "undefined")?{}:App;
  window.App.mq = {};
  
  //JSON parser and stringifier based on json2.js from http://www.json.org
  if (!App.mq.JSON) {
      App.mq.JSON = {};
  }
  function f(n) {
    // Format integers to have at least two digits.
    return n < 10 ? '0' + n : n;
  }

  if (typeof Date.prototype.toJSON !== 'function') {
    Date.prototype.toJSON = function (key) {
      return this.getUTCFullYear()   + '-' +
      f(this.getUTCMonth() + 1) + '-' +
      f(this.getUTCDate())      + 'T' +
      f(this.getUTCHours())     + ':' +
      f(this.getUTCMinutes())   + ':' +
      f(this.getUTCSeconds())   + 'Z';
    };

    String.prototype.toJSON =
    Number.prototype.toJSON =
    Boolean.prototype.toJSON = function (key) {
      return this.valueOf();
    };
  }

  var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
  escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
  gap,
  indent,
  meta = {    // table of character substitutions
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '"' : '\\"',
    '\\': '\\\\'
  },
  rep;
  
  function quote(string) {
    // If the string contains no control characters, no quote characters, and no
    // backslash characters, then we can safely slap some quotes around it.
    // Otherwise we must also replace the offending characters with safe escape
    // sequences.

    escapable.lastIndex = 0;
    return escapable.test(string) ?
    '"' + string.replace(escapable, function (a) {
      var c = meta[a];
      return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
    }) + '"' : '"' + string + '"';
  }


  function str(key, holder) {
    // Produce a string from holder[key].
    var i,          // The loop counter.
      k,          // The member key.
      v,          // The member value.
      length,
      mind = gap,
      partial,
      value = holder[key];

      // If the value has a toJSON method, call it to obtain a replacement value.
      //CHANGE FOR MQ - don't trust underlying toJSON functions for Prototype or MooTools
      //as they have a broken toJSON implementation

      if (value && typeof value === 'object' &&
        typeof value.toJSON === 'function'
        && typeof(window.Prototype) === 'undefined'
        && typeof(window.MooTools) === 'undefined') {
        value = value.toJSON(key);
      }

      // If we were called with a replacer function, then call the replacer to
      // obtain a replacement value.

      if (typeof rep === 'function') {
        value = rep.call(holder, key, value);
      }

      // What happens next depends on the value's type.

      switch (typeof value) {
        case 'string':
          return quote(value);

        case 'number':

          // JSON numbers must be finite. Encode non-finite numbers as null.
          return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

          // If the value is a boolean or null, convert it to a string. Note:
          // typeof null does not produce 'null'. The case is included here in
          // the remote chance that this gets fixed someday.

          return String(value);

        // If the type is 'object', we might be dealing with an object or an array or
        // null.
        case 'object':

        // Due to a specification blunder in ECMAScript, typeof null is 'object',
        // so watch out for that case.

        if (!value) {
          return 'null';
        }

        // Make an array to hold the partial results of stringifying this object value.

        gap += indent;
        partial = [];

        // Is the value an array?

        if (Object.prototype.toString.apply(value) === '[object Array]') {
          // The value is an array. Stringify every element. Use null as a placeholder
          // for non-JSON values.

          length = value.length;
          for (i = 0; i < length; i += 1) {
            partial[i] = str(i, value) || 'null';
          }

          // Join all of the elements together, separated with commas, and wrap them in
          // brackets.
          v = partial.length === 0 ? '[]' :
          gap ? '[\n' + gap +
          partial.join(',\n' + gap) + '\n' +
          mind + ']' :
          '[' + partial.join(',') + ']';
          gap = mind;
          return v;
        }

        // If the replacer is an array, use it to select the members to be stringified.

        if (rep && typeof rep === 'object') {
          length = rep.length;
          for (i = 0; i < length; i += 1) {
            k = rep[i];
            if (typeof k === 'string') {
              v = str(k, value);
              if (v) {
                partial.push(quote(k) + (gap ? ': ' : ':') + v);
              }
            }
          }
        } else {

          // Otherwise, iterate through all of the keys in the object.

          for (k in value) {
            if (Object.hasOwnProperty.call(value, k)) {
              v = str(k, value);
              if (v) {
                partial.push(quote(k) + (gap ? ': ' : ':') + v);
              }
            }
          }
        }

        // Join all of the member texts together, separated with commas,
        // and wrap them in braces.

        v = partial.length === 0 ? '{}' :
        gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
        mind + '}' : '{' + partial.join(',') + '}';
        gap = mind;
        return v;
      }
    }

    // If the JSON object does not yet have a stringify method, give it one.
    if (typeof App.mq.JSON.stringify !== 'function') {
      App.mq.JSON.stringify = function (value, replacer, space) {
        // The stringify method takes a value and an optional replacer, and an optional
        // space parameter, and returns a JSON text. The replacer can be a function
        // that can replace values, or an array of strings that will select the keys.
        // A default replacer method can be provided. Use of the space parameter can
        // produce text that is more easily readable.
        var i;
        gap = '';
        indent = '';
        // If the space parameter is a number, make an indent string containing that
        // many spaces.

        if (typeof space === 'number') {
          for (i = 0; i < space; i += 1) {
            indent += ' ';
          }

          // If the space parameter is a string, it will be used as the indent string.

        } else if (typeof space === 'string') {
          indent = space;
        }

        // If there is a replacer, it must be a function or an array.
        // Otherwise, throw an error.

        rep = replacer;
        if (replacer && typeof replacer !== 'function' &&
          (typeof replacer !== 'object' ||
          typeof replacer.length !== 'number')) {
          throw new Error('App.mq.JSON.stringify');
        }

        // Make a fake root object containing our value under the key of ''.
        // Return the result of stringifying the value.

        return str('', {'': value});
      };
    }


    // If the JSON object does not yet have a parse method, give it one.

    if (typeof App.mq.JSON.parse !== 'function') {
      App.mq.JSON.parse = function (text, reviver) {

        // The parse method takes a text and an optional reviver function, and returns
        // a JavaScript value if the text is a valid JSON text.

        var j;

        function walk(holder, key) {

          // The walk method is used to recursively walk the resulting structure so
          // that modifications can be made.

          var k, v, value = holder[key];
          if (value && typeof value === 'object') {
            for (k in value) {
              if (Object.hasOwnProperty.call(value, k)) {
                v = walk(value, k);
                  if (v !== undefined) {
                    value[k] = v;
                  } else {
                    delete value[k];
                  }
                }
              }
            }
            return reviver.call(holder, key, value);
          }


          // Parsing happens in four stages. In the first stage, we replace certain
          // Unicode characters with escape sequences. JavaScript handles many characters
          // incorrectly, either silently deleting them, or treating them as line endings.

          cx.lastIndex = 0;
          if (cx.test(text)) {
            text = text.replace(cx, function (a) {
            return '\\u' +
            ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
          });
      }

          // In the second stage, we run the text against regular expressions that look
          // for non-JSON patterns. We are especially concerned with '()' and 'new'
          // because they can cause invocation, and '=' because it can cause mutation.
          // But just to be safe, we want to reject all unexpected forms.

          // We split the second stage into 4 regexp operations in order to work around
          // crippling inefficiencies in IE's and Safari's regexp engines. First we
          // replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
          // replace all simple value tokens with ']' characters. Third, we delete all
        // open brackets that follow a colon or comma or that begin the text. Finally,
        // we look to see that the remaining characters are only whitespace or ']' or
        // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

      if (/^[\],:{}\s]*$/.
          test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
          replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
          replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

        // In the third stage we use the eval function to compile the text into a
        // JavaScript structure. The '{' operator is subject to a syntactic ambiguity
        // in JavaScript: it can begin a block or an object literal. We wrap the text
        // in parens to eliminate the ambiguity.

        j = eval('(' + text + ')');

        // In the optional fourth stage, we recursively walk the new structure, passing
        // each name/value pair to a reviver function for possible transformation.

        return typeof reviver === 'function' ?
        walk({'': j}, '') : j;
      }

      // If the text is not JSON parseable, then a SyntaxError is thrown.

      throw new SyntaxError('App.mq.JSON.parse');
    };
  }
  
  /* ------------------------- */
  /* BEGIN AJAX API ADAPTATION */
  /* ------------------------- */
  
  //Create Ajax library wrappers for use by MQ
  window.App.mq.api = {
    _adapter: null,
    ajax: function(params) {
      params = App.mq.api.extend({
        method: 'GET',
        url: '/',
        headers: {},
        data: null,
        success: function(){},
        error: function(){}
      }, params);
      App.mq.api._adapter.ajax(params);
    },
    extend: function(defaults, args) {
      return App.mq.api._adapter.extend(defaults, args);
    },
    onload: function(callback) {
      App.mq.api._adapter.onload(callback);
    },
    _jQueryAdapter: {
      ajax: function (params) {
        jQuery.ajax({
          type: params['method'],
          url: params['url'],
          beforeSend: function(xhr) {
            for(var header in params['headers']) {
              xhr.setRequestHeader(header, params['headers'][header]);
            }
          },
          data: params['data'],
          success: function(data, status) {
            params['success'](data);
          },
          error: function(xhr, status, errorMsg) {
            params['error'](xhr);
          }
        });
      },
      extend: function(defaults, args) {
        return jQuery.extend(defaults, args);
      },
      onload: function (callback) {
        jQuery(callback);
      }
    },
    _PrototypeAdapter: {
      ajax: function (params) {
        new Ajax.Request(params['url'], {
          method: params['method'],
          requestHeaders: params['headers'],
          postBody: params['data'],
          onSuccess: function(xhr) {
            params['success'](xhr.responseText);
          },
          onFailure: function(xhr) {
            params['error'](xhr);
          }
        });
      },
      extend: function(defaults, args) {
        return Object.extend(defaults, args);
      },
      onload: function (callback) {
        Event.observe(window, 'load', callback);
      }
    },
    _DojoAdapter: {
      ajax: function (params) {
        dojo.xhr(params['method'], {
          url: params['url'],
          headers: params['headers'],
          content: params['data'],
          load: function(data, ioArgs) {
            params['success'](data);
          },
          error: function(data, ioArgs) {
            params['error'](ioArgs.xhr);
          }
        },(params['method'].toUpperCase() === 'POST' || params['method'].toUpperCase() === 'PUT'));
      },
      extend: function(defaults, args) {
        for (var i in defaults) {
          if (!args[i]) {
            args[i] = defaults[i];
          }
        }
        return args;
      },
      onload: function (callback) {
        dojo.addOnLoad(callback);
      }
    },
    _MooToolsAdapter: {
      ajax: function (params) {
        var myRequest = new Request({
          method: params['method'],
          url: params['url'],
          headers: params['headers'],
          data: params['data'],
          evalScripts: false,
          onSuccess: function(data, dataXml) {
            params['success'](this.response.text);
          },
          onFailure: function(xhr) {
            params['error'](xhr);
          }
        });
        myRequest.send();
      },
      extend: function(defaults, args) {
        return $extend(defaults, args);
      },
      onload: function (callback) {
        window.addEvent('load', callback);
      }
    }
  };
  if (typeof(window.jQuery) != 'undefined') {
    App.mq.api._adapter = App.mq.api._jQueryAdapter;
  } else if (typeof(window.Prototype) != 'undefined') {
    App.mq.api._adapter = App.mq.api._PrototypeAdapter;
  } else if (typeof(window.dojo) != 'undefined') {
    App.mq.api._adapter = App.mq.api._DojoAdapter;
  } else if (typeof(window.MooTools) != 'undefined') {
    App.mq.api._adapter = App.mq.api._MooToolsAdapter;
  } else {
    document.write('<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js"></script>');
    App.mq.api._adapter = App.mq.api._jQueryAdapter;
  }
  
  /* ----------------------- */
  /* BEGIN MQ IMPLEMENTATION */
  /* ----------------------- */
  
  //MQ configuration options
  App.mq.config = {
    scan_interval: 150, //amount of time between queue scans
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
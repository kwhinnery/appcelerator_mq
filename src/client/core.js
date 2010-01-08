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
 * Lightweight client-side or client-server message queue
 *
 **/
(function() {
  window.mq = {};
  // The following are, um, adapted from jQuery Core
  // Extend serves two functions - 1 to extend an object with the properties of another, and 2
  // to alow mq to be extended.
  mq.extend = function() {
    // copy reference to target object
    var target = arguments[0] || {}, i = 1, length = arguments.length, deep = false, options, name, src, copy;

    // Handle a deep copy situation
    if ( typeof target === "boolean" ) {
      deep = target;
      target = arguments[1] || {};
      // skip the boolean and the target
      i = 2;
    }

    // Handle case when target is a string or something (possible in deep copy)
    if ( typeof target !== "object" && !mq.isFunction(target) ) {
      target = {};
    }

    // extend mq itself if only one argument is passed
    if ( length === i ) {
      target = this;
      --i;
    }

    for ( ; i < length; i++ ) {
      // Only deal with non-null/undefined values
      if ( (options = arguments[ i ]) != null ) {
        // Extend the base object
        for ( name in options ) {
          src = target[ name ];
          copy = options[ name ];

          // Prevent never-ending loop
          if ( target === copy ) {
            continue;
          }

          // Recurse if we're merging object values
          if ( deep && copy && typeof copy === "object" && !copy.nodeType ) {
            var clone;

            if ( src ) {
              clone = src;
            } else if ( mq.isArray(copy) ) {
              clone = [];
            } else if ( mq.isObject(copy) ) {
              clone = {};
            } else {
              clone = copy;
            }

            // Never move original objects, clone them
            target[ name ] = mq.extend( deep, clone, copy );

            // Don't bring in undefined values
          } else if ( copy !== undefined ) {
            target[ name ] = copy;
          }
        }
      }
    }

    // Return the modified object
    return target;
  };

  //Add top-level utility functions
  mq.extend({
    isFunction: function( obj ) {
      return toString.call(obj) === "[object Function]";
    },

    isArray: function( obj ) {
      return toString.call(obj) === "[object Array]";
    },

    isObject: function( obj ) {
      return this.constructor.call(obj) === Object;
    }
  });
})();
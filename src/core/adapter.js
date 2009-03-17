(function() {
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
})();


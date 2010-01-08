(function() {
  //shortcuts for typing purposes
  var assert = TinyTest.assert;
  var done = TinyTest.done;
  var warn = TinyTest.warn;
  
  //register unit tests
  TinyTest.registerTests([ 
    {
      name: "Core API - Extend Function",
      suite: "core",
      unit_test: function() {
        var defaultsSet = false;
        var defaultOverridden = false;
        var objectExtended = false;
        
        var toExtend = {
          value2:"override",
          value3:true
        };
        
        var extended = mq.extend({
          value1:"value1",
          value2:"value2"
        },toExtend);
        
        if (extended.value1 === "value1") {
          defaultsSet = true;
        }
        if (extended.value2 === "override") {
          defaultOverridden = true;
        }
        if (extended.value3) {
          objectExtended = true;
        }
        
        assert(defaultsSet,"Object defaults set properly.");
        assert(defaultOverridden,"Object default overridden properly.");
        assert(objectExtended,"Object extended with additional values.");
        done();
      }
    },
    {
      name: "JSON API Tests",
      suite: "core",
      unit_test: function() {
        var toStringGood = false;
        var parseGood = false;
        
        var tostring = { foo: "bar", foo2: [{foo3:true}] };
        var json = mq.JSON.stringify(tostring);
        toStringGood = json === '{"foo":"bar","foo2":[{"foo3":true}]}';
        
        var fromstring = mq.JSON.parse(json);
        if (fromstring.foo === "bar" && fromstring.foo2[0].foo3) {
          parseGood = true;
        }
        
        assert(toStringGood,"JSON.stringify looking good.");
        assert(parseGood,"JSON.parse looking good.");
        done();
      }
    },
    {
      name: "MQ API - Direct Publish and Subscribe",
      suite: "mq",
      unit_test: function() {
        var matchWorked = false;
        var noMatchWorked = true;
        
        mq.sub("test1", function(message) {
          matchWorked = true;
        });
        
        mq.sub("testXXXXXX", function(message) {
          noMatchWorked = false;
        });
        
        mq.pub("test1");
        
        setTimeout(function() {
          assert(matchWorked, "Direct subscribe worked.");
          assert(noMatchWorked, "Direct subscribe does not catch all.");
          done();
        },333);
      }
    },
    {
      name: "MQ API - RegExp Subscribe",
      suite: "mq",
      unit_test: function() {
        var matchWorked = false;
        var noMatchWorked = true;
        
        mq.sub(/test.*/, function(message) {
          matchWorked = true;
        });
        
        mq.sub(/fest.*/, function(message) {
          noMatchWorked = false;
        });
        
        mq.pub("testregex");
        
        setTimeout(function() {
          assert(matchWorked, "RegExp subscribe worked");
          assert(noMatchWorked, "Non-matching RegExp not matched");
          done();
        },333);
      }
    },
    {
      name: "MQ API - Using payloads",
      suite: "mq",
      unit_test: function() {
        var deilvered = false;
        
        mq.sub("test.payload", function(message) {
          delivered = message.payload.foo;
        });
        
        mq.pub("test.payload", {foo:true});
        
        setTimeout(function() {
          assert(delivered, "Payload sent and received.");
          done();
        },333);
      }
    },
    {
      name: "MQ API - Using scopes",
      suite: "mq",
      unit_test: function() {
        var scopeWorked = false;
        var noScopeWorked = true;
        
        mq.sub("test.scope", function(message) {
          scopeWorked = true;
        },{scope:"myscope"});
        
        mq.sub("test.scope", function(message) {
          noScopeWorked = false;
        });
        
        mq.pub("test.scope", {}, {scope:"myscope"});
        
        setTimeout(function() {
          assert(scopeWorked, "Scoped message received.");
          assert(noScopeWorked, "Scoped message NOT received.");
          done();
        },333);
      }
    },
    {
      name: "MQ API - Testing unsubscribe",
      suite: "mq",
      unit_test: function() {
        var unsubbed = true;
        
        var listener = mq.sub("unsub", function(message) {
          unsubbed = false;
        });
        
        mq.unsub(listener);
        
        mq.pub("unsub");
        
        setTimeout(function() {
          assert(unsubbed, "Message Unsubscribed Successfully.");
          done();
        },333);
      }
    },
    {
      name: "MQ API - Testing listener priority",
      suite: "mq",
      unit_test: function() {
        var priorityWorked = false;
        
        //this one should be executed second
        mq.sub("priority.message", function(msg) {
          if (msg.foobar == true) {
            priorityWorked = true;
          }
        });
        
        //this one should go first
        mq.sub("priority.message", function(msg) {
          msg.foobar = true;
        }, {
          priority: 1 //1 should be better than the default of -1
        });
        
        mq.pub("priority.message");
        
        setTimeout(function() {
          assert(priorityWorked, "Listener priority set successfully");
          done();
        },500);
      }
    },
    {
      name: "MQ API - Configure queue scan interval",
      suite: "mq",
      unit_test: function() {
        var delivered = false;
        
        mq.config.scan_interval = 3000;
        
        setTimeout(function() {
          mq.sub("slowscan", function(message) {
            delivered = true;
          });
          mq.pub("slowscan");
        },500);
        
        setTimeout(function() {
          assert(!delivered, "Message should NOT have been delivered yet");
        },1000);
        
        setTimeout(function() {
          assert(delivered, "Message Queue scan interval configured successfully");
          mq.config.scan_interval = 150;
          done();
        },4000);
      }
    }
  ]);
})();
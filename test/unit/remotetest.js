(function() {  
  if (window.location.href.indexOf("file:") == 0) {
    // NO OP - possibly do something here to indicate remote doesn't work from local file?
  }
  else {
    //shortcuts for typing purposes
    var assert = TinyTest.assert;
    var done = TinyTest.done;
    var warn = TinyTest.warn;
    
    //register unit tests
    TinyTest.registerTests([ 
      {
        name: "Remote Messages - Test Hello World",
        suite: "remote",
        unit_test: function() {
          var receivedWithPayload = false;
          var scopeWorked = true;

          //Should receive response
          mq.sub("r:say.hello.response",function(msg) {
            if (msg.payload == "Hello World!") {
              receivedWithPayload = true;
            }
          });

          //Should NOT receive response due to scope
          mq.sub("r:say.hello.response",function(msg) {
            scopeWorked = false;
          },{
            scope:"myscope"
          });

          //Send remote message
          mq.pub("r:say.hello.request");

          //Test after we've had some time to get a response
          setTimeout(function() {
            assert(receivedWithPayload, "Remote response received with proper payload.");
            assert(scopeWorked, "Remote response has proper default scope assigned");
            done();
          },3000);
        }
      },
      {
        name: "Remote Messages - Test server side filters",
        suite: "remote",
        unit_test: function() {
          assert(true,"");
          done();
        }
      }
    ]);
  }
})();
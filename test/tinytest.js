(function() {
  window.TinyTest = {};
  //---------------------------
  //Test harness implementation
  //---------------------------  
  var unit_tests = [];
  var tests_executed = 0; 
  var assertions = 0;
  var successes = 0;
  var failures = 0;
  var warnings = 0;
  var executing = false;
  
  //print status message
  TinyTest.status = function(message) {
    var inner = document.getElementById("resultlist").innerHTML;
    inner = inner+"<li class='status'>"+message+"</li>";
    document.getElementById("resultlist").innerHTML = inner;
  };
  
  //print failure
  TinyTest.fail = function(message) {
    assertions=assertions+1;
    failures=failures+1;
    var inner = document.getElementById("resultlist").innerHTML;
    inner = inner+"<li class='failure'>"+message+"</li>";
    document.getElementById("resultlist").innerHTML = inner;
  };
  
  //print warning
  TinyTest.warn = function(message) {
    warnings=warnings+1;
    var inner = document.getElementById("resultlist").innerHTML;
    inner = inner+"<li class='warn'>"+message+"</li>";
    document.getElementById("resultlist").innerHTML = inner;
  };
  
  //print success
  TinyTest.success = function(message) {
    assertions++;
    successes++;
    var inner = document.getElementById("resultlist").innerHTML;
    inner = inner+"<li class='success'>"+message+"</li>";
    document.getElementById("resultlist").innerHTML = inner;
  };
  
  //assert a test condition, and display feedback
  TinyTest.assert = function(value,description) {    
    if (value) {
      TinyTest.success(description);
    }
    else {
      TinyTest.fail("Assertion Failed: "+description);
    }
  };
  
  //end current test
  TinyTest.done = function() {
    executing = false;
  };
  
  //print summary
  function end() {
    var inner = "<h3 class='summary'>Test Suite Summary:</h3>"+
      "<div class='summary'>"+
      tests_executed+ " tests ("+
      assertions+" assertions) completed with <span class='success'>"+
      successes+" successes</span>, <span class='warn'>"+ 
      warnings+" warnings</span>, and <span class='failure'>"+
      failures+" failures</span>. <br/><br/>  Have a nice day!</div>";
    document.getElementById("status").innerHTML = inner;
  }  
  
  //register an array of unit tests
  TinyTest.registerTests = function(tests) {
    unit_tests = unit_tests.concat(tests);
  };
  
  window.onload = function() {
    //Get unit test suite from URL parameter (optional - will run all by default)
    var regexS = "[\\?&]suite=([^&#]*)";
    var regex = new RegExp( regexS );
    var results = regex.exec( window.location.href );
    var suite = null;
    if( results != null ) {
      suite = results[1];
    }

    //Start running through tests
    var timer = setInterval(function() {
      if (unit_tests.length == 0 && !executing) {
        clearInterval(timer);
        end();
      }
      if (!executing && unit_tests.length > 0) {
        executing = true;
        var tst = unit_tests.shift();
        if (suite == null || tst.suite == suite) {
          TinyTest.status("Executing test: '"+ tst.name +"'...");
          tst.unit_test.call({});
          tests_executed++;
        }
        else {
          executing = false;
        }
      }
    },10);
  };
  
})();
#Appcelerator Message Queue (MQ)#
Appcelerator MQ is a simple client-side message bus for HTML/JavaScript applications
which enables true event-driven UI programming in the browser.  Appcelerator MQ works
alongside several popular DOM Manipulation and Ajax libraries, including the following:

* jQuery (1.2.6 and 1.3.2) - 1.3.2 is loaded by default if none present
* Dojo (1.2.3)
* MooTools (1.2.1)
* Prototype (1.6.0.3)
  
MQ provides a publish/subscribe style of event handling through static functions like so:

Publish:

    $MQ("my.message");

Subscribe:

    $MQL("my.message", function(message) {
      alert("Event-driven UI is super awesome!");
    });

##Building:##

Appcelerator MQ is built using Rake (a Ruby build tool).  To build MQ, you will need to
install a Ruby interpreter for you system is one is not installed.  You will also need
RubyGems to install the `rake` and `rubyzip` gems.  Once these items are installed, you can
build Appcelerator MQ by running the `rake` command from the project root:

    rake [optional target]
    
Available tasks are `stage` (to create JS files for testing) and `package` (to create Zip
files from the staged JS files).  `rake`  with no arguments calls both tasks.

##Contributing:##

If you're interested in contributing to Appcelerator MQ, please contact Kevin
Whinnery (kevin.whinnery@gmail.com).
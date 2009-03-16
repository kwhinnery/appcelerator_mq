#Appcelerator Message Queue (MQ)#
Appcelerator MQ is a simple client-side message bus for HTML/JavaScript applications
which enables true event-driven UI programming in the browser.  MQ provides a
publish/subscribe style of event handling through static functions like so:

Publish:

    $MQ("my.message");

Subscribe:

    $MQL("my.message", function(message) {
      alert("Event-driven UI is super awesome!");
    });

##Building:##

To create a compressed version of the plug-in from source, navigate to the 
top-level project directory and execute the following command to create a
compressed file called 'mq.min.js':

    java -jar yuicompressor-2.3.6.jar mq.js -o mq.min.js

##Contributing:##

If you're interested in contributing to Appcelerator MQ, please contact Kevin
Whinnery (kevin.whinnery@gmail.com).
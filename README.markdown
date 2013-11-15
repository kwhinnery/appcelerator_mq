#Appcelerator Message Queue (MQ)

Appcelerator MQ is a simple client-server message bus for HTML/JavaScript applications
(and soon Adobe Flex applications) which enables event-driven RIAs.  MQ can be used on 
the client side only, or can be used in conjunction with a server-side listener to provide
transparent messaging between client and server.  Current and planned server-side message
listeners are provided for:

* Java Servlets (Standard container or Google App Engine for Java)
* Planned support for Sinatra (a super lightweight Ruby web framework)
* Planned support for plain 'ol PHP
  
Official docs and more info are coming soon to [Codestrong](http://www.codestrong.com).

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
Whinnery (kwhinnery@appcelerator.com).

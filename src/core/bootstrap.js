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
 *
 **/
(function() {
  //Define necessary 'App' namespaces
  window.App = (typeof App == "undefined")?{}:App;
  window.App.mq = {};
  
  //JSON parser and stringifier based on json2.js from http://www.json.org
  App.mq.JSON = {};
  
  //Adapters for 3rd party Ajax Libraries
  App.mq.api = {};
})();


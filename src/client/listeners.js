//Implement core listeners for remote and ajax messages
(function() {
  //Add endpoint to mq config
  mq.extend(mq.config,{
    endpoint:"/mq"
  });
  
  //implement remote message listener - dispatch to server-side message queue
  mq.sub(/r:.*\.request/, function(msg) {
    //Use bundled cross-browser XHR to contact server side listener
    var xhr = new XMLHttpRequest();
    xhr.open("POST", mq.config.endpoint);
    xhr.setRequestHeader("Content-Type","application/json");
    xhr.onreadystatechange = function() {
      if (this.readyState == XMLHttpRequest.DONE) {
        if (this.status == 200) {
          var responseMessage = mq.JSON.parse(this.responseText);
          mq.pub(responseMessage);
        }
      }
    };
    xhr.send(mq.JSON.stringify(msg));
  });
})();
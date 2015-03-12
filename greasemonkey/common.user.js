// ==UserScript==
// @name         FFive common
// @namespace    http://gjn.ch
// @version      0.2
// @description  Releoad ffive triggered pages
// @author       Gilbert Jeiziner
// @match        http://*.dev.bgdi.ch/ltjeg/*$
// @grant        none
// ==/UserScript==

(function() {
    // Change port/address if needed 
    var socket = new WebSocket("ws://127.0.0.1:9014/");
    
    socket.onopen = function(evt) {
        socket.send('Open connection from: ' + window.location.href);
    };
    
    socket.onerror = function(evt) {
        console.log(evt);
    };
    
    window.onbeforeunload = function() {
        socket.send('Close connection from: ' + window.location.href);
        socket.close();
        socket.onclose = function() {};
  };
    
    window.onerror = function(msg, url, lineNumber) {
        socket.send(JSON.stringify({
            "type": "error",
            "message": msg,
            "url": url,
            "lineNumber": lineNumber
        }));
        return false;
    }
    
    window.ffive = {};
    window.ffive.socket = socket;
})();


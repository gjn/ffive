// ==UserScript==
// @name         FFive chsdi3 reload
// @namespace    http://gjn.ch
// @version      0.1
// @description  Releoad mf-chsdi3 pages on changes
// @author       Gilbert Jeiziner
// @match        http://mf-chsdi3.dev.bgdi.ch/ltjeg/*$
// @grant        none
// ==/UserScript==

(function() {
    window.ffive.socket.onmessage = function(evt) {
        switch (evt.data) {
            case "ffive:ch3:done":
                window.location.reload();
                break;
            default:
                console.log(evt.data);
                break;
        }
    };
})();


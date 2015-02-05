// ==UserScript==
// @name         FFive src reload
// @namespace    http://gjn.ch
// @version      0.1
// @description  Releoad mf-geoadmin3 src page on changes
// @author       Gilbert Jeiziner
// @match        http://mf-geoadmin3.dev.bgdi.ch/ltjeg/src/*$
// @grant        none
// ==/UserScript==

(function() {
    window.ffive.socket.onmessage = function(evt) {
        switch (evt.data) {
            case "ffive:source":
               window.location.reload();
                break;
            default:
                console.log(evt.data);
                break;
        }
    };
})();


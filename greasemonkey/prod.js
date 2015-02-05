// ==UserScript==
// @name         FFive prod reload
// @namespace    http://gjn.ch
// @version      0.1
// @description  Releoad mf-geoadmin3 prod page on changes
// @author       Gilbert Jeiziner
// @match        http://mf-geoadmin3.dev.bgdi.ch/ltjeg*$
// @exclude    http://mf-geoadmin3.dev.bgdi.ch/ltjeg/src*$
// @grant        none
// ==/UserScript==

(function() {
    window.ffive.socket.onmessage = function(evt) {
        switch (evt.data) {
            case "ffive:prod":
                window.location.reload();
                break;
            default:
                console.log(evt.data);
                break;
        }
    };
})();


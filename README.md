# ffive

Ever tired of pressing F5 to refresh a WebPage you are
currently developing? Enter ffive.

ffive watches files. When it detects changes, it runs
some commands and informs about the progress via
websockets, which a browser can connect to.

ffive is configured with a configuration (see ffive.json).

## Prerequisites
- node
- tampermonkey (chrome) or greasemonkey (firefox) extensions

## Setup
In you console:
- Checkout the code using git clone.
- Run `npm install`

Adapt the configuration file `ffive.json`:
- Change the port (don't use 9014)
- Change chsdi3 buildout configuration file (don't use buildout_ltjeg.cfg)

In your browser:
- Make sure the tampermonkey/greasemonkey extensions are installed
- Install the user scripts by clicking the following links:
  https://raw.githubusercontent.com/gjn/ffive/master/greasemonkey/common.user.js
  https://raw.githubusercontent.com/gjn/ffive/master/greasemonkey/ch3.prod.user.js
  https://raw.githubusercontent.com/gjn/ffive/master/greasemonkey/ga3.prod.user.js
  https://raw.githubusercontent.com/gjn/ffive/master/greasemonkey/ga3.src.user.js
- Adapt the @match part in every file. Right now, it points to /ltjeg/ path.

Start ffive with `ffive index.js` and load your project in the browser.

Enjoy the auto-reloads.

### Remote machine
If you run ffive on a remote machine, make sure you create an ssh tunnel
using the port specified in the configuration.

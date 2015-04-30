// https setup: http://stackoverflow.com/questions/21397809/create-a-self-signed-ssl-cert-for-localhost-for-use-with-express-node
// and https://github.com/websockets/ws/blob/f429240aea5c2f49f77d29003681b5c352bbe263/examples/ssl.js
var fs = require('fs');
var dbg = require('debug');
var debounce = require('debounce');
var watch = require('watch');
var spawn = require('child_process').spawn;
var WebSocketServer = require('ws').Server;

dbg.enable('ffive');
var debug = dbg('ffive');

var conf = require('./ffive.json');

var httpServ = (conf.ssl) ? require('https') : require('http');
var app = null;

var procRequest = function(req, res) {
  debug('request recieved, doing nothing');
};

if (conf.ssl) {
  app = httpServ.createServer({
      key: fs.readFileSync(conf.ssl_key),
      cert: fs.readFileSync(conf.ssl_cert)
    }, procRequest);
} else {
  app = httpServ.createServer(procRequest);
}

var retval = app.listen(conf.port);
debug('retval for listen: ' + retval);

var wss = new WebSocketServer({ server:app });

wss.on('connection', function(ws) {
  debug('connection event');
  ws.on('message', function(msg) {
    debug(msg);
  });
});

wss.on('close', function() {
  debug('Connection closed from remote.');
});

var broadcast = function (data) {
  debug('Broadcasting: ffive:' + data);
  wss.clients.forEach(function (client) {
    client.send('ffive:' + data);
  });
};

var createRunner = function(dir, actions, strategy) {
  var running = false;
  var pending = false;
  //'current is always a codesmell. Promises might
  //be better way to handle action flow, but
  //for now, this will do
  var current = 0;

  var endRun = function() {
    current = 0;
    running = false;
    if (pending) {
      setTimeout(function() {
        pending = false;
        debug('Pending request detected. Relaunch!');
        run();
      }, 0);
    }
  };

  var cmd = undefined;
  var next = function() {
    if (!actions.length ||
        current >= actions.length) {
      endRun();
    } else {
      action = actions[current];
      if (action.pre) {
        broadcast(action.pre);
      }

      debug('Launch action: ' + action.cmd + ' ' + action.params[0] + ' in ' + dir);
      cmd = spawn(action.cmd, action.params, {
        stdio: 'inherit',
        cwd: dir
      });

      cmd.on('close', function(code, signal) {
        cmd = undefined;
        if (code !== 0) {
          if (code !== null) {
            broadcast(action.error);
          }
          if (signal !== null) {
            debug('Process aborted with ' + signal);
          }
          endRun();
        } else {
          broadcast(action.post);
          current += 1;
          next();
        }
      });
    }
  };

  var run = function() {
    if (running) {
      pending = true;
      if (strategy && strategy.length && cmd) {
        debug('Change detected, aborting process with ' + strategy);
        cmd.kill(strategy);
      }
    } else {
      running = true;
      next();
    }
  }

  return debounce(function() {
    run();
  }, 200);
};

var addWatch = function(w) {
  debug('Start whatching files in ' + w.directory);

  var runner = createRunner(w.directory + w.actiondir, w.actions, w.strategy);
  var exclude;
  if (w.exclude &&
      w.exclude.length) {
    exclude = new RegExp(w.exclude);
  }

  watch.watchTree(w.directory, {
    ignoreDotFiles: true,
    ignoreUnreadableDirectory: true,
    ignoreDirectoryPattern: /node_modules/,
    filter: function(file)  {
      if (exclude &&
          exclude.test(file)) {
        return false;
      }
      return true;
    },
    interval: 1000
  }, function(file, statfile, prevstatfile) {
    if ((typeof file) !== 'string') {
      return;
    };
    debug('File change detected for: ' + file);
    runner();
  });

}

for (var i = 0; i < conf.watchers.length; i++) {
  addWatch(conf.watchers[i]);
}

debug('Listening on port ' + conf.port + (conf.ssl ? ' [SSL]' : ''));


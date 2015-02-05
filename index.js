var debug = require('debug')('ffive');
var watch = require('watch');
var spawn = require('child_process').spawn;
var WebSocketServer = require('ws').Server;
var port = 9014;
var wss = new WebSocketServer({ port: port });

var pending = false;
var running = false;

wss.on('connection', function(ws) {
  ws.on('message', function(msg) {
    debug(msg);
  });
});

wss.on('close', function() {
  debug('Connection closed from remote.');
});

var broadcast = function (data) {
  debug('Broadcasting: ' + data);
  wss.clients.forEach(function (client) {
    client.send(data);
  });
};

var checkPendingRun = function() {
  running = false;
  if (pending) {
    pending = false;
    run();
  }
};

var run = function() {
  running = true;
  broadcast('ffive:source');

  debug('Launch: make dev');
  var make = spawn('make', ['dev'], {
    stdio: 'inherit',
    cwd: '/home/ltjeg/mf-geoadmin3'
  });

  make.on('close', function(code) {
    if (code !== 0) {
      broadcast('ffive:deverror ' + code);
      checkPendingRun();
    } else {
      broadcast('ffive:dev');

      debug('Launch: make prod');
      var prodmake = spawn('make', ['prod'], {
        stdio: 'inherit',
        cwd: '/home/ltjeg/mf-geoadmin3'
      });

      prodmake.on('close', function(code) {
        if (code !== 0) {
          broadcast('ffive:proderror ' + code);
          checkPendingRun();
        } else {
          broadcast('ffive:prod');

          debug('Launch: make all');
          var allmake = spawn('make', ['all'], {
            stdio: 'inherit',
            cwd: '/home/ltjeg/mf-geoadmin3'
          });

          allmake.on('close', function(code) {
            if (code !== 0) {
              broadcast('ffive:allerror ' + code);
            } else {
              broadcast('ffive:all');
            }
            checkPendingRun();
          });
        }
      });
    }
  });

};

var dir = '/home/ltjeg/mf-geoadmin3/src';

debug('Start whatching files in ' + dir);

watch.watchTree(dir, {
  ignoreDotFiles: true,
  ignoreUnreadableDirectory: true,
  ignoreDirectoryPattern: /node_modules/,
  filter: function(file)  {
    if (file.match(/(src\/TemplateCacheModule\.js|src\/index\.html|src\/mobile\.html|style\/app\.css|src\/print\.css|src\/deps\.js)$/g)) {
      return false;
    }
    return true;
  },
  interval: 1000
}, function(file, statfile, prevstatfile) {
  if ((typeof file) !== 'string') {
    return;
  };

  if (running) {
    pending = true;
  } else {
    debug('File change detected for: ' + file);
    run();
  }

});

debug('Listening on port ' + port);


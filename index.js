var debug = require('debug')('ffive');
var watch = require('watch');
var spawn = require('child_process').spawn;
var WebSocketServer = require('ws').Server
var wss = new WebSocketServer({ port: 9014 });

var pending = false;
var running = false;

wss.on('connection', function(ws) {
  debug('connection recieved');
  ws.on('message', function(msg) {
    debug('message recieved', msg);
  });
});

wss.on('close', function() {
  debug('connection closing remotely');
});

var broadcast = function (data) {
  debug('broadcasting data: ', data);
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

  debug('launch make dev');
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

      debug('launch make prod');
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

          debug('launch make all');
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

watch.watchTree('/home/ltjeg/mf-geoadmin3/src', {
  ignoreDotFiles: true,
  ignoreUnreadableDirectory: true,
  ignoreDirectoryPattern: /node_modules/,
  filter: function(file)  {
    if (file.match(/(src\/TemplateCacheModule\.js|src\/index\.html|src\/mobile\.html|style\/app\.css|src\/print\.css|src\/deps\.js)$/g)) {
      debug('Ignore file: ' + file);
      return false;
    }
    return true;
  },
  interval: 1000
}, function(file, statfile, prevstatfile) {
  if (running) {
    pending = true;
  } else {
    debug('File change detected for: ' + file);
    run();
  }

});




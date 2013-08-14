var http = require('http');
var debug = require('local-debug')('server');
var onRequest = require('./on-request');

module.exports = start;

function start (hostname, port) {
  debug('Running at http://%s:%d/', hostname, port);
  return http.createServer(onRequest).listen(port, hostname);
}

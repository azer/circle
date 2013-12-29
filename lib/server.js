var http = require('http');
var debug = require('local-debug')('server');
var routeMap = require("route-map");
var newResponse = require('./response');

module.exports = newServer;

function newServer (routes) {
  routes['/'] || (routes['/'] = welcome);

  var server = http.createServer(onRequest);
  var matchUrl = routeMap(routes);
  var endpoints = Object.keys(routes);
  var formats = {};

  newFormat('*', '*/*', formatResultAsJSON);

  return {
    server: server,
    start: start,
    format: newFormat
  };

  function onRequest (req, res) {
    var match = matchUrl(req.url);
    var accept = req.headers.Accept || req.headers.accept;

    newResponse(match, formatOf(match && match.pattern, accept ? accept.split(',') : []), req, res, function (error, reply, post, files) {
      if (error) return reply(error);
      (match ? match.fn : e404)(reply, match, post, files);
    });
  }

  function formatResultAsJSON (context, match) {
    var result = {
      contentType: 'text/javascript; charset=utf-8',
      response: JSON.stringify(context, null, '\t')
    };

    if (match && match.qs && match.qs.callback) {
      result.response = match.qs.callback + '(' + result.response +')';
    }

    return result;
  }

  function start (port, hostname) {
    debug('Running at http://%s:%d/', hostname, port);
    return !hostname ?
      server.listen(port) :
      server.listen(port, hostname);
  };

  function defaultFormatOf (route) {
    return formats[route] && formats[route]['*/*'] || formats['*']['*/*'];
  }

  function formatOf (route, expected) {
    var types = route && formats[route];

    var i = expected.length;
    var type;
    while (i--) {
      type = expected[i];
      if (types && types[type]) return types[type];
    }

    return defaultFormatOf(route);
  }

  function newFormat (route, type, fn) {
    formats[route] || (formats[route] = {});
    formats[route][type] = fn;
  }

  function welcome (reply) {
    reply(undefined, { welcome: true, endpoints: endpoints });
  }

  function e404 (reply) {
    reply({ 'message': { 'not-found': true } }, 404);
  }
}

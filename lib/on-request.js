var debug = require('local-debug')('on-request');
var getResources = require('./resources');
var newResponse = require('./response');

module.exports = onRequest;

function onRequest (req, res) {
  var url = req.url.slice(1).split('?')[0],
      parts = url.split('/').filter(notEmpty).map(decodeURIComponent),
      resources = getResources(),
      resourceName, resource, params;

  if (resources[parts[0]] || parts[0] == "favicon.ico" || parts[0] == "robots.txt") {
    resourceName = parts[0];
    params = parts.slice(1);
  } else if (resources['*']) {
    resourceName = '*';
    params = parts;
  }

  cutExtension(params);

  debug('Routing %s to %s', url, resourceName);

  resource = resources[resourceName] || e404;

  params.path = decodeURIComponent(url);
  params.request = req;

  resource(params, newResponse(req, res));
}

function notEmpty (el) {
  return el && el.length;
}

function cutExtension (params) {
  if (!params) return;

  var last = params[params.length - 1];

  if (!last) return;

  if (last.slice(-3) == '.js') {
    params[params.length - 1] = last.slice(0, -3);
    return;
  }

  if (last.slice(-5) == '.json') {
    params[params.length - 1] = last.slice(0, -5);
    return;
  }
}

function e404 (_, reply) {
  reply({ invalid_resource: true }, 404);
}

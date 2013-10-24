var parseURL = require('url').parse;
var version = readVersion();
var postdata = require('post-data');

module.exports = newResponse;

function newResponse (req, res, callback) {
  var url = parseURL(req.url, true);
  var qs = url.query;
  var jsonp = qs.callback;

  reply.url = url;
  reply.qs = url.query;
  reply.path = req.path;
  reply.request = req;

  if (req.method != 'POST') {
    return callback(undefined, reply);
  }

  postdata(req, function (error, fields, files) {
    if (error) return callback(error, reply);
    reply.input = fields;
    reply.files = files;
    callback(undefined, reply);
  });

  function reply (error, result, status) {
    var response;

    if (error && error.welcome) {
      status = 200;
      response = {
        welcome: true
      };
    } else if (error) {
      status = status || 500;
      response = {
        error: error.message
      };
    } else {
      status = 200;
      response = {
        ok: true,
        result: result
      };
    }

    if (version) {
      response['version'] = version;
    }

    res.writeHead(status, { 'Content-Type': 'text/javascript; charset=utf-8' });

    response = JSON.stringify(response, null, '\t');

    if (jsonp) {
      response = jsonp + '(' + response + ')';
    }

    res.end(response);
  }
}

function readVersion () {
  var ver;

  try {
    ver = require('../../package.json').version;
  } catch (err) {};

  return ver;
}

var parseURL = require('url').parse;
var postdata = require('post-data');
var path = require("path");

var version = readVersion();

module.exports = newResponse;

function newResponse (match, format, req, res, callback) {
  if (req.method != 'POST') {
    return callback(undefined, reply);
  }

  if (!match) return callback(undefined, reply);

  postdata(req, function (error, fields, files) {
    if (error) return callback(error, reply);
    callback(undefined, reply, fields, files);
  });

  function reply (error, result) {
    var context;
    var status = error ? result || 500 : 200;

    if (error) {
      context = {
        error: error.message
      };
    } else {
      context = {
        ok: true,
        result: result
      };
    }

    if (version) {
      context['version'] = version;
    }

    var output = format(context, match);
    res.writeHead(status, { 'Content-Type': output.contentType });
    res.end(output.response);
  }
}

function readVersion () {
  var ver;

  try {
    ver = require(path.join(__dirname, '../../package.json')).version;
  } catch (err) {};

  return ver;

}

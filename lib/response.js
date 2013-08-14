var parseURL = require('url').parse;

module.exports = newResponse;

function newResponse (req, res) {

  var qs = parseURL(req.url, true).query;
  var callback = qs.callback;

  return function (error, result, status) {
    var response;

    if (error) {
      status = status || 500;
      response = {
        error: error
      };
    } else {
      status = 200;
      response = {
        ok: true,
        result: result
      };
    }

    res.writeHead(status, { 'Content-Type': 'text/javascript; charset=utf-8' });

    response = JSON.stringify(response, null, '\t');

    if (callback) {
      response = callback + '(' + response + ')';
    }

    res.end(response);
  }
}

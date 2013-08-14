var resources = require("./lib/resources");
var server = require("./lib/server");

module.exports = function (map) {
  resources(map);
  return module.exports;
};

module.exports.start = server;

var assert = require('assert');
var extend = require('obj-extend');
var Lynx = require('lynx');

module.exports = function expressStatsdInit (options) {
  options = extend({
    requestKey: 'statsdKey',
    host: '127.0.0.1',
    port: 8125
  }, options);

  var client = options.client || new Lynx(options.host, options.port, options);

  return function expressStatsd (req, res, next) {
    var startTime = new Date().getTime();

    // Function called on response finish that sends stats to statsd
    function sendStats() {
      var splitUrl = req.url.split('/');
      var key = req[options.requestKey];
      key = key ? key + '.' : '';

      // Report timing based on top-level URI as default behavior
      if (!key && splitUrl.length > 0) {
        var topLevelURI = req.url.split('/')[1] || 'root';
        key = topLevelURI + '_' + req.method + '.';
      }

      // Status Code
      var statusCode = res.statusCode || 'unknown_status';
      client.increment(key + 'status_code.' + statusCode);

      // Response Time
      var duration = new Date().getTime() - startTime;
      client.timing(key + 'response_time', duration);

      cleanup();
    }

    // Function to clean up the listeners we've added
    function cleanup() {
      res.removeListener('finish', sendStats);
      res.removeListener('error', cleanup);
      res.removeListener('close', cleanup);
    }

    // Add response listeners
    res.once('finish', sendStats);
    res.once('error', cleanup);
    res.once('close', cleanup);

    if (next) {
      next();
    }
  };
};

var assert = require('assert');
var dgram = require('dgram');
var express = require('express');
var request = require('request');

exports.runStatsd = function startStatsd () {
  before(function () {
    this.statsd = dgram.createSocket('udp4');
    this.statsd.bind(8125, '127.0.0.1');
  });
  after(function (done) {
    this.statsd.on('close', done);
    this.statsd.close();
  });
};

exports.getStatsdMessages = function getStatsdMessages () {
  before(function retrievingStatsdMessages (done) {
    var messages = this.messages = [];
    this.statsd.on('message', function (message) {
      messages.push(message.toString());
    });
    setTimeout(done, 100);
  });
};

exports.runServer = function (port, middlewares) {
  before(function () {
    assert(port, 'runServer expects a port');
    middlewares = middlewares || [];

    var app = express();
    middlewares.forEach(function (middleware) {
      app.use(middleware);
    });
    this.server = app.listen(port);
  });
  after(function (done) {
    this.server.close(done);
  });
};

exports.saveRequest = function makeRequest (options) {
  before(function (done) {
    var self = this;
    request(options, function (err, res, body) {
      self.err = err;
      self.res = res;
      self.body = body;
      done();
    });
  });
};

# express-statsd

[StatsD](https://github.com/etsy/statsd/) route monitoring middleware for 
[Connect](https://github.com/senchalabs/connect)/[Express](https://github.com/visionmedia/express).
This middleware can be used either globally or on a per-route basis (preferred)
and sends status codes and response times to StatsD.

## Installation

``` bash
npm install express-statsd
```

## Usage

An example of an express server with express-statsd:

``` js
var express = require('express');
var expressStatsd = require('express-statsd');
var app = express();

app.use(expressStatsd());

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.listen(3000);
```

By default, the middleware will send `status_code` and `response_time` stats
for all requests. For example, using the created server above and a request to
`http://localhost:3000/`, the following stats will be sent:

```
status_code.200:1|c
response_time:100|ms
```

However, it's **highly recommended** that you set `req.statsdKey` which
will be used to namespace the stats. Be aware that stats will only be logged
once a response has been sent; this means that `req.statsdKey` can be
set even after the express-statsd middleware was added to the chain. Here's an 
example of a server set up with a more specific key:

``` js
var express = require('express');
var expressStatsd = require('express-statsd');
var app = express();

function statsd (path) {
  return function (req, res, next) {
    var method = req.method || 'unknown_method';
    req.statsdKey = ['http', method.toLowerCase(), path].join('.');
    next();
  };
}

app.use(expressStatsd());

app.get('/', statsd('home'), function (req, res) {
  res.send('Hello World!');
});

app.listen(3000);
```

A GET request to `/` on this server would produce the following stats:

```
http.get.home.status_code.200:1|c
http.get.home.response_time:100|ms
```

## Options

``` js
expressStatsd(options);
```

- **options** `Object` - Container for settings
  - **client** `Object` - The statsd client. Defaults to [lynx](https://github.com/dscape/lynx)
with host set to `127.0.0.1` and port set to `8125`.
  - **requestKey** `String` - The key on the `req` object at which to grab
the key for the statsd logs. Defaults to `req.statsdKey`.

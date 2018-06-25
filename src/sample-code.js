var http = require('http')
var https = require('https')
var request = require('request')
//------------------------------------------------------------------------------
//  Global variables
//------------------------------------------------------------------------------
var config = null;
//------------------------------------------------------------------------------
//  APIs
//------------------------------------------------------------------------------
exports.SetConfig = function(cfg) {
  config = cfg;
}
exports.GetUser = function(userId, callback) {
  request.get('http://' + config.user_private.address + ':' + config.user_private.port + '/user/' + userId, callback)
}
//------------------------------------------------------------------------------
//  Utils
//------------------------------------------------------------------------------
var ProcessHttpRequest = function(host, port, method, path, form, requestBody, callback) {
  ProcessRequest(false, host, port, method, path, form, requestBody, callback)
}
var ProcessHttpsRequest = function(host, port, method, path, form, requestBody, callback) {
  ProcessRequest(true, host, port, method, path, form, requestBody, callback)
}
var ProcessRequest = function(useHttps, host, port, method, path, form, requestBody, callback) {
  var options = {
    host: host,
    port: port,
    method: method,
    path: path,
    form: form,
    headers: {'Content-Type': 'application/json'}
  };
  if (config.log.log_level == 'debug'){
    console.log('[Debug] ____');
    if (useHttps) {
      console.log('[Debug] Https request: ' + JSON.stringify(options) + ' ' + requestBody);    
    } else {
      console.log('[Debug] Http request: ' + JSON.stringify(options) + ' ' + requestBody);    
    }
  }
  var requestCallback = function(res) { 
    var body = '';
    res.setEncoding('utf8');
    res.on('data', function(dataBlock) {
      body += dataBlock;
    });
    res.on('end', function() {
      if (config.log.log_level == 'debug'){
        console.log('[Debug]' + body);
        console.log('[Debug] ____');
      }

      if (callback) { callback(null, body); }
    });
  }
  try {
    var req;
    if (useHttps) {
      req = https.request(options, requestCallback);
    } else {
      req = http.request(options, requestCallback);
    }
    req.setTimeout(10000, function() {
      req.abort();
      callback('Request Timeout: ' + path, null);
      callback = null;
    });
    req.on('error', function(error) {
      console.log('req error: ' + error)
      if (callback) { callback(error, null); }
    });
    req.write(requestBody);
    req.end();
  }
  catch(error) {
    callback(error.stack, null);
  }
}
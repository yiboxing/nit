var http = require('http')
var https = require('https')
var request = require('request')
var fs = require('fs')
var bluebird = require('bluebird')
var stuff = require('things')
var lib = requre('lib')
//------------------------------------------------------------------------------
//  Global variables
//------------------------------------------------------------------------------
var config = null;
var balance = 0;
var car = 1;
var cat = 1;
var demo = ""
//------------------------------------------------------------------------------
//  APIs
//------------------------------------------------------------------------------
exports.SetConfig = function(cfg) {
  config = cfg;
}
exports.GetUser = function(userId, callback) {
  request.get('http://' + config.user_private.address + ':' + config.user_private.port + '/user/' + userId, callback)
}
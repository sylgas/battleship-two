var express = require('express');
var app = express();
var http = require('http').Server(app);
var async = require('async');

var settings = require('./src/settings');
var db = require('./src/db');
var httpServer = require('./src/http_server');
var socketIo = require('./src/socket_io');

async.waterfall([
	function(callback) {
		console.log('Initializing database...');
		return db.initialize(callback);
	},
	function(callback) {
		console.log('Database initialized.');
		console.log('Initializing HTTP server...');
		return httpServer.initialize(express, app, http, callback);
	},
	function(callback) {
		console.log('HTTP server initialized, listening on localhost:' + settings.PORT);
		console.log('Initializing Socket IO module...');
		return socketIo.initialize(http, callback);
	}
], function(err) {
	if (err) throw err;

	console.log('Socket IO module initialized');
});

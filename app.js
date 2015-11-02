var express = require('express');
var app = express();
var http = require('http');
var async = require('async');

var settings = require('./src/settings');
var db = require('./src/db');
var httpServer = require('./src/http_server');
var socketIo = require('./src/socket_io');

app.set('port', process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || settings.PORT);
app.set('ip', process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1");

http = http.createServer(app);
http.listen(app.get('port') ,app.get('ip'), function () {
    console.log("Express server listening at %s:%d ", app.get('ip'),app.get('port'));
});

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
		console.log('HTTP server initialized, listening on http://%s:%s', app.get('ip'), app.get('port'));
		console.log('Initializing Socket IO module...');
		return socketIo.initialize(http, callback);
	}
], function(err) {
	if (err) throw err;

	console.log('Socket IO module initialized');
});

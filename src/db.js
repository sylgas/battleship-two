var mongoose = require('mongoose');

var settings = require('./settings');

module.exports.initialize = function(callback) {
	var options = {};
	mongoose.connect(settings.MONGO_URI, options);
	mongoose.connection.on('error', callback);
    mongoose.connection.once('open', callback);
};
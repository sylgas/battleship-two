module.exports.initialize = function(http, callback) {
	var io = require('socket.io')(http);

    io.on('connection', function(socket) {
        console.log('New user connected: ' + socket.id);

        socket.on('message_from_client', function(data) {
            console.log(data);
        });

        socket.emit('message_from_server', {
            message: 'json message from server'
        });

        socket.on('disconnect', function() {
            console.log('User disconnected: ' + socket.id);
        });
    });

    return callback();
};

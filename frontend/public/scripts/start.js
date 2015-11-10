// socket.io is available from socket.io.js included as index.html script
var socket = io();
socket.on('message_from_server', function(data) {
    console.log(JSON.stringify(data));

    socket.emit('message_from_client', 'string message from client');
});

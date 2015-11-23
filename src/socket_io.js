module.exports.initialize = function(http, callback) {
	var io = require('socket.io')(http);

    var games = {};

    function getGame(k) {
        return games[k];
    }

    function addGame(game) {
        return games[game.name] = game;
    }

    addGame(new Game("tetris", "bj"));
    addGame(new Game("worms", "pb"));

    function emitAvailableGames(socket) {
        socket.emit('avaialable_games', {
            games: games
        });
    }

    io.on('connection', function(socket) {
        console.log('New socket connected: ' + socket.id);

        socket.on('disconnect', function() {
            console.log('User disconnected: ' + socket.id);
        });

        socket.on('initial_message_from', function(user) {
            console.log("New user connected: " + user);
        });

        emitAvailableGames(socket);

        socket.on('create_game', function(data) {
            addGame(new Game(data.gameName, new User(data.user)));
            console.log("New game created: " + data.gameName + " by (" + data.user + ")");
            emitAvailableGames(socket);
        });

        socket.on('join_game', function(data) {
            console.log('User ' + data.user + " has joined " + data.gameName);
            getGame(data.gameName).addParticipant(new User(data.user));

            socket.emit("successfully_joined", {
                user: data.user,
                gameName: data.gameName
            });
        });

        socket.on('move_performed', function(move) {
            //check round
            //move performed
        });

        socket.on('exit_game', function(data) {
            //bla bla function
            console.log('Left Game');
        });

    });

    return callback();
};

function Game(name, creator){
    this.name = name;
    this.creator = creator;
    this.participants = [];
}

Game.prototype.addParticipant = function(user){
    this.participants.push(user);
}

function User(name){
    this.name = name;
}
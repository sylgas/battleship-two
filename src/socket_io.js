module.exports.initialize = function(http, callback) {
    var io = require('socket.io')(http);
    var AllGames = require('./models/AllGames');

    var allGames = new AllGames();

    io.on('connection', function(socket) {
        console.log('New socket connected: ' + socket.id);

        socket.on('disconnect', function() {
            console.log('User disconnected: ' + socket.id);
        });

        socket.on('initialized', function() {
            // send available games to the newly connected socket
            socket.emit('available_games', allGames.availableGames());
        });

        socket.on('create_game', function(data) {
            var createdGame = allGames.createGame(data.gameName, new User(data.owner), data.maxPlayers);
            console.log(data);
            if (createdGame) {
                // Game successfully created
                console.log('New game created: ' + createdGame.name + ' by (' + data.owner + ')');
                socket.emit('game_created', createdGame);
                io.emit('new_game_available', createdGame);
            } else {
                // Game not created
                console.log('Game not created: ' + data.gameName + ' by (' + data.owner + ')');
                socket.emit('game_not_created', data);
            }
        });

        socket.on('join_game', function(data) {
            var game = allGames.activeGames[data.gameName];

            if (game) {
                console.log('User ' + data.user + ' has joined ' + data.gameName);
                game.addParticipant(new User(data.user));
                socket.emit('game_joined', game);
                socket.join(game.name);
                socket.to(game.name).emit('user_joined', {
                    game: game,
                    user: data.user
                });
            } else {
                console.log('User ' + data.user + ' did not join ' + data.gameName + ': the game is not available');
                socket.emit('game_not_joined', data);
            }
        });

        socket.on('exit_game', function(data) {
            //bla bla function
            console.log('Left Game');
        });

    });

    return callback();
};

function User(name) {
    this.name = name;
}

module.exports.initialize = function (http, callback) {
    var io = require('socket.io')(http);
    var AllGames = require('./models/AllGames');

    var allGames = new AllGames();

    allGames.createGame("tetris", new User("bj"));
    allGames.createGame("worms", new User("pb"));

    function emitAvailableGames(socket) {
        socket.emit('available_games', {
            games: allGames.availableGames()
        });
    }

    io.on('connection', function (socket) {
        console.log('New socket connected: ' + socket.id);

        socket.on('disconnect', function () {
            console.log('User disconnected: ' + socket.id);
        });

        socket.on('initial_message_from', function (user) {
            console.log("New user connected: " + user);
        });

        emitAvailableGames(socket);

        socket.on('create_game', function (data) {
            var createdGame = allGames.createGame(data.gameName, new User(data.owner), data.maxPlayers);
            console.log(data);
            if (createdGame) {
                console.log("New game created: " + createdGame.name + " by (" + data.gameName + ")");
            }
            emitAvailableGames(socket);
        });

        socket.on('join_game', function (data) {
            console.log('User ' + data.user + " has joined " + data.gameName);
            getGame(data.gameName).addParticipant(new User(data.user));

            socket.emit("successfully_joined", {
                user: data.user,
                gameName: data.gameName
            });
        });

        socket.on('move_performed', function (move) {
            //check round
            //move performed
        });

        socket.on('exit_game', function (data) {
            //bla bla function
            console.log('Left Game');
        });

    });

    return callback();
};

function User(name) {
    this.name = name;
}

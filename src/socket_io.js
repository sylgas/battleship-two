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

        /*
        {
            gameName: "",
            user: ""
        }
        */
        socket.on('vote_game_start', function(data) {
            var game = allGames.activeGames[data.gameName];
            var user = data.user;
            var board = data.board;

            if (game) {
                game.participants = _.map(game.participants, function(usr) {
                    if (usr.name === user) {
                        usr.board = board;
                    }
                    return usr;
                });

                var allPlayersReady = _.find(game.participants, function(usr) {return usr.board === undefined;}).length === 0;

                if (allPlayersReady) {
                    allGames.runningGames[game.name] = game;
                    delete allGames.activeGames[data.gameName];
                    io.emit('game_unavailable', game);

                    //TODO: game should be started when all users agree
                    socket.to(game.name).emit('game_started', game);
                    socket.to(game.name).emit('perform_move', game);
                } else {
                    allGames.activeGames[data.gameName] = game;
                }

            } else {
                //TODO: tell the user that the game is unavailable
            }
        });

        /*
        {
            gameName: "",
            shooter: "",
            target: "",
            x: 0,
            y: 0
        }
        */
        socket.on('shoot', function(data) {
            var game = allGames.runningGames[data.gameName];
            var shooter = data.shooter;
            var target = data.target;
            var x = data.x;
            var y = data.y;

            if (game) {
                if (shooter === game.getCurrentPlayer().name) {
                    //TODO: make necessary changes to the board
                    socket.to(game.name).emit('move_performed', {
                        game: game,
                        shooter: shooter,
                        target: target,
                        x: x,
                        y: y,
                        status: 0 //TODO: status 0 - missed, 1- shot, 2 - sinked
                    });
                    game.nextTurn();
                    socket.to(game.name).emit('perform_move', game);
                } else {
                    //TODO: tell the user that it's not his turn
                }
            } else {
                //TODO: tell the user that the shot cannot be done
            }
        });

        socket.on('exit_game', function(data) {
            //TODO
            console.log('Left Game');
        });

    });

    return callback();
};

function User(name) {
    this.name = name;
    this.board = undefined;
}

User.prototype.setBoard = function(board) {
    this.board = board;
}

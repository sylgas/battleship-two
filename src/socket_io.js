module.exports.initialize = function (http, callback) {
    var io = require('socket.io')(http);
    var _ = require('underscore');
    var AllGames = require('./models/AllGames');

    var allGames = new AllGames();

    var clients = {};

    io.on('connection', function (socket) {
        console.log('New socket connected: ' + socket.id);

        clients[socket.id] = socket;

        socket.on('disconnect', function () {
            console.log('User disconnected: ' + socket.id);

            allGames.coPlayersBySocketId(socket.id).forEach(function (playerSid) {
                clients[playerSid].emit('user_left');
            });

            allGames.removeGameBySocketId(socket.id);
        });

        socket.on('initialized', function () {
            // send available games to the newly connected socket
            socket.emit('available_games', allGames.availableGames());
        });

        socket.on('create_game', function (data) {
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

        socket.on('join_game', function (data) {
            var game = allGames.activeGames[data.gameName];

            if (game) {
                console.log('User ' + data.user + ' has joined ' + data.gameName);
                game.addParticipant(new User(data.user, data.clientId));
                socket.emit('game_joined', game);
                socket.join(game.name);
                io.to(game.name).emit('user_joined', {
                    game: game,
                    user: data.user,
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
        socket.on('vote_game_start', function (data) {
            var game = allGames.activeGames[data.gameName];
            var user = data.user;
            var board = data.board;

            if (game) {
                game.participants = _.map(game.participants, function (usr) {
                    if (usr.name === user) {
                        usr.board = board;
                    }
                    return usr;
                });

                var allPlayersInGameReady = _.find(game.participants, function (usr) {
                        return usr.board === undefined;
                    }) === undefined;
                var enoughPlayers = game.participants.length == game.maxPlayers;

                if (allPlayersInGameReady && enoughPlayers) {
                    allGames.runningGames[game.name] = game;
                    delete allGames.activeGames[data.gameName];
                    io.emit('game_unavailable', game);

                    //TODO: game should be started when all users agree
                    game.currentPlayerIndex = 0;
                    io.to(game.name).emit('game_started', game);
                } else {
                    allGames.activeGames[data.gameName] = game;
                }

            } else {
                //TODO: tell the user that the game is unavailable
            }
        });

        socket.on('shoot', function (data) {
            var game = allGames.runningGames[data.gameName];
            var shooter = data.shooter;
            var target = data.target;
            var x = data.x;
            var y = data.y;

            if (game) {
                if (shooter === game.getCurrentPlayer().name) {
                    var board = game.findParticipantByName(target.name).board;
                    if (board[x][y] != 1) {
                        game.nextTurn();
                    }
                    board[x][y] = performShoot(shooter, x, y, board);
                    io.to(game.name).emit('move_performed', {
                        game: game,
                        shooter: shooter,
                        target: target,
                        x: x,
                        y: y,
                        status: board[x][y].result, //status 0 - missed, 1- shot, 2 - sinked
                        succeed: true
                    });
                } else {
                    io.to(game.name).emit('move_performed', {
                        succeed: false,
                        error: 'Not your turn'
                    });
                }
            } else {
                io.to(game.name).emit('move_performed', {
                    succeed: false,
                    error: 'Game not found'
                });
            }
        });

        function performShoot(shooter, x, y, board) {
            var result = {};
            result.scored = shooter;
            if (board[x][y] == 0) {
                result.result = 0;
            } else if (board[x][y] == 1) {
                var isSinked = checkIfSinked(x, y, board);
                if (isSinked) {
                    result.result = 2;
                } else {
                    result.result = 1;
                }
            }
            return result;
        }

        function checkIfSinked(x, y, board) {
            return checkIfSinkedTop(x, y - 1, board)
                && checkIfSinkedBottom(x, y + 1, board)
                && checkIfSinkedLeft(x - 1, y, board)
                && checkIfSinkedRight(x + 1, y, board);
        }

        function checkIfSinkedTop(x, y, board) {
            if (y < 0 || board[x][y] == 0 || board[x][y].result == 0) {
                return true;
            }
            if (board[x][y] == 1) {
                return false;
            }
            return checkIfSinkedTop(x, y - 1, board)
        }

        function checkIfSinkedBottom(x, y, board) {
            if (y > 9 || board[x][y] == 0 || board[x][y].result == 0) {
                return true;
            }
            if (board[x][y] == 1) {
                return false;
            }
            return checkIfSinkedBottom(x, y + 1, board)
        }

        function checkIfSinkedLeft(x, y, board) {
            if (x < 0 || board[x][y] == 0 || board[x][y].result == 0) {
                return true;
            }
            if (board[x][y] == 1) {
                return false;
            }
            return checkIfSinkedLeft(x - 1, y, board)
        }

        function checkIfSinkedRight(x, y, board) {
            if (x > 9 || board[x][y] == 0 || board[x][y].result == 0) {
                return true;
            }
            if (board[x][y] == 1) {
                return false;
            }
            return checkIfSinkedRight(x + 1, y, board)
        }

        socket.on('exit_game', function (data) {
            //TODO
            console.log('Left Game');
        });

        socket.on('chat_message_to_all', function (data) {
            //var user = data.user;
            //var message = data.message;
            data.time = Date.now();
            console.log("Data: " + JSON.stringify(data));
            io.emit('chat_message_from_all', data);
        });

    });

    return callback();
};

function User(name, clientId) {
    this.name = name;
    this.board = undefined;
    this.clientId = clientId;
}

User.prototype.setBoard = function (board) {
    this.board = board;
}

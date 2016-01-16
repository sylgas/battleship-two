module.exports.initialize = function (http, callback) {
    var io = require('socket.io')(http);
    var _ = require('underscore');
    var AllGames = require('./models/AllGames');

    var allGames = new AllGames();

    var clients = {};
    var socketNames = {};

    io.on('connection', function (socket) {
            console.log('New socket connected: ' + socket.id);

            clients[socket.id] = socket;

            socket.on('disconnect', function () {
                console.log('User disconnected: ' + socket.id);

                allGames.coPlayersBySocketId(socket.id).forEach(function (playerSid) {
                    clients[playerSid].emit('user_left');
                });

                allGames.removeGameBySocketId(socket.id);

                if (socketNames[socket.id] !== undefined && socketNames[socket.id] !== null) {
                    io.emit('chat_message_from_all', {
                        time: Date.now(),
                        user: null,
                        message: socketNames[socket.id] + ' has left'
                    });
                }
                delete socketNames[socket.id];
            });

            socket.on('initialized', function (username) {
                socketNames[socket.id] = username;
                // send available games to the newly connected socket
                socket.emit('available_games', allGames.availableGames());
                if (username !== undefined && username !== null) {
                    io.emit('chat_message_from_all', {
                        time: Date.now(),
                        user: null,
                        message: username + ' has joined'
                    });
                }
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
                var isSuperShot = data.isSuperShot;

                if (game) {
                    if (shooter === game.getCurrentPlayer().name) {
                        var targetPlayer = game.findParticipantByName(target.name);
                        var shooterPlayer = game.findParticipantByName(shooter);
                        var board = targetPlayer.board;
                        if (isSuperShot && shooterPlayer.superShotsLeft > 0) {
                            shooterPlayer.superShotsLeft -= 1;
                            var missedAll = true;
                            for (i = x - 1; i <= x + 1; i++) {
                                for (j = y - 1; j <= y + 1; j++) {
                                    if (i >= 0 && i < 10 && j >= 0 && j < 10) {
                                        if (board[i][j] == 1) {
                                            missedAll = false;
                                        }
                                        board[i][j] = performShoot(shooter, i, j, board);
                                        targetPlayer.alive = checkIfAlive(board);

                                        io.to(game.name).emit('move_performed', {
                                            game: game,
                                            shooter: shooter,
                                            target: target,
                                            x: i,
                                            y: j,
                                            status: board[i][j].result, //status 0 - missed, 1- shot, 2 - sinked
                                            succeed: true,
                                            alive: targetPlayer.alive
                                        });

                                        updateUsersStatus(game, targetPlayer, shooterPlayer);
                                    }
                                }
                            }
                            if (missedAll) {
                                nextTurn(game);
                            }
                        } else {
                            if (board[x][y] != 1) {
                                nextTurn(game);
                            }
                            board[x][y] = performShoot(shooter, x, y, board);
                            targetPlayer.alive = checkIfAlive(board);

                            io.to(game.name).emit('move_performed', {
                                game: game,
                                shooter: shooter,
                                target: target,
                                x: x,
                                y: y,
                                status: board[x][y].result, //status 0 - missed, 1- shot, 2 - sinked
                                succeed: true,
                                alive: targetPlayer.alive
                            });

                            updateUsersStatus(game, targetPlayer, shooterPlayer);
                        }
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


            function updateUsersStatus(game, targetPlayer, shooterPlayer) {
                if (!targetPlayer.alive) {
			results = calculateResults(target, game.participants);
			var shareLink = generateShareLink(
			    "Battleship TWO - Game Won!",
			    "Just won a game with " + shooterPlayer + "! shots: " + results.shots + ", hits: " + results.hits,
			    ""
			);
                    io.to(game.name).emit('player_defeated', {
                        game: game,
                        player: targetPlayer.name,
			shareLink: shareLink,
                        results: results
                    })
                }

                if (isGameOver(game)) {
                    io.to(game.name).emit('player_won', {
                        game: game,
                        player: shooterPlayer.name,
                        results: calculateResults(shooterPlayer, game.participants)
                    })
                }
            }

	    function generateShareLink(name, description, url_within_site) {
		    var app_id = 667786046658251
		    var link = "http://battleship-tilius.rhcloud.com/" + url_within_site
		    var picture = "http://images.wildtangent.com/battleshippopcap/big_icon.png"
		    name = escape(name)
		    var caption = escape("Battleship TWO")
		    description = escape(description)
		    var redirect_uri = link
		    return "http://www.facebook.com/dialog/feed" +
			    "?app_id=" + app_id +
			    "&link=" + link +
			    "&picture=" + picture +
			    "&name=" + name +
			    "&caption=" + caption +
			    "&description=" + description +
			    "&redirect_uri=" + redirect_uri
	    }


            function nextTurn(game) {
                game.nextTurn();
                while (!game.participants[game.currentPlayerIndex].alive) {
                    game.nextTurn();
                }
            }

            function isGameOver(game) {
                var playingUsersCount = 0;
                for (var i = 0; i < game.participants.length; i++) {
                    var user = game.participants[i];
                    if (user.alive) {
                        playingUsersCount++;
                        if (playingUsersCount > 1) {
                            return false;
                        }
                    }
                }
                return true;
            }

            function calculateResults(player, participants) {
                results = {
                    shots: 0,
                    hits: 0,
                    drown: 0,
                    hit_own: 0,
                    drown_own: 0,
                    vs: {}
                };
                for (var i = participants.length - 1; i >= 0; i--) {
                    var participant = participants[i];
                    if (participant.name === player.name) {
                        results = calculateVsResults(participant.board, results)
                    } else {
                        results = updateResults(participant.board, player, results)
                    }
                }

                return results
            }

            function calculateVsResults(board, resultsToUpdate) {
                for (var i = board.length - 1; i >= 0; i--) {
                    for (var j = board[i].length - 1; j >= 0; j--) {
                        var field = board[i][j];
                        if (field != 0 && field != 1) {

                            if (!resultsToUpdate.vs[field.scored]) {
                                resultsToUpdate.vs[field.scored] = {
                                    name: field.scored,
                                    shots: 0,
                                    hits: 0,
                                    drown: 0
                                }
                            }
                            resultsToUpdate.vs[field.scored].shots += 1;
                            if (field.result == 1) {
                                resultsToUpdate.hit_own += 1;
                                resultsToUpdate.vs[field.scored].hits += 1
                            } else if (field.result == 2) {
                                resultsToUpdate.hit_own += 1;
                                resultsToUpdate.drown_own += 1;
                                resultsToUpdate.vs[field.scored].hits += 1;
                                resultsToUpdate.vs[field.scored].drown += 1
                            }
                        }
                    }
                }
                return resultsToUpdate;
            }

            function updateResults(board, player, resultsToUpdate) {
                for (var i = board.length - 1; i >= 0; i--) {
                    for (var j = board[i].length - 1; j >= 0; j--) {
                        var field = board[i][j];
                        if (field != 0 && field != 1 && field.scored == player) {
                            resultsToUpdate.shots += 1;
                            if (field.result == 1) {
                                resultsToUpdate.hits += 1;
                            } else if (field.result == 2) {
                                resultsToUpdate.hits += 1;
                                resultsToUpdate.drown += 1;
                            }
                        }
                    }
                }
                return resultsToUpdate;
            }

            function checkIfAlive(board) {
                for (var i = board.length - 1; i >= 0; i--) {
                    for (var j = board[i].length - 1; j >= 0; j--) {
                        if (board[i][j] == 1) {
                            return true;
                        }
                    }
                }
                return false;
            }

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

        }
    )
    ;

    return callback();
};

function User(name, clientId) {
    this.name = name;
    this.board = undefined;
    this.clientId = clientId;
    this.alive = true;
    this.superShotsLeft = 1;
}

User.prototype.setBoard = function (board) {
    this.board = board;
}

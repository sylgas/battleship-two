angular.module('application.services').
    service('BattleshipService', ['_', 'LoggedUser', "$timeout", "$state", function (_, LoggedUser, $state) {
        var socket = io();

        var availableGames = {};
        var currentGame;

        var availableGamesCallback;
        var gameStartCallback;
        var defeatCallback;
        var winCallback;

        socket.on('available_games', function (games) {
            console.log('available games: ' + JSON.stringify(games));
            availableGames = games;
            if (availableGamesCallback) {
                availableGamesCallback(availableGames);
            }
        });

        socket.on('new_game_available', function (game) {
            console.log('New game available: ' + JSON.stringify(game));
            availableGames[game.name] = game;
            if (availableGamesCallback) {
                availableGamesCallback(availableGames);
            }
        });

        socket.on('game_unavailable', function (game) {
            console.log('Game unavailable: ' + JSON.stringify(game));
            delete availableGames[game.name];
            if (availableGamesCallback) {
                availableGamesCallback(availableGames);
            }
        });

        this.setOnAvailableGamesChangeCallback = function (callback) {
            availableGamesCallback = callback;
        };

        this.getAvailableGames = function () {
            return availableGames;
        };

        var gameCreationCallbacks = {};

        socket.on('game_created', function (game) {
            console.log('Game created: ' + JSON.stringify(game));
            var callback = gameCreationCallbacks[game.name];
            if (callback) {
                delete gameCreationCallbacks[game.name];
                callback(false, game);
            }
        });

        socket.on('game_not_created', function (data) {
            console.log('Game not created: ' + JSON.stringify(data));
            var callback = gameCreationCallbacks[data.gameName];
            if (callback) {
                delete gameCreationCallbacks[data.gameName];
                callback(true, data);
            }
        });

        this.createGame = function (gameName, maxPlayers, callback) {
            gameCreationCallbacks[gameName] = callback;
            socket.emit('create_game', {
                gameName: gameName,
                maxPlayers: maxPlayers,
                owner: LoggedUser.getName()
            });
        };

        var gameJoinCallbacks = {};
        var usersChangedCallbacks = {};

        socket.on('user_joined', function (data) {
            console.log('User joined: ' + JSON.stringify(data));

            var game = data.game;
            var user = data.user;

            availableGames[game.name] = game;

            var callback = usersChangedCallbacks[game.name];
            if (callback) {
                callback(availableGames[game.name]);
            }
        });

        socket.on('user_left', function () {
            console.log('One of users left the game');
            alert('One of users left the game');
        });

        socket.on('game_joined', function (game) {
            console.log('Game joined: ' + JSON.stringify(game));
            currentGame = game;
            var callback = gameJoinCallbacks[game.name];
            if (callback) {
                delete gameJoinCallbacks[game.name];
                callback(false, game);
            }
        });

        socket.on('game_not_joined', function (data) {
            console.log('Game not joined: ' + JSON.stringify(data));
            var callback = gameJoinCallbacks[data.gameName];
            if (callback) {
                delete gameJoinCallbacks[data.gameName];
                callback(true, data);
            }
        });

        this.addOnUsersChangedCallback = function (gameName, callback) {
            usersChangedCallbacks[gameName] = callback;
        };

        this.removeOnUsersChangedCallback = function (gameName) {
            delete usersChangedCallbacks[gameName];
        };

        this.getJoinedUsers = function (gameName) {
            return availableGames[gameName].participants;
        };

        this.joinGame = function (gameName, callback) {
            gameJoinCallbacks[gameName] = callback;
            socket.emit('join_game', {
                gameName: gameName,
                user: LoggedUser.getName(),
                clientId: socket.id
            });
        };

        this.setBoardAndReady = function (board, onGameStartCallback) {
            gameStartCallback = onGameStartCallback;
            socket.emit('vote_game_start', {
                gameName: currentGame.name,
                user: LoggedUser.getName(),
                board: board
            });
        };

        var onShootCallbacks = [];

        function onShoot(response, isMyTurn) {
            onShootCallbacks.forEach(function (callback) {
                callback(response.target, response.x, response.y, response.status, isMyTurn); //response.status 0 - missed, 1- shot, 2 - sinked
            });
        }

        socket.on('game_started', function (game) {
            currentGame = game;
            console.log('Game started: ' + JSON.stringify(game));
            var currentPlayer = game.participants[game.currentPlayerIndex];
            if (gameStartCallback) {
                gameStartCallback(game.name, currentPlayer.name === LoggedUser.getName());
            }
        });

        /*
         {
         game: {},
         shooter: "",
         target: "",
         x: 0,
         y: 0,
         status: 0|1|2
         }
         */
        socket.on('move_performed', function (data) {
            console.log('Move performed: ' + JSON.stringify(data));
            var currentPlayer = data.game.participants[data.game.currentPlayerIndex];
            if (data.succeed) {
                onShoot(data, currentPlayer.name === LoggedUser.getName());
                console.log(data)
            } else {
                console.log(data.error);
            }
        });

        this.addOnShootCallback = function (callback) {
            onShootCallbacks.push(callback);
        };

        this.getGame = function () {
            return currentGame;
        };

        this.shoot = function (user, x, y, isSuperShot) {
            console.log("Shot " + user.name + " " + x + ", " + y);
            socket.emit('shoot', {
                gameName: currentGame.name,
                shooter: LoggedUser.getName(),
                target: user,
                x: x,
                y: y,
                isSuperShot: isSuperShot
            });
        };

        this.addDefeatCallback = function (callback) {
            defeatCallback = callback;
        };

        this.addWinCallback = function (callback) {
            winCallback = callback;
        };

        socket.on('player_defeated', function (data) {
            defeatCallback(data)
        });

        socket.on('player_won', function (data) {
            if (data.player == LoggedUser.getName()) {
                winCallback(data);
                console.log(data)
            }
        });

        socket.emit('initialized', LoggedUser.getName());
    }
    ])
;

angular.module('application.services').
service('BattleshipService', ['_', 'LoggedUser', function(_, LoggedUser) {
    var socket = io();

    var availableGames = {};
    var currentGame;

    var availableGamesCallback;
    var gameStartCallback;

    socket.on('available_games', function(games) {
        console.log('available games: ' + JSON.stringify(games));
        availableGames = games;
        if (availableGamesCallback) {
            availableGamesCallback(availableGames);
        }
    });

    socket.on('new_game_available', function(game) {
        console.log('New game available: ' + JSON.stringify(game));
        availableGames[game.name] = game;
        if (availableGamesCallback) {
            availableGamesCallback(availableGames);
        }
    });

    socket.on('game_unavailable', function(game) {
        console.log('Game unavailable: ' + JSON.stringify(game));
        delete availableGames[game.name];
        if (availableGamesCallback) {
            availableGamesCallback(availableGames);
        }
    });

    this.setOnAvailableGamesChangeCallback = function(callback) {
        availableGamesCallback = callback;
    };

    this.getAvailableGames = function() {
        return availableGames;
    };

    var gameCreationCallbacks = {};

    socket.on('game_created', function(game) {
        console.log('Game created: ' + JSON.stringify(game));
        var callback = gameCreationCallbacks[game.name];
        if (callback) {
            delete gameCreationCallbacks[game.name];
            callback(false, game);
        }
    });

    socket.on('game_not_created', function(data) {
        console.log('Game not created: ' + JSON.stringify(data));
        var callback = gameCreationCallbacks[data.gameName];
        if (callback) {
            delete gameCreationCallbacks[data.gameName];
            callback(true, data);
        }
    });

    this.createGame = function(gameName, maxPlayers, callback) {
        gameCreationCallbacks[gameName] = callback;
        socket.emit('create_game', {
            gameName: gameName,
            maxPlayers: maxPlayers,
            owner: LoggedUser.getName()
        });
    };

    var gameJoinCallbacks = {};
    var usersChangedCallbacks = {};

    socket.on('user_joined', function(data) {
        console.log('User joined: ' + JSON.stringify(data));

        var game = data.game;
        var user = data.user;

        availableGames[game.name] = game;

        var callback = usersChangedCallbacks[game.name];
        if (callback) {
            callback(availableGames[game.name]);
        }
    });

    socket.on('game_joined', function(game) {
        console.log('Game joined: ' + JSON.stringify(game));
        currentGame = game;
        var callback = gameJoinCallbacks[game.name];
        if (callback) {
            delete gameJoinCallbacks[game.name];
            callback(false, game);
        }
    });

    socket.on('game_not_joined', function(data) {
        console.log('Game not joined: ' + JSON.stringify(data));
        var callback = gameJoinCallbacks[data.gameName];
        if (callback) {
            delete gameJoinCallbacks[data.gameName];
            callback(true, data);
        }
    });

    this.addOnUsersChangedCallback = function(gameName, callback) {
        usersChangedCallbacks[gameName] = callback;
    };

    this.removeOnUsersChangedCallback = function(gameName) {
        delete usersChangedCallbacks[gameName];
    };

    this.getJoinedUsers = function(gameName) {
        return availableGames[gameName].participants;
    };

    this.joinGame = function(gameName, callback) {
        gameJoinCallbacks[gameName] = callback;
        socket.emit('join_game', {
            gameName: gameName,
            user: LoggedUser.getName()
        });
    };

    this.setBoardAndReady = function(board, onGameStartCallback) {
        gameStartCallback = onGameStartCallback;
        socket.emit('vote_game_start', {
            gameName: currentGame.name,
            user: LoggedUser.getName(),
            board: board
        });
    };

    var onShootCallbacks = [];

    function onShoot(response) {
        onShootCallbacks.forEach(function(callback) {
            callback(response.target, response.x, response.y, response.status); //response.status 0 - missed, 1- shot, 2 - sinked
        });
    }

    this.isMyTurn = false;

    this.addOnShootCallback = function(callback) {
        onShootCallbacks.push(callback);
    };

    this.getGame = function() {
        return currentGame;
    };

    this.shoot = function(user, x, y) {
        console.log("Shot " + user.username + " " + x + ", " + y);
        this.isMyTurn = false;

        socket.emit('shoot', {
            gameName: currentGame.name,
            shooter: LoggedUser.getName(),
            target: user,
            x: x,
            y: y
        });
    };

    socket.on('game_started', function(game) {
        console.log('Game started: ' + JSON.stringify(game));
        if (gameStartCallback) {
            gameStartCallback(game.name);
        }
        //TODO: tell the user that the game has started
    });

    socket.on('perform_move', function(game) {
        var currentPlayerIndex = game.currentPlayerIndex;
        var currentPlayer = game.participants[currentPlayerIndex];
        if (currentPlayer.name === LoggedUser.getName()) {
            console.log('Perform move: ' + JSON.stringify(game));
            this.isMyTurn = true;
            //TODO: tell the user to perform the move
        } else {
            //it's someone else's turn
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
    socket.on('move_performed', function(data) {
        console.log('Move performed: ' + JSON.stringify(data));
        onShoot(data);
    });

    socket.emit('initialized');
}]);

angular.module('application.services').
service('BattleshipService', ['_', 'LoggedUser', function(_, LoggedUser) {
    var socket = io();

    var availableGames = {};

    var availableGamesCallback;

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

    socket.on('game_closed', function(game) {
        console.log('Game closed: ' + JSON.stringify(game));
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

    var onShootCallbacks = [];

    function onShoot(response) {
        onShootCallbacks.forEach(function(callback) {
            callback(response.user, response.x, response.y, response.status); //response.status 0 - missed, 1- shot ,2 - sinked
        });
    }

    this.isMyTurn = true;

    this.addOnShootCallback = function(callback) {
        onShootCallbacks.push(callback);
    };

    this.getGame = function() {
        // Not yet implemented
        var users = [];
        for (var i = 0; i < 10; i++) {
            users.push({
                username: 'user' + i
            });
        }

        return {
            participants: users
        };
    };

    this.shoot = function(user, x, y) {
        // Not yet implemented
        console.log("Shot " + user.username + " " + x + ", " + y);
        this.isMyTurn = false;
    };

    socket.emit('initialized');
}]);

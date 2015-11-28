angular.module('application.services').
service('BattleshipService', ['_', 'LoggedUser', function(_, LoggedUser) {
    var socket = io();

    var availableGames = [];

    var availableGamesCallback;

    socket.on('avaialable_games', function(games) {
        console.log('available games: ' + JSON.stringify(games));
        availableGames = games;
        if(availableGamesCallback) {
            availableGamesCallback(availableGames);
        }
    });

    socket.on('new_game_available', function(game) {
        console.log('New game available: ' + JSON.stringify(game));
        availableGames.push(game);
        if(availableGamesCallback) {
            availableGamesCallback(availableGames);
        }
    });

    socket.on('game_closed', function(game) {
        console.log('Game closed: ' + JSON.stringify(game));
        availableGames = _.reject(availableGames, function(availableGame) {
            availableGame.name === game.name;
        });
        if(availableGamesCallback) {
            availableGamesCallback(availableGames);
        }
    });

    this.addOnAvailableGamesChangeCallback = function(callback) {
        availableGamesCallback = callback;
    };

    this.getAvailableGames = function() {
        return availableGames;
    };

    var gameCreationCallbacks = {};

    socket.on('game_created', function(game) {
        console.log(game);
        var callback = gameCreationCallbacks[game.name];
        if (callback) {
            callback(false, game);
        }
    });

    socket.on('game_not_created', function(game) {
        console.log(game);
        var callback = gameCreationCallbacks[game.name];
        if (callback) {
            callback(true, game);
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

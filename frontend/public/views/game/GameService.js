angular.module('application.services').
    service('GameService', [function () {
        var gameService = {};
        var onShootCallbacks = [];

        function onShoot(response) {
            console.log(onShootCallbacks);
            onShootCallbacks.forEach(function (callback) {
                callback(response.user.id, response.x, response.y, response.status);   //response.status (eg. if the ship is shot, sinked or missed)
            });
        }

        gameService.addOnShootCallback = function (callback) {
            onShootCallbacks.push(callback);
        };

        gameService.getGame = function (id) {
            var users = [];
            for (var i = 0; i < 10; i++) {
                users.push({username: 'user' + i, id: i});
            }

            return {participants: users};
        };

        gameService.shoot = function (user, x, y) {
            console.log("Shot " + user.username + " " + x + ", " + y);
            onShoot({user: user, x: x, y: y, status: 0});
        };

        return gameService;
    }]);
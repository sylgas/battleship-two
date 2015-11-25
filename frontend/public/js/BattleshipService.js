angular.module('application.services').
    service('BattleshipService', [function () {
        var onShootCallbacks = [];

        function onShoot(response) {
            onShootCallbacks.forEach(function (callback) {
                callback(response.user, response.x, response.y, response.status);   //response.status 0 - missed, 1- shot ,2 - sinked
            });
        }

        this.isMyTurn = true;

        this.addOnShootCallback = function (callback) {
            onShootCallbacks.push(callback);
        };

        this.getGame = function () {
            // Not yet implemented
            var users = [];
            for (var i = 0; i < 10; i++) {
                users.push({username: 'user' + i});
            }

            return {participants: users};
        };

        this.shoot = function (user, x, y) {
            // Not yet implemented
            console.log("Shot " + user.username + " " + x + ", " + y);
            this.isMyTurn = false;
        };

    }]);
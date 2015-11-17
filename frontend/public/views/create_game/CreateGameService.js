angular.module('application.services').
    service('CreateGameService', ['$http', function ($http) {

        return {
            createGame: function (gameToCreate) {
                $http.post("/create_game", gameToCreate)
            }
        };
    }]);
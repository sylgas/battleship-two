angular.module('application.controllers')
    .controller('MenuController', ['$scope', '$state', 'MenuService', '_', 'LoggedUser', 'BattleshipService',
        function($scope, $state, MenuService, _, LoggedUser, BattleshipService) {

            $scope.isLoading = undefined;
            $scope.username = undefined;

            $scope.joinRandomGame = function() {
                var games = BattleshipService.getAvailableGames();
                var game = _.sample(games);
                if (game) {
                    BattleshipService.joinGame(game.name, function(err, data) {
                        if (err) {
                            // game not joined
                        } else {
                            // game joined
                            $state.go('deploy', {'game': game.name});
                        }
                    });
                }
            };

            var init = function() {
                var user = LoggedUser.getUser();
                $scope.username = user.username;
            };

            init();

        }
    ]);

Object.size = function(obj) {
    var size = 0,
        key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

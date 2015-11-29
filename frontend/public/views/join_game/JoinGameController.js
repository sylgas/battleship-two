angular.module('application.controllers')
    .controller('JoinGameController', ['$scope', '$state', '$timeout', '_', 'LoggedUser', 'BattleshipService',
        function ($scope, $state, $timeout, _, LoggedUser, BattleshipService) {

            $scope.games = undefined;
            $scope.gameName = undefined;
            $scope.isNewGame = false;

            var onAvailableGamesChange = function(games) {
                $scope.isNewGame = Object.size(games) > Object.size($scope.games);
                $scope.games = _.filter(games, function(el) {return el.participants.length < el.maxPlayers;});
                if (!_.contains(_.pluck(games, 'name'), $scope.gameName)) {
                    $scope.gameName = undefined;
                }
                $timeout(function() {$scope.isNewGame = false;}, 3000);
                $scope.$apply();
            };

            var init = function() {
                $scope.games = BattleshipService.getAvailableGames();
                BattleshipService.setOnAvailableGamesChangeCallback(onAvailableGamesChange);
            };

            $scope.joinGame = function() {
                if ($scope.gameName) {
                    BattleshipService.joinGame($scope.gameName, function(err, data) {
                        if (err) {
                            // game not joined
                        } else {
                            // game joined
                            $state.go('deploy');
                        }
                    });
                }
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

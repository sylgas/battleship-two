angular.module('application.controllers')
    .controller('CreateGameController', ['$scope', '$state', '_', 'LoggedUser', 'BattleshipService',
        function($scope, $state, _, LoggedUser, BattleshipService) {

            var socket = io();

            $scope.user = LoggedUser.getUser();

            socket.on('available_games', function(data) {
                console.log(data);
            });

            $scope.minNumberOfPlayers = 2;
            $scope.maxNumberOfPlayers = 6;

            $scope.game = {
                "gameName": null,
                "maxPlayers": $scope.minNumberOfPlayers
            };

            $scope.createGame = function() {
                BattleshipService.createGame($scope.game.gameName, $scope.game.maxPlayers, function(err, game) {
                    if (err) {
                        // game not created
                    } else {
                        $state.go('join_game');
                        // game created
                    }
                });
            }
        }
    ]);

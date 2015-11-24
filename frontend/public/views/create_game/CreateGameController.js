angular.module('application.controllers')
    .controller('CreateGameController', ['$scope', 'TestService', '_', 'LoggedUser', 'CreateGameService',
        function ($scope, TestService, _, LoggedUser, CreateGameService) {

            $scope.minNumberOfPlayers = 2;
            $scope.maxNumberOfPlayers = 6;

            $scope.game = {
                "gameName": null,
                "maxPlayers": $scope.minNumberOfPlayers
            };

            $scope.username = "Janek";
            //$scope.username = LoggedUser.getName();


            $scope.createGame = function () {
                console.log($scope.game);
                console.log($scope.username);
                var createdGame = {};

                _.extend(createdGame, $scope.game, {"owner" : $scope.username});
                CreateGameService.createGame(createdGame)

            }
        }
    ]);
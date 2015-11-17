angular.module('application.controllers')
    .controller('CreateGameController', ['$scope', 'TestService', '_', 'LoggedUser',
        function ($scope, TestService, _, LoggedUser) {

            $scope.gameToCreate = {
                "gameName": null
            };

            var init = function () {
                $scope.variable = 'test string';
            };

            init();

            $scope.username = "Janek";
            //$scope.username = LoggedUser.getName();

            $scope.createGame = function () {
                console.log($scope.gameToCreate);

            }
        }
    ]);
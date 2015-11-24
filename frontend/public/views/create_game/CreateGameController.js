angular.module('application.controllers')
    .controller('CreateGameController', ['$scope', 'TestService', '_', 'CookiesService', 'CreateGameService',
        function ($scope, TestService, _, CookiesService, CreateGameService) {

            var socket = io();

            $scope.user = CookiesService.getCookie('user');

            socket.on('available_games', function (data) {
                console.log(data);
            });

            $scope.minNumberOfPlayers = 2;
            $scope.maxNumberOfPlayers = 6;

            $scope.game = {
                "gameName": null,
                "maxPlayers": $scope.minNumberOfPlayers
            };

            $scope.createGame = function () {
                var createdGame = {};

                _.extend(createdGame, $scope.game, {"owner": $scope.user.username});

                socket.emit('create_game', createdGame);
            }
        }
    ]);
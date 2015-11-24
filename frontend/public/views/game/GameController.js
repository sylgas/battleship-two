angular.module('application.controllers')
    .controller('GameController', ['$scope', '$stateParams', 'GameService', 'LoggedUser',
        function ($scope, $stateParams, GameService, LoggedUser) {

            var SHIP_COLOR = 'green';
            var WRECK_COLOR = 'red';
            var SEA_COLOR = 'navy';

            var boards = {};

            //TODO: color should be assigned depending of shoot status (eg. if the ship is shot)
            function statusColor(status) {
                return SEA_COLOR;
            }

            function changeRectColor(rect, color) {
                rect.path.fillColor = color;
                rect.color = color;
            }

            function addBoard(board, user) {
                boards[user.id] = board;
            }

            function updateBoard(userId, x, y, status) {
                var color = statusColor(status);
                changeRectColor(boards[userId].rects[x][y], color);
            }

            function shootField(x, y) {
                GameService.shoot($scope.current.user, x, y);
            }

            var init = function () {
                $scope.game = GameService.getGame($stateParams.gameId);
                console.log(LoggedUser);
                $scope.users = $scope.game.participants.filter(
                    function (particinant) {
                        return particinant.id != LoggedUser.id
                    }
                );
                GameService.addOnShootCallback(updateBoard);

                $scope.current = {user: $scope.game.participants[0]};

                $scope.shootField = shootField;
                $scope.addBoard = addBoard;
            };

            init();

        }
    ]);
angular.module('application.controllers')
    .controller('GameController', ['$scope',
        function ($scope) {

            var WHITE_COLOR = 'white';
            var BLUE_COLOR = 'navy';

            function updateBoard() {
            }

            function shootField(rects, i, j) {
                if (rects[i][j].color === WHITE_COLOR) {
                    rects[i][j].path.fillColor = BLUE_COLOR;
                    rects[i][j].color = BLUE_COLOR;
                } else {
                    rects[i][j].path.fillColor = WHITE_COLOR;
                    rects[i][j].color = WHITE_COLOR;
                }
            }

            var init = function () {
                $scope.users = [];
                for (var i = 0; i < 10; i++) {
                    $scope.users.push({username: 'user' + i});
                }
                $scope.current = {user: $scope.users[0]};

                $scope.updateBoard = updateBoard;
                $scope.shootField = shootField;
                updateBoard();
            };

            init();

        }
    ]);
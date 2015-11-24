angular.module('application.controllers')
    .controller('GameController', ['$scope', 'LoggedUser',
        function ($scope, LoggedUser) {

            function updateBoard() {
            }

            var init = function () {
                $scope.users = [];
                for (var i = 0; i < 10; i++) {
                    $scope.users.push({username: 'user' + i});
                }
                $scope.current = {user: $scope.users[0]};

                $scope.updateBoard = updateBoard;
                updateBoard();
            };

            init();

        }
    ]);
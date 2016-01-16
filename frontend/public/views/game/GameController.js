angular.module('application.controllers')
    .controller('GameController', ['$scope', '$state', '$stateParams', 'BattleshipService', 'LoggedUser', 'DeployShipsService',
        function ($scope, $state, $stateParams, BattleshipService, LoggedUser, DeployShipsService) {

            var SHIP_COLOR = 'green';
            var WRECK_COLOR = 'red';
            var SEA_COLOR = 'navy';
            var DEFAULT_MY_SHIP = 'black';

            var boards = {};

            $scope.superShotCounter = 1;
            var isSuperShot = false;

            $scope.activateSuperShot = function() {
                isSuperShot = true;
                $scope.superShotCounter -= 1;
            };

            function changeRectColor(rect, color) {
                rect.path.fillColor = color;
                rect.color = color;
                paper.view.update();
            }

            function addBoard(board, user) {
                boards[user.name] = board;
                if (user.name == $scope.loggedUser.name) {
                    initBoard();
                }
            }

            function wreckShip(rects, x, y) {
                if (x < 0 || x > 9 || y < 0 || y > 9 || rects[x][y].color != SHIP_COLOR) {
                    return;
                }
                changeRectColor(rects[x][y], WRECK_COLOR);
                wreckShip(rects, x - 1, y);
                wreckShip(rects, x, y - 1);
                wreckShip(rects, x + 1, y);
                wreckShip(rects, x, y + 1);
            }

            function updateBoardView() {
                paper.projects[0].view.update();
            }

            function updateBoardAndTurn(user, x, y, status, isMyTurn) {
                $scope.isMyTurn = isMyTurn;
                $scope.$apply();
                var board = boards[user.name];
                var rects = board.rects;
                switch (status) {
                    case 0:
                        changeRectColor(rects[x][y], SEA_COLOR);
                        break;
                    case 1:
                        changeRectColor(rects[x][y], SHIP_COLOR);
                        break;
                    case 2:
                        changeRectColor(rects[x][y], SHIP_COLOR);
                        wreckShip(rects, x, y);
                }
                updateBoardView();
            }

            function shootField(rects, x, y) {
                if ($scope.isMyTurn) {
                    BattleshipService.shoot($scope.current.user, x, y, isSuperShot);
                    isSuperShot = false;
                }
            }

            function initBoard() {
                var ships = DeployShipsService.getShips();
                var rects = boards[$scope.loggedUser.name].rects;

                for (var x = 0; x < 10; x++) {
                    for (var y = 0; y < 10; y++) {
                        if (ships[x][y] > 0) {
                            changeRectColor(rects[x][y], DEFAULT_MY_SHIP);
                        }
                    }
                }
                updateBoardView();
            }


            function onDefeat(data) {
                if (data.player == $scope.loggedUser.name) {
                    showResults(data);
                } else {
                    $scope.users = $scope.users.filter(function (user) {
                        return user.name !== data.player;
                    });
                    if ($scope.current.name == data.player) {
                        $scope.current = {user: $scope.users[0]};
                    }
                }
            }

            function showResults(data) {
                $state.go('results', {data: data});
            }

            // TODO place into the after-game view
            // var place = 1
            // var ranking = ""
            // for (user in users) {
            //     ranking += place + ". " + user.name + "\n"
            //     place++
            // }
            //
            // generateShareLink(
            //   "Battleship TWO - Ranking",
            //   "I'm at the place " + place + " in the ranking:\n" + ranking,
            //   "ranking"
            // )

            var init = function () {
                $scope.game = BattleshipService.getGame($stateParams.gameName);
                $scope.isMyTurn = $stateParams.isMyTurn;
                $scope.loggedUser = LoggedUser.getUser();
                $scope.loggedUser.name = $scope.loggedUser.username;
                $scope.users = $scope.game.participants.filter(
                    function (participant) {
                        return participant.name !== $scope.loggedUser.name;
                    }
                );
                $scope.current = {user: $scope.users[0]};
                $scope.shootField = shootField;
                $scope.addBoard = addBoard;
                $scope.BattleshipService = BattleshipService;

                BattleshipService.addOnShootCallback(updateBoardAndTurn);
                BattleshipService.addDefeatCallback(onDefeat);
                BattleshipService.addWinCallback(showResults);
            };

            init();

        }
    ]);

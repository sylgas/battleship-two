angular.module('application.controllers')
    .controller('GameController', ['$scope', '$stateParams', 'BattleshipService', 'LoggedUser', 'DeployShipsService',
        function ($scope, $stateParams, BattleshipService, LoggedUser, DeployShipsService) {

            var SHIP_COLOR = 'green';
            var WRECK_COLOR = 'red';
            var SEA_COLOR = 'navy';
            var DEFAULT_MY_SHIP = 'black';

            var boards = {};

            function changeRectColor(rect, color) {
                rect.path.fillColor = color;
                rect.color = color;
                paper.view.update();
            }

            function addBoard(board, user) {
                boards[user.username] = board;
                if (user.username == $scope.loggedUser.username) {
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

            function updateBoard(user, x, y, status) {
                var board = boards[user.username];
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
                $scope.$apply();
            }

            function shootField(rects, x, y) {
                if (BattleshipService.isMyTurn) {
                    BattleshipService.shoot($scope.current.user, x, y);
                    $scope.$apply();
                }

            }

            function initBoard() {
                var ships = DeployShipsService.getShips();
                var rects = boards[$scope.loggedUser.username].rects;

                for (var x = 0; x < 10; x++) {
                    for (var y = 0; y < 10; y++) {
                        if (ships[x][y] > 0) {
                            changeRectColor(rects[x][y], DEFAULT_MY_SHIP);
                        }
                    }
                }
                updateBoardView();
            }

            function generateShareLink(name, description, url_within_site) {
                var app_id = 667786046658251
                var link = "http://battleship-tilius.rhcloud.com/" + url_within_site
                var picture = "http://images.wildtangent.com/battleshippopcap/big_icon.png"
                name = escape(name)
                var caption = escape("Battleship TWO")
                description = escape(description)
                var redirect_uri = link
                return "http://www.facebook.com/dialog/feed" +
                    "?app_id=" + app_id +
                    "&link=" + link +
                    "&picture=" + picture +
                    "&name=" + name +
                    "&caption=" + caption +
                    "&description=" + description +
                    "&redirect_uri=" + redirect_uri
            }

            // TODO place into the after-game view
            // generateShareLink("Battleship TWO - Game Won!", "Just won a game with " + opponent_name, "")
            // generateShareLink("Battleship TWO - Ranking!", "You're at the place " + place + " in the ranking", "ranking")

            var init = function () {
                $scope.game = BattleshipService.getGame($stateParams.gameName);
                $scope.loggedUser = LoggedUser.getUser();
                $scope.users = $scope.game.participants.filter(
                    function (participant) {
                        return participant.name !== $scope.loggedUser.username;
                    }
                );
                $scope.current = {user: $scope.users[0]};
                $scope.shootField = shootField;
                $scope.addBoard = addBoard;
                $scope.BattleshipService = BattleshipService;

                BattleshipService.addOnShootCallback(updateBoard);
            };

            init();

        }
    ]);

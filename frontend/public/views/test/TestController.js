angular.module('application.controllers')
    .controller('TestController', ['$scope', 'TestService', '_', 'CookiesService',
        function($scope, TestService, _, CookiesService) {

            var init = function() {
                var user = CookiesService.getCookie('user');
                console.log(user.username);
                $scope.username = user.username;

                var socket = io();

                socket.emit("initial_message_from", $scope.username)

                socket.on('available_games', function(games) {
                    console.log(games);
                    $scope.availableGames = games;
                });

                $scope.onCreateGameClick = function() {
                    socket.emit('create_game',{
                        //gameName: $scope.createdGameName,
                        gameName: $scope.username + "_new_game_" + Math.floor((Math.random() * 10) + 1),
                        user: $scope.username
                    });
                }

                $scope.onJoinGameClick = function(gameName) {
                    socket.emit('join_game',{
                        //gameName: gameName,
                        gameName: "tetris",
                        user: $scope.username
                    });

                    socket.on('successfully_joined', function(data) {
                        console.log("Successfully joined to " + data.gameName);
                        $scope.currentGame = $scope.availableGames[data.gameName];
                    });
                }

                $scope.onMovePerformed = function(move) {
                    //game contains round, gameName, coords and some extra meta
                    socket.emit('move_performed',{
                        move: move
                    });

                    socket.on('move_successfully_performed', function(data) {
                        log.console("Move successfully performed")
                    });
                }

            };

            init();

        }
    ]);

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

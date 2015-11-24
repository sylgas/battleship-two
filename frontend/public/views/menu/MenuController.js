angular.module('application.controllers')
    .controller('MenuController', ['$scope', '$state', 'MenuService', '_', 'CookiesService',
        function($scope, $state, TestService, _, CookiesService) {

            $scope.isLoading = undefined;
            $scope.username = undefined;

            //socket.emit('create_game',{
            //    //gameName: $scope.createdGameName,
            //    gameName: $scope.username + "_new_game_" + Math.floor((Math.random() * 10) + 1),
            //    user: $scope.username
            //});

            $scope.onJoinRandomGameClick = function(gameName) {
                socket.emit('join_game',{
                    //gameName: gameName,
                    gameName: "tetris",
                    user: $scope.username
                });

                socket.on('successfully_joined', function(data) {
                    console.log("Successfully joined to " + data.gameName);
                    $scope.currentGame = $scope.availableGames[data.gameName];
                });
            };

            $scope.onMovePerformed = function(move) {
                //game contains round, gameName, coords and some extra meta
                socket.emit('move_performed',{
                    move: move
                });

                socket.on('move_successfully_performed', function(data) {
                    log.console("Move successfully performed")
                });
            };

            $scope.joinRandomGame = function() {
                console.log("join random game");
            };

            var init = function() {
                var user = CookiesService.getCookie('user');
                $scope.username = user.username;

                //var socket = io();
                //
                //socket.emit("initial_message_from", $scope.username)
                //
                //socket.on('avaialable_games', function(games) {
                //    console.log(games);
                //    $scope.availableGames = games;
                //});
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

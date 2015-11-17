angular.module('application.controllers')
    .controller('TestController', ['$scope', 'TestService', '_', 'CookiesService',
        function($scope, TestService, _, CookiesService) {

            var init = function() {
                var user = CookiesService.getCookie('user');
                console.log(user.username);
                $scope.username = user.username;

                var socket = io();
                socket.on('message_from_server', function(data) {
                    console.log(JSON.stringify(data));

                    socket.emit('message_from_client', 'string message from client');
                });

                $scope.onCreateGameClick = function() {
                    //socket.emit('create_game');
                }

            };

            init();

        }
    ]);

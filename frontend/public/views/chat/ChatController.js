angular.module('application.controllers')
    .controller('ChatController', ['$scope', '_', 'LoggedUser',
        function($scope, _, LoggedUser) {

            var socket = io();

            $scope.user = LoggedUser.getUser();

            socket.on('chat_message_from_all', function(data) {
                //update view
                console.log(data.user + " wrote: " + data.message);
            });


            $scope.sendMessage = function() {
                var data = {
                    "user": $scope.user.username,
                    "message": this.text
                };
                socket.emit('chat_message_to_all', data);
            };
        }
    ]);
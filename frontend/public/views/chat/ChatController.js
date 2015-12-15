angular.module('application.controllers')
    .controller('ChatController', ['$scope', '_', 'LoggedUser', '$timeout',
        function($scope, _, LoggedUser, $timeout) {

            var socket = io();

            $scope.user = LoggedUser.getUser();

            $scope.messages = [];

            socket.on('chat_message_from_all', function(data) {
                $timeout(function() {
                    $scope.messages.push(data);
                    $timeout(function() {
                        var messagesList = document.getElementById('messages');
                        messagesList.scrollTop = messagesList.scrollHeight;
                    });
                });
            });


            $scope.sendMessage = function() {
                var data = {
                    "user": $scope.user.username,
                    "message": this.text,
                };
                this.text = "";
                socket.emit('chat_message_to_all', data);
            };
        }
    ]);

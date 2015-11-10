angular.module('application.controllers')
    .controller('TestController', ['$scope', 'TestService', '_', 'LoggedUser',
        function ($scope, TestService, _, LoggedUser) {

            var init = function() {
                $scope.variable = 'test string';
            };

            init();

        }
    ]);
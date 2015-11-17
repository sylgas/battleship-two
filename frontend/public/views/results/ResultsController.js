angular.module('application.controllers')
    .controller('ResultsController', ['$scope', 'TestService', '_', 'LoggedUser',
        function ($scope, TestService, _, LoggedUser) {
            $scope.results = {
                shots : 1,
                hits : 2,
                drown : 3,
                hit_own:4,
                drown_own:5,
                position:6,
                rating_points:7
            }


        }
    ]);
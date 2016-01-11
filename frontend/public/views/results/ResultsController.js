angular.module('application.controllers')
    .controller('ResultsController', ['$scope', '_', 'LoggedUser', '$stateParams',
        function($scope, _, LoggedUser, $stateParams) {
            console.log($stateParams);
            var sampleResults = {
                shots: 1,
                hits: 2,
                drown: 3,
                hit_own: 4,
                drown_own: 5,
            }

            $scope.results = sampleResults;

            $scope.pvp = [{
                username: "xyz",
                shots: 2,
                hits: 1,
                sinks: 0
            }]


        }
    ]);
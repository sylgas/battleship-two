angular.module('application.controllers')
    .controller('ResultsController', ['$scope', '_', 'LoggedUser',
        function ($scope, _, LoggedUser) {
            var sampleResults = {
                shots : 1,
                hits : 2,
                drown : 3,
                hit_own:4,
                drown_own:5,
                position:6,
                rating_points:7
            }

            $scope.overall = [
                {
                    user_id:1,
                    username:"abc",
                    results : sampleResults
                },
                {
                    user_id:2,
                    username:"xyz",
                    results : sampleResults
                }
            ]


        }
    ]);
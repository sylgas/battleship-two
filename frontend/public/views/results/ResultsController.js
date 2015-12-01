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

            $scope.visible = {
                "abc":true,
                "xyz":false
            }

            $scope.toggle_visibility = function(user){
                $scope.visible[user] = !$scope.visible[user]
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

            $scope.pvp = [
                {
                    username:"abc",
                    players:[
                        {
                            username:"xyz",
                            shots:1,
                            hits:1,
                            sinks:1
                        }
                    ]
                },
                {
                    username:"xyz",
                    players:[
                        {
                            username:"abc",
                            shots:2,
                            hits:1,
                            sinks:0
                        }
                    ]
                }
            ]


        }
    ]);
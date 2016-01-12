angular.module('application.controllers')
    .controller('ResultsController', ['$scope', '_', 'LoggedUser', '$stateParams',
        function($scope, _, LoggedUser, $stateParams) {
            

            $scope.results = $stateParams.data;

        }
    ]);
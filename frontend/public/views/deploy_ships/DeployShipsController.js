angular.module('application.controllers')
    .controller('DeployShipsController', ['$scope', '_', 'DeployValidatorService',
        function ($scope, _, DeployValidatorService) {

            var BOARD_SIZE = 10;
            var WHITE_COLOR = 'white';
            var GREEN_COLOR = 'green';

            var init = function() {
                $scope.current_ships = Array.apply(null, {length: DeployValidatorService.configuration.sizes.length+1})
                        .map(function () { return 0; });
            };

            $scope.onDeployClick = function(rects, i, j) {
                if (rects[i][j].color === WHITE_COLOR) {
                    if(isValidShipPlacement(rects, i, j)) {
                        rects[i][j].path.fillColor = GREEN_COLOR;
                        rects[i][j].color = GREEN_COLOR;
                    }
                } else {
                    rects[i][j].path.fillColor = WHITE_COLOR;
                    rects[i][j].color = WHITE_COLOR;
                }
                $scope.current_ships = DeployValidatorService.validate(rects, i, j, isShip);
            };

            var isShip = function(rects, x, y) {
                if(x >= 0 && x < BOARD_SIZE && y >=0 && y < BOARD_SIZE) {
                    if (rects[x][y].color === GREEN_COLOR) {
                        return true;
                    }
                }
                return false;
            };

            var isValidShipPlacement = function(rects, x, y) {
                if(x > 0) {
                    if(y > 0 && rects[x - 1][y - 1].color === GREEN_COLOR) {
                        return false;
                    }
                    if(y < BOARD_SIZE-1 && rects[x - 1][y + 1].color === GREEN_COLOR) {
                        return false;
                    }
                }
                if(x < BOARD_SIZE-1) {
                    if(y > 0 && rects[x + 1][y - 1].color === GREEN_COLOR) {
                        return false;
                    }
                    if(y < BOARD_SIZE-1 && rects[x + 1][y + 1].color === GREEN_COLOR) {
                        return false;
                    }
                }
                return true;
            };

            init();

        }
    ]);
angular.module('application.services').
    service('DeployShipsService', function () {

        var initMock = function () {
            var ships = [];
            for (var i = 0; i < 10; i++) {
                ships[i] = [];
                for (var j = 0; j < 10; j++) {
                    ships[i][j] = 0;
                    if (i == j) {
                        ships[i][j] = 1;
                    }
                }
            }
            return ships;
        };

        var ships;

        this.setShips = function (deployedShips) {
            ships = deployedShips;
        };

        this.getShips = function () {
            return ships;
        };

        this.setShips(initMock());
    });

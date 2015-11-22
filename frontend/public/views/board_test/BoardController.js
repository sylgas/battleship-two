angular.module('application.controllers')
    .controller('BoardController', ['$scope', '_', 'BoardValidatorService',
        function ($scope, _, BoardValidatorService) {

            var BOARD_SIZE = 10;
            var BOARD_PIXEL_SIZE = 500;
            var WHITE_COLOR = 'white';
            var GREEN_COLOR = 'green';
            var BLACK_COLOR = 'black';
            var rects = [];

            var getRect = function(x, y) {
                return rects[Math.floor(x*BOARD_SIZE/BOARD_PIXEL_SIZE), Math.floor(y*BOARD_SIZE/BOARD_PIXEL_SIZE)]
            };

            var getRectToDraw = function(i, j) {
                path = new Path.Rectangle(new Rectangle(i*BOARD_PIXEL_SIZE/BOARD_SIZE + 1, j*BOARD_PIXEL_SIZE/BOARD_SIZE + 1, BOARD_PIXEL_SIZE/BOARD_SIZE, BOARD_PIXEL_SIZE/BOARD_SIZE));
                path.strokeColor = BLACK_COLOR;
                path.fillColor = WHITE_COLOR;
                if(!rects[i]) {
                    rects[i] = [];
                }
                rects[i][j] = {
                    path: path,
                    color: WHITE_COLOR
                };
                rects[i][j].path.onClick = function(e) {
                    if (rects[i][j].color === WHITE_COLOR) {
                        if(isValidShipPlacement(i, j)) {
                            rects[i][j].path.fillColor = GREEN_COLOR;
                            rects[i][j].color = GREEN_COLOR;
                        }
                    } else {
                        rects[i][j].path.fillColor = WHITE_COLOR;
                        rects[i][j].color = WHITE_COLOR;
                    }
                    $scope.current_ships = BoardValidatorService.validate(rects, isShip);
                };
            };

            var init = function() {
                paper.install(window);
                paper.setup('canvas');

                var path1 = new Path(new Point(1, 1),new Point(1, BOARD_PIXEL_SIZE+1));
                path1.strokeColor = BLACK_COLOR;
                var path2 = new Path(new Point(1, BOARD_PIXEL_SIZE+1),new Point(BOARD_PIXEL_SIZE+1, BOARD_PIXEL_SIZE+1));
                path2.strokeColor = BLACK_COLOR;
                var path3 = new Path(new Point(BOARD_PIXEL_SIZE+1, BOARD_PIXEL_SIZE+1),new Point(BOARD_PIXEL_SIZE+1, 1));
                path3.strokeColor = BLACK_COLOR;
                var path4 = new Path(new Point(BOARD_PIXEL_SIZE+1, 1),new Point(1, 1));
                path4.strokeColor = BLACK_COLOR;

                i = 0;
                j = 0;
                while(i < BOARD_SIZE) {
                    while (j < BOARD_SIZE) {
                        getRectToDraw(i, j);
                        j += 1;
                    }
                    i += 1;
                    j = 0;
                }

                $scope.current_ships = BoardValidatorService.validate(rects, isShip);
            };

            var isShip = function(x, y) {
                if(x >= 0 && x < BOARD_SIZE && y >=0 && y < BOARD_SIZE) {
                    if (rects[x][y].color === GREEN_COLOR) {
                        return true;
                    }
                }
                return false;
            };

            var isValidShipPlacement = function(x, y) {
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
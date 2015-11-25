angular.module('application.directives')
    .directive('board', ['_',
        function (_) {
            return {
                restrict: 'E',
                replace: true,
                templateUrl: 'views/board/board.html',
                scope: {
                    onClick: '=',
                    onBoardCreated: '=',
                    user: '='
                },
                link: function (scope) {
                    var BOARD_PIXEL_SIZE = 500;
                    var WHITE_COLOR = 'white';
                    var BLACK_COLOR = 'black';
                    var rects = [];

                    var getRectToDraw = function (p, i, j) {
                        path = new Path.Rectangle(new Rectangle(i * BOARD_PIXEL_SIZE / 10 + 1, j * BOARD_PIXEL_SIZE / 10 + 1, BOARD_PIXEL_SIZE / 10, BOARD_PIXEL_SIZE / 10));
                        path.strokeColor = BLACK_COLOR;
                        path.fillColor = WHITE_COLOR;
                        if (!rects[i]) {
                            rects[i] = [];
                        }
                        rects[i][j] = {
                            path: path,
                            color: WHITE_COLOR
                        };
                        rects[i][j].path.onClick = function () {
                            if (scope.onClick) {
                                scope.onClick(rects, i, j);
                            }
                        };
                    };

                    var init = function () {
                        paper.install(window);
                        canvases = document.getElementsByTagName('canvas');
                        p = paper.setup(canvases[canvases.length - 1]);

                        var path1 = new Path(new Point(1, 1), new Point(1, BOARD_PIXEL_SIZE + 1));
                        path1.strokeColor = BLACK_COLOR;
                        var path2 = new Path(new Point(1, BOARD_PIXEL_SIZE + 1), new Point(BOARD_PIXEL_SIZE + 1, BOARD_PIXEL_SIZE + 1));
                        path2.strokeColor = BLACK_COLOR;
                        var path3 = new Path(new Point(BOARD_PIXEL_SIZE + 1, BOARD_PIXEL_SIZE + 1), new Point(BOARD_PIXEL_SIZE + 1, 1));
                        path3.strokeColor = BLACK_COLOR;
                        var path4 = new Path(new Point(BOARD_PIXEL_SIZE + 1, 1), new Point(1, 1));
                        path4.strokeColor = BLACK_COLOR;

                        i = 0;
                        j = 0;
                        while (i < 10) {
                            while (j < 10) {
                                getRectToDraw(p, i, j);
                                j += 1;
                            }
                            i += 1;
                            j = 0;
                        }
                        paper.view.draw();

                        if (scope.onBoardCreated) {
                            scope.onBoardCreated({rects: rects}, scope.user);
                        }
                    };

                    init();
                }
            }
        }
    ]);
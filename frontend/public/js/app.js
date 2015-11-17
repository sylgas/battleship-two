var application = angular.module('application-name',
    ['ui.router', 'application.controllers', 'application.services', 'application.factories', 'application.directives']);

application.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.when("", "/test");
    $urlRouterProvider.otherwise("/test");

    $stateProvider
        .state('test', {
            abstract: false,
            url: '/test',
            templateUrl: 'views/test/test.html',
            controller: 'TestController'
        })
        .state('board_test', {
            abstract: false,
            url: '/board_test',
            templateUrl: 'views/board_test/board.html',
            controller: 'BoardController'
        })

}]);
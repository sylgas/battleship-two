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
        .state('game', {
            abstract: false,
            url: '/game/{gameId}',
            templateUrl: 'views/game/game.html',
            controller: 'GameController'
        })
        .state('deploy', {
            abstract: false,
            url: '/deploy',
            templateUrl: 'views/deploy_ships/deploy.html',
            controller: 'DeployShipsController'
        })

}]);
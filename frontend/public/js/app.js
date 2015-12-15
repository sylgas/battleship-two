var application = angular.module('application-name',
    ['ui.router', 'application.controllers', 'application.services', 'application.factories', 'application.directives']);

application.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.when("", "/menu");
    $urlRouterProvider.otherwise("/menu");

    $stateProvider
        .state('menu', {
            abstract: false,
            url: '/menu',
            templateUrl: 'views/menu/menu.html',
            controller: 'MenuController'
        })
        .state('game', {
            abstract: false,
            url: '/game',
            templateUrl: 'views/game/game.html',
            controller: 'GameController',
            params: {myParam: null}
        })
        .state('deploy', {
            abstract: false,
            url: '/deploy',
            templateUrl: 'views/deploy_ships/deploy.html',
            controller: 'DeployShipsController'
        })
        .state('create_game', {
            abstract: false,
            url: '/create_game',
            templateUrl: 'views/create_game/createGame.html',
            controller: 'CreateGameController'
        })
        .state('join_game', {
            abstract: false,
            url: '/join_game',
            templateUrl: 'views/join_game/join_game.html',
            controller: 'JoinGameController'
        });

}]);
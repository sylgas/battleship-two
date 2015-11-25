angular.module('application.factories').
    factory('LoggedUser', ['CookiesService', function (CookiesService) {
        var sessionToken;
        var sessionTokenCookieKey = 'sessionToken';
        var userCookieKey = 'user';
        var user;

        function init() {
            sessionToken = CookiesService.getCookie(sessionTokenCookieKey);
            user = CookiesService.getCookie(userCookieKey);
        }

        var loggedUser = {};

        loggedUser.getToken = function () {
            return sessionToken;
        };

        loggedUser.setToken = function (token) {
            sessionToken = token;
            CookiesService.setCookie(sessionTokenCookieKey, sessionToken);
        };

        loggedUser.removeToken = function () {
            CookiesService.removeCookie(sessionTokenCookieKey);
            sessionToken = null;
        };

        loggedUser.isLogged = function () {
            return sessionToken !== null && sessionToken !== undefined && sessionToken !== ''
        };

        loggedUser.getName = function () {
            return user.username;
        };

        loggedUser.getUser = function () {
            return user;
        };

        init();

        return loggedUser

    }]);
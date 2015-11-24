angular.module('application.factories').
    factory('LoggedUser', ['CookiesService', function (CookiesService) {
        var sessionToken;
        var sessionTokenCookieKey = 'sessionToken';
        var username = null;

        function init() {
            sessionToken = CookiesService.getCookie(sessionTokenCookieKey);
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
            return username;
        };

        init();

        return loggedUser

    }]);
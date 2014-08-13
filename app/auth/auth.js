/**
 * Created by james on 11/08/14.
 */
var auth = angular.module('ehu.auth', []);

auth.constant('AUTH_EVENTS', {
    loginSuccess: 'auth-login-success',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
});

auth.constant('SERVER', 'http://bosh.metajack.im:5280/xmpp-httpbind');

// Session management.
auth.service('Session', function ($q) {
    this.create = function (userId, userPass, con) {
        this.userId = userId;
        this.userPass = userPass;
        // connection : Strophe.Connection
        this.connection = con;
    };
    this.destroy = function () {
        this.userId = null;
        this.userPass = null;
        this.connection = null;
    };
    this.isAuthenticated = function () {
        return !!this.userId;
    };
    this.getConnection = function () {
        if (this.connection) {
            return $q.when(this.connection);
        } else {
            return $q.reject();
        }
    };
    return this;
});

auth.factory('AuthService', function ($http, $q, Session, SERVER) {
    var authService = {};

    authService.login = function (credentials) {
        // async call, returns a promise.
        function connect() {
            var deferred = $q.defer();
            var connection = new Strophe.Connection(SERVER);
            connection.connect(credentials.username, credentials.password, function (status, error) {
                if (status === Strophe.Status.CONNECTED) {
                    // success
                    deferred.resolve(connection);
                } else if (error) {
                    deferred.reject(error);
                } // TODO: need to handle other statuses?
            });
            return deferred.promise;
        }
        return connect()
            .then(function (con) {
                Session.create(con.authzid, con.pass, con);
            });
    };

    return authService;
});

auth.controller('LoginController', function ($scope, $rootScope, AUTH_EVENTS, AuthService) {
    $scope.credentials = {
        username: '',
        password: ''
    };
    $scope.error = null;
    $scope.login = function (credentials) {
        AuthService.login(credentials).then(function () {
            $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
        }, function (error) {
            $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
            $scope.error = error;
        });
    };
});

auth.directive('loginDialog', function (AUTH_EVENTS) {
    return {
        restrict: 'A',
        template: '<div ng-if="visible" ng-include="\'auth/login-form.html\'">',
        link: function (scope) {
            var showDialog = function () {
                scope.visible = true;
            };
            function hideDialog() {
                scope.visible = false;
            }
            function showError() {
                scope.failure = true;
            }
            scope.visible = false;
            scope.failure = false;
            // reset dialog status when route changes.
            scope.$on('$routeChangeSuccess', hideDialog);
            scope.$on('$routeChangeError', showDialog);
            scope.$on(AUTH_EVENTS.sessionTimeout, showDialog);
            scope.$on(AUTH_EVENTS.loginSuccess, hideDialog);
            scope.$on(AUTH_EVENTS.loginFailed, showError);
        }
    };
});

// fix the form auto fill issue.
auth.directive('formAutofillFix', function ($timeout) {
    return function (scope, element, attrs) {
        element.prop('method', 'post');
        if (attrs.ngSubmit) {
            $timeout(function () {
                element
                    .unbind('submit')
                    .bind('submit', function (event) {
                        event.preventDefault();
                        element
                            .find('input, textarea, select')
                            .trigger('input')
                            .trigger('change')
                            .trigger('keydown');
                        scope.$apply(attrs.ngSubmit);
                    });
            });
        }
    };
});
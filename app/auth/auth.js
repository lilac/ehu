/**
 * Created by james on 11/08/14.
 */
var auth = angular.module('ehu.auth', ['ui.bootstrap']);

auth.constant('AUTH_EVENTS', {
    loginSuccess: 'auth-login-success',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
});

//auth.constant('SERVER', 'http://bosh.metajack.im:5280/xmpp-httpbind');
auth.constant('SERVER', 'http://localhost:7070/http-bind/');

// Session management.
auth.service('Session', function ($q, $modal) {
    this.create = function create(userId, userPass, con) {
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
            var dialog = $modal.open({
                templateUrl: 'auth/login-form.html',
                controller: 'LoginCtrl'
            });
            var session = this;
            return dialog.result.then(function (con) {
                session.create(con.authzid, con.pass, con);
                return con;
            });
        }
    };
});

auth.factory('AuthService', function ($http, $q, SERVER) {
    var authService = {};

    // async call, returns a promise.
    authService.login = function (credentials) {
        var deferred = $q.defer();
        var connection = new Strophe.Connection(SERVER);
        connection.connect(credentials.username, credentials.password, function (status, error) {
            switch (status) {
                case Strophe.Status.CONNECTED: // success
                    deferred.resolve(connection);
                    break;
                case Strophe.Status.ERROR:
                    error = error || 'error';
                case Strophe.Status.CONNFAIL:
                    error = error || 'connection-fail';
                case Strophe.Status.AUTHFAIL:
                    error = error || 'auth-fail';
                    // Openfire server seems not set error msg correctly.
                    deferred.reject(error);
                    break;
                default:
                    // ignore other cases.
            }
        });
        return deferred.promise;
    };

    return authService;
});

auth.controller('LoginCtrl', function ($scope, $rootScope, $route, AUTH_EVENTS, AuthService) {
    $scope.credentials = {
        username: '',
        password: ''
    };
    $scope.login = function (credentials) {
        // reset errors.
        $scope.error = null;
        console.log('info', 'trying to login.');
        // There is a bug in Strophe.getBareJidFromJid(jid) which returns null
        // when jid is empty. Therefore we set a non-empty default name.
        credentials.username = credentials.username || 'anonymous';
        AuthService.login(credentials).then(function (con) {
            $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
            // upon successful login, close the dialog with the connection promise.
            $scope.$close(con);
            console.log('info', 'log in successfully.');
        }, function (error) {
            $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
            console.log('error', error);
            $scope.error = $scope.error || error;
        });
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
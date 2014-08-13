/**
 * Created by james on 1/08/14.
 */
var app = angular.module('ehu', ['ngRoute', 'ehu.controller', 'ehu.auth']);

app.controller('NavCtrl', function($scope, $location) {
    $scope.isActive = function(path) {
        return path === $location.path();
    };
});

app.controller('ApplicationCtrl', function ($scope) {
    // strophe connection
    $scope.connection = null;

    $scope.setConnection = function (con) {
        $scope.connection = con;
    };
});

var router = function($routeProvider) {
    $routeProvider.when('/explore', {
        templateUrl: 'partials/explore.html',
        controller: 'ExploreCtrl'
    }).when('/sessions', {
        templateUrl: 'partials/sessions.html',
        controller: 'SessionCtrl',
        auth: true
    }).when('/contacts', {
        templateUrl: 'partials/contacts.html',
        controller: 'ContactCtrl',
        auth: true
    });
};

app.config(router);
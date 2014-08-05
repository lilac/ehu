/**
 * Created by james on 1/08/14.
 */
var app = angular.module('ehu', ['ngRoute', 'ehu.controller']);

app.controller('NavCtrl', function($scope, $location) {
    $scope.isActive = function(path) {
        return path === $location.path();
    };
});

var router = function($routeProvider) {
    $routeProvider.when('/explore', {
        templateUrl: 'partials/explore.html',
        controller: 'ExploreCtrl'
    }).when('/sessions', {
        templateUrl: 'partials/sessions.html',
        controller: 'SessionCtrl'
    }).when('/contacts', {
        templateUrl: 'partials/contacts.html',
        controller: 'ContactCtrl'
    });
};

app.config(router);
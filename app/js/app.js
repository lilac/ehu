/**
 * Created by james on 1/08/14.
 */
var app = angular.module('ehu', ['ngRoute', 'ehu.controller', 'ehu.auth']);

app.controller('NavCtrl', function($scope, $location) {
    $scope.isActive = function(path) {
        return path === $location.path();
    };
});

app.config(function ($routeProvider) {
    $routeProvider.when('/explore', {
        templateUrl: 'partials/explore.html',
        controller: 'ExploreCtrl'
    }).when('/sessions', {
        templateUrl: 'partials/sessions.html',
        controller: 'SessionCtrl',
        resolve: {
            connection: ['Session', function (Session) { return Session.getConnection(); }]
        }
    }).when('/contacts', {
        templateUrl: 'partials/contacts.html',
        controller: 'ContactCtrl',
        resolve: {
            connection: ['Session', function (Session) { return Session.getConnection(); }]
        }
    }).otherwise({
        redirectTo: '/explore'
    });
});
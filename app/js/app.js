/**
 * Created by james on 1/08/14.
 */
var app = angular.module('ehu', ['ngRoute', 'ehu.controller', 'ehu.auth', 'ehu.contact']);

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
            connection: requireConnection
        }
    }).when('/contacts', {
        templateUrl: 'contact/contacts.html',
        controller: 'ContactCtrl',
        resolve: {
            connection: requireConnection
        }
    }).otherwise({
        redirectTo: '/explore'
    });
});

var requireConnection = ['Session', function (Session) {
    return Session.getConnection();
    }
];
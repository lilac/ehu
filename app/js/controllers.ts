/**
 * Created by james on 4/08/14.
 */

/// <reference path="typings/angularjs/angular.d.ts"/>
var controllers = angular.module('ehu.controller', []);

controllers.controller('ExploreCtrl', function ($scope) {
    $scope.page = 'Explore';
});

controllers.controller('SessionCtrl', function ($scope) {
    $scope.page = 'Sessions';
});

controllers.controller('ContactCtrl', function ($scope) {
    $scope.page = 'Contacts';
})
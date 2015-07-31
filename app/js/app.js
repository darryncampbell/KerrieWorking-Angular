'use strict';

/* App Module */

var kerrieWorkingApp = angular.module('kerrieWorkingApp', [
  'ui.router',
  'ngRoute',
  'kerrieWorkingAnimations',
  'kerrieWorkingControllers'
]);

kerrieWorkingApp.config(['$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {

      $stateProvider
        .state("contacts", {
          url: "/contacts/:theDay",
          templateUrl: 'partials/day-detail.html',
          controller: 'DayDetailCtrl'
        })
        .state("daylist", {
          url: "/daylist",
          templateUrl: 'partials/day-list.html',
          controller: 'DayListCtrl'
        });
     $urlRouterProvider.otherwise("/daylist");   

  }]);

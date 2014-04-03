'use strict';

var BeneApp = angular.module('BeneApp', ['ui.bootstrap', 'heShared']);

// Routing
BeneApp.config(['$routeProvider', function ($routeProvider) {
  $routeProvider
    .when('/', {
      controller: 'NotificationController',
      templateUrl: heNS.rootUrl + 'Apps/Member/Beneficiaries/html/Notification.html'
    })
      .when('/list', {
        controller: 'ListController',
        templateUrl: heNS.rootUrl + 'Apps/Member/Beneficiaries/html/List.html'
      })
        .when('/editBene', {
          controller: 'EditBeneDialogController',
          templateUrl: heNS.rootUrl + 'Apps/Member/Beneficiaries/html/dialogs/EditBeneDialog.html'
        })
    .otherwise({ redirectTo: '/' });
}]);


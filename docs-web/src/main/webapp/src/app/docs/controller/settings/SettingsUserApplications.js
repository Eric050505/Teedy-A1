'use strict';

/**
 * Settings user applications controller.
 */
angular.module('docs').controller('SettingsUserApplications', function($scope, $state, Restangular, $dialog) {
  /**
   * Load user applications.
   */
  $scope.loadApplications = function() {
    Restangular.one('userapplication').get().then(function(data) {
      $scope.applications = data;
    });
  };

  /**
   * Approve a user application.
   */
  $scope.approveApplication = function(application) {
    var user = {
      username: application.username,
      email: application.email,
      password: application.password,
      storage_quota: 100000000 // 10GB default storage quota
    };

    // Create new user
    Restangular.one('user').put(user).then(function() {
      // Remove from application list
      $scope.removeApplication(application);
      
      var title = 'Application Approved';
      var msg = 'User ' + user.username + ' has been created successfully';
      var btns = [{result: 'ok', label: 'OK', cssClass: 'btn-primary'}];
      $dialog.messageBox(title, msg, btns);
    }, function() {
      var title = 'Approval Failed';
      var msg = 'Failed to create user, please try again later';
      var btns = [{result: 'ok', label: 'OK', cssClass: 'btn-primary'}];
      $dialog.messageBox(title, msg, btns);
    });
  };

  /**
   * Reject a user application.
   */
  $scope.rejectApplication = function(application) {
    var title = 'Confirm Rejection';
    var msg = 'Are you sure you want to reject the application from ' + application.username + '?';
    var btns = [
      { result:'cancel', label: 'Cancel' },
      { result:'ok', label: 'OK', cssClass: 'btn-primary' }
    ];

    $dialog.messageBox(title, msg, btns, function(result) {
      if (result === 'ok') {
        $scope.removeApplication(application);
      }
    });
  };

  /**
   * Remove an application from the list.
   */
  $scope.removeApplication = function(application) {
    Restangular.one('userapplication', application.username).remove().then(function() {
      $scope.loadApplications();
    }, function() {
      var title = 'Delete Failed';
      var msg = 'Unable to delete application, please try again later';
      var btns = [{result: 'ok', label: 'OK', cssClass: 'btn-primary'}];
      $dialog.messageBox(title, msg, btns);
    });
  };

  // Load applications on init
  $scope.loadApplications();
}); 
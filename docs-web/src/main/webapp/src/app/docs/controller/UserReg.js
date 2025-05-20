'use strict';

/**
 * User registration controller.
 */
angular.module('docs').controller('UserReg', function($scope, $state, $dialog, Restangular) {
  $scope.user = {};

  /**
   * Register a new user.
   */
  $scope.register = function() {
    // Submit application through API
    Restangular.one('userapplication').put($scope.user).then(function() {
      var title = 'Application Submitted';
      var msg = 'Your registration application has been submitted. Please wait for admin approval.';
      var btns = [{result: 'ok', label: 'OK', cssClass: 'btn-primary'}];
      $dialog.messageBox(title, msg, btns).then(function() {
        $state.go('login');
      });
    }, function(response) {
      var title = 'Application Failed';
      var msg = 'Failed to submit application. ';
      if (response.data.type === 'DuplicateUsername') {
        msg += 'This username is already in the application list.';
      } else {
        msg += 'Please try again later.';
      }
      var btns = [{result: 'ok', label: 'OK', cssClass: 'btn-primary'}];
      $dialog.messageBox(title, msg, btns);
    });
  };
}); 
'use strict';

/* Controllers */

function IndexCtrl($scope, $http) {   // q: angular.module('todoApp', [])  .controller('TodoListController', function() {
  $http.get('/api/posts').
    success(function(data, status, headers, config) {
      $scope.posts = data.posts;
    });
}

function LoginCtrl($scope, $http) {   
  $http.get('/api/currentuser').
    success(function(data) {
      $scope.userOnClient = data.currentUser;
    });
}

function AddPostCtrl($scope, $http, $location) {
  $scope.form = {};
  $scope.submitPost = function () {
    console.log('post: ', $scope.form);
    $http.post('/api/post', $scope.form).
      success(function(data) {
        $location.path('/');
      });
  };
}

function ReadPostCtrl($scope, $http, $routeParams) {
  $http.get('/api/post/' + $routeParams.id).
    success(function(data) {
       console.log(data.post);
      $scope.post = data.post;
    });
}

function ClonePostCtrl($scope, $http, $location, $routeParams) {
  $scope.postXX = {};  // q: wo wird ausserhalb .post noch verwendet?

  // das dient nur der anzeige , könnte man auch weglassen
  $http.get('/api/post/' + $routeParams.id).
    success(function(data) {
      console.log(data.post);
      $scope.postXX = data.post;
   });
   // q: Das jetzt über promises?

    // hier wird der clone call abgesetzt
   $http.get('/api/clone/' + $routeParams.id).
      success(function(data) {
      console.log(data);
      console.log('id '+ data.id);

          $location.url('/editPost/' + data.id);
      });
}

function EditPostCtrl($scope, $http, $location, $routeParams) {
  $scope.formXX = {};
  $http.get('/api/post/' + $routeParams.id).
    success(function(data) {
      $scope.formXX = data.post;
    });

  $scope.editPost = function () {
    $http.put('/api/post/' + $routeParams.id, $scope.formXX).
      success(function(data) {
        $location.url('/readPost/' + $routeParams.id);
      });
  };
}

function DeletePostCtrl($scope, $http, $location, $routeParams) {
  $http.get('/api/post/' + $routeParams.id).
    success(function(data) {
      $scope.post = data.post;
    });

  $scope.deletePost = function () {
    $http.delete('/api/post/' + $routeParams.id).
      success(function(data) {
        $location.url('/');
      });
  };

  $scope.home = function () {
    $location.url('/');
  };
}

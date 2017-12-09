'use strict';

angular.module('myApp.view2', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view2', {
    templateUrl: 'view2/view2.html',
    controller: 'View1Ctrl' //was View2Ctrl
  });
}])

.controller('View2Ctrl', ['$location','$scope', '$http', '$cookies', function ($location, $scope, $http, $cookies) {

    $scope.doLogin = function () {
        const request = {
            method: 'post',
            url: '/form',
            data: {
                username: $scope.username,
                BUID: $scope.BUID
            }
        }
        $http(request)
            .then(function (response) {
//                        $scope.inputForm.$setPristine()
//                        $scope.username = $scope.BUID = ''
                    //var authCookie = $cookies.get('twitterAccessJwt')
                    //$scope.isAuthorized = authCookie
                    console.log(response.data)
                    $scope.members = response.data.group
                    $scope.groupNumber = response.data.groupNumber
                    $scope.cs411Auth = $cookies.get('cs411Auth')
                    $location.url('/view1')

                },
                function (error) {
                    if (error.status === 401) {
                        $scope.authorized = false
                        $scope.h2message = "Not authorized to add "
                        console.log(error)
                        console.log(error.data)
                    }
                }
            )
    }
}]);

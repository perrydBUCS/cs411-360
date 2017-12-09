'use strict'

angular.module('myApp.view1', ['ngRoute', 'ngCookies'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/view1', {
            templateUrl: 'view1/view1.html',
            controller: 'View1Ctrl'
        })
            .when('/view2', {
            templateUrl: 'view2/view2.html',
            controller: 'View1Ctrl' //was View2Ctrl
        });
    }])

    .controller('view1Ctrl', ['$location', '$scope', '$http', '$cookies', function ($location, $scope, $http, $cookies) {

        $scope.doLogin = function () {

            const request = {
                method: 'post',
//                url: 'http://localhost:3000/form',
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
                        $location.path('/view1')

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
        /*
                $scope.fields = {}
                $scope.tab1 = 'TABLE HERE';

                $scope.loadForm = function () {
                    $http.get('http://localhost:3000/form')
                        .then(function (response) {
                            $scope.members = response.data
                            console.log(response.data)
                        })
                }
        */


        $scope.submitForm = function () {
            let reviewForm = {}
            reviewForm.submitter = {}
            reviewForm.submitter.username = $scope.username
            reviewForm.submitter.BUID = $scope.BUID
            reviewForm.submitter.essay = {
                different: $scope.different,
                difficulty: $scope.difficulty,
                success: $scope.success
            }
            reviewForm.members = $scope.members
            const request = {
                method: 'post',
//                url: 'http://localhost:3000/form/submit',
                url: '/form/submit',
                data: reviewForm
            }
            $http(request)
                .then(function (response) {
                        console.log(response.data)

                    },
                    function (error) {
                            console.log(error)
                    }
                )

            console.log($scope.fields)
        }


    }])

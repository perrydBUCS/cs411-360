// Declare app level module which depends on views, and components
angular.module('cs411', ['ngRoute', 'ngCookies'])
    .config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {
        $locationProvider.hashPrefix('!');
        $routeProvider.otherwise({redirectTo: '/view2'});

        $routeProvider
            .when('/view1', {
                templateUrl: 'view1/view1.html',
                controller: 'view1Ctrl'
            })
            .when('/view2', {
                templateUrl: 'view2/view2.html',
                controller: 'view2Ctrl'
            })
    }])

    .controller('view1Ctrl', ['$window', '$location', '$scope', '$http', '$cookies', function ($window, $location, $scope, $http, $cookies) {

        $scope.members = JSON.parse($window.sessionStorage.getItem('members'))
        $scope.groupNumber = $window.sessionStorage.getItem('groupNumber')
        $scope.cs411Auth = $window.sessionStorage.getItem('cs411Auth')
        $scope.currentStudent = $window.sessionStorage.getItem('currentStudent')
//Toggle for instructions

        $scope.showInstructions = true
        $scope.instructionsButton = "Hide"

        $scope.toggleInstructions = function () {
            $scope.showInstructions = !$scope.showInstructions
            if ($scope.showInstructions) {
                $scope.instructionsButton = "Hide"
            } else {
                $scope.instructionsButton = "Show"
            }
        }

        $scope.submitForm = function () {

            let reviewForm = {}
            reviewForm.submitter = {}
            reviewForm.submitter.username = $scope.currentStudent
            reviewForm.submitter.BUID = $scope.BUID
            reviewForm.submitter.essay = {
                different: $scope.different,
                difficulty: $scope.difficulty,
                success: $scope.success
            }
            reviewForm.members = $scope.members
            const request = {
                method: 'post',
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

    .controller('view2Ctrl', ['$window', '$location', '$scope', '$http', '$cookies', function ($window, $location, $scope, $http, $cookies) {

        $scope.doLogin = function () {

            let username = $scope.username
            let BUID = $scope.BUID

            //Clear the validation message
            //
            $scope.validationMessage = ''

            //The username should not have @, and the password should start with 'U'
            //
            if ((BUID.indexOf('U') != 0)  || (BUID.length != 9)){
                $scope.validationMessage = 'Your password should start with a U, followed by your 8-digit ID'
                $location.url('/view2')

            }
            else if (username.indexOf("@") > -1) {
                $scope.validationMessage = 'Just your BU username (i.e. perryd), not your full email'
                $location.url('/view2')

            }

            else {
                const request = {
                    method: 'post',
                    url: '/form',
                    data: {
                        username: username,
                        BUID: BUID
                    }
                }
                $http(request)
                    .then(function (response) {
//                        $scope.inputForm.$setPristine()
//                        $scope.username = $scope.BUID = ''
                            //var authCookie = $cookies.get('twitterAccessJwt')
                            //$scope.isAuthorized = authCookie
                            console.log(response.data)
                            let members = response.data.group
                            let groupNumber = response.data.groupNumber
                            let currentStudent = response.data.currentStudent
                            let cs411Auth = $cookies.get('cs411Auth')
                            $window.sessionStorage.setItem('members', JSON.stringify(members))
                            $window.sessionStorage.setItem('groupNumber', groupNumber)
                            $window.sessionStorage.setItem('cs411Auth', cs411Auth)
                            $window.sessionStorage.setItem('currentStudent', currentStudent)

                            $location.url('/view1')

                        },
                        function (error) {
                            if (error.status === 401) {
                                $scope.authorized = false
                                $scope.validationMessage = 'Either your username or password was entered incorrectly, please try again'
                                console.log(error)
                                console.log(error.data)
                                $location.url('/view2')
                            }
                        }
                    )
            }
        }
    }])

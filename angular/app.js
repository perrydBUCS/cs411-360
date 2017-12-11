/*
Top-level module to manage student peer reviews for CS411
Biggest concern is support for ES6 let/const in Microsoft
browsers; MDN says that current versions do support them
 */
angular.module('cs411', ['ngRoute', 'ngCookies'])
    .config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {
        $locationProvider.hashPrefix('!')
        $routeProvider.otherwise({redirectTo: '/view2'})

        $routeProvider
            .when('/view1', {
                templateUrl: 'view1/view1.html',
                controller: 'view1Ctrl'
            })
            .when('/view2', {
                templateUrl: 'view2/view2.html',
                controller: 'view2Ctrl'
            })
            .when('/view3', {
                templateUrl: 'view3/view3.html'
            })
    }])

    //Form controller. The form itself does some rudimentary validation on ranges
    //and completeness, so we don't do any additional validation here
    //
    .controller('view1Ctrl', ['$window', '$location', '$scope', '$http', '$cookies', function ($window, $location, $scope, $http, $cookies) {

        //Not thrilled to use sessionStorage as a global here, but there doesn't
        //seem to be a clean way to share values between controllers. Could
        //use $rootScope, but I don't think there's any advantage over using the session
        //
        $scope.members = JSON.parse($window.sessionStorage.getItem('members'))
        $scope.groupNumber = $window.sessionStorage.getItem('groupNumber')
        $scope.cs411Auth = $window.sessionStorage.getItem('cs411Auth')
        $scope.currentStudent = $window.sessionStorage.getItem('currentStudent')

        //Simple toggle for instructions div
        //
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

        //submitForm passes form info to the back end for storage...could use
        //more robust error handling
        //
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
                        //Turn off submissions...de-auth on back end, also
                        //
                        $window.sessionStorage.removeItem('cs411Auth')
                        $location.url('/view3')
                    },
                    function (error) {
                        if (error.status === 401) {
                            $scope.authorized = false
                            $scope.statusMessage = 'There was a problem saving your form.'
                            $location.url('/view1')
                        } else {
                            console.log(error.data)
                        }
                    }
                )
        }


    }])

    //Login controller. In this case we do some validation on the username
    //and password fields.
    //
    .controller('view2Ctrl', ['$window', '$location', '$scope', '$http', '$cookies', function ($window, $location, $scope, $http, $cookies) {

        $scope.doLogin = function () {

            let username = $scope.username
            let BUID = $scope.BUID

            //Clear the validation message
            //
            $scope.validationMessage = ''

            //The username should not have @, and the password should start with 'U'
            //
            if ((BUID.indexOf('U') != 0) || (BUID.length != 9)) {
                $scope.validationMessage = 'Your password should start with a U, followed by your 8-digit ID'
                $location.url('/view2')

            }
            else if (username.indexOf("@") > -1) {
                $scope.validationMessage = 'Just your BU username (i.e. perryd), not your full email'
                $location.url('/view2')

            }
            //Validation passes, log the user in
            //
            else {
                const request = {
                    method: 'post',
                    url: '/form',
                    data: {
                        username: username,
                        BUID: BUID
                    }
                }
                //Again, really hate using the session to store these values, but I suppose
                //that's what it is there for...
                //
                $http(request)
                    .then(function (response) {
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

                                //Back to the login form if there was a problem
                                //
                                $location.url('/view2')
                            }
                        }
                    )
            }
        }
    }])

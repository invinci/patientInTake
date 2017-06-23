angular.module('MyApp')
    .controller('HeaderCtrl', function($scope, $route, $rootScope, $location, $window, $auth) {
        $scope.$route = $route;

        /*
         * Check user is active or not
         */
        $scope.isActive = function (viewLocation) {
            return viewLocation === $location.path();
        };
    
        /*
         * Check user authentication
         */
        $scope.isAuthenticated = function() {
            return $auth.isAuthenticated();
        };
    
        /*
         * Logout
         */
        $scope.logout = function() {
            $auth.logout();
            delete $window.localStorage.user;
            $rootScope.currentUser = '';
            $location.path('/');
        };
    });
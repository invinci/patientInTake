angular.module('MyApp')
    .controller('HeaderCtrl', function($scope, $route, $rootScope, $location, $window, $auth) {
        $scope.$route = $route;

        $scope.isActive = function (viewLocation) {
            return viewLocation === $location.path();
        };
    
        $scope.isAuthenticated = function() {
            return $auth.isAuthenticated();
        };
    
        $scope.logout = function() {
            $auth.logout();
            delete $window.localStorage.user;
            $rootScope.currentUser = '';
            $location.path('/');
        };
    });
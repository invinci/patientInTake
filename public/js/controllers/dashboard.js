angular.module('MyApp')
    .controller('DashboardCtrl', function($scope, $rootScope, $routeParams, $location, toastr, Dashboard) {

        /*
         * Get patient total records
         */
        $scope.getTotalPatients = function() {
            Dashboard.getTotalPatients()
            .then(function(response) {
                $scope.total_patient = response.data.patient;
            })
            .catch(function(response) {
                $scope.messages = {
                    error: Array.isArray(response.data) ? response.data : [response.data]
                };
            });
        };
        $scope.getTotalPatients();
        
    });
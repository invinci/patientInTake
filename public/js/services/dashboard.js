angular.module('MyApp')
    .factory('Dashboard', function($http) {
        return {
            getTotalPatients: function(data) {
                return $http.get('/get_total_patients');
            }
        };
    });
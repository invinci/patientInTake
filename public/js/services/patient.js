angular.module('MyApp')
    .factory('Patient', function($http) {
        return {
            patient: function(data) {
                return $http.put('/patient_list', data);
            },
            patientAdd: function(data) {
                return $http.post('/patient_add', data);
            },
            patientById: function(data) {
                return $http.get('/patient_edit/' + data);
            },
            patientEdit: function(data) {
                return $http.put('/patient_edit', data);
            },
            patientDelete: function(data) {
                return $http.get('/patient_delete/' + data);
            },
            patientStatus: function(data) {
                return $http.post('/patient_status/', data);
            }
        };
    });
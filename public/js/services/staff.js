angular.module('MyApp')
    .factory('Staff', function($http) {
        return {
            staff: function(data) {
                return $http.put('/staff_list', data);
            },
            staffAdd: function(data) {
                return $http.post('/staff_add', data);
            },
            staffById: function(data) {
                return $http.get('/staff_edit/' + data);
            },
            staffEdit: function(data) {
                return $http.put('/staff_edit', data);
            },
            staffDelete: function(data) {
                return $http.get('/staff_delete/' + data);
            },
            staffStatus: function(data) {
                return $http.post('/staff_status/', data);
            },
            getRoles: function(data) {
                return $http.get('/get_roles');
            },
            getSpeciality: function(data) {
                return $http.get('/get_speciality');
            }
        };
    });
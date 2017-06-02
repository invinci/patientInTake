angular.module('MyApp')
    .factory('Speciality', function($http) {
        return {
            speciality: function(data) {
                return $http.put('/speciality_list', data);
            },
            specialityAdd: function(data) {
                return $http.post('/speciality_add', data);
            },
            specialityById: function(data) {
                return $http.get('/speciality_edit/' + data);
            },
            specialityEdit: function(data) {
                return $http.put('/speciality_edit', data);
            },
            specialityDelete: function(data) {
                return $http.get('/speciality_delete/' + data);
            },
            specialityStatus: function(data) {
                return $http.post('/speciality_status/', data);
            },
            getForms: function(data) {
                return $http.get('/get_forms');
            }
        };
    });
angular.module('MyApp')
    .factory('Role', function($http) {
        return {
            role: function(data) {
                return $http.put('/role_list', data);
            },
            roleAdd: function(data) {
                return $http.post('/role_add', data);
            },
            roleById: function(data) {
                return $http.get('/role_edit/' + data);
            },
            roleEdit: function(data) {
                return $http.put('/role_edit', data);
            },
            roleDelete: function(data) {
                return $http.get('/role_delete/' + data);
            },
            roleStatus: function(data) {
                return $http.post('/role_status/', data);
            }
        };
    });
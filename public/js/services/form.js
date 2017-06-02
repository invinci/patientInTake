angular.module('MyApp')
    .factory('Form', function($http) {
        return {
            form: function(data) {
                return $http.put('/form_list', data);
            },
            formAdd: function(data) {
                return $http.post('/form_add', data);
            },
            formById: function(data) {
                return $http.get('/form_edit/' + data);
            },
            formEdit: function(data) {
                return $http.put('/form_edit', data);
            },
            formDelete: function(data) {
                return $http.get('/form_delete/' + data);
            },
            formStatus: function(data) {
                return $http.post('/form_status/', data);
            }
        };
    });
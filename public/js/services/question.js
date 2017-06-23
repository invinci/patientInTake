angular.module('MyApp')
    .factory('Question', function($http) {
        return {
            question: function(data) {
                return $http.put('/question_list', data);
            },
            questionAdd: function(data) {
                return $http.post('/question_add', data);
            },
            questionById: function(data) {
                return $http.get('/question_edit/' + data);
            },
            questionEdit: function(data) {
                return $http.put('/question_edit', data);
            },
            questionDelete: function(data) {
                return $http.get('/question_delete/' + data);
            },
            // formStatus: function(data) {
            //     return $http.post('/form_status/', data);
            // }
            getFormById: function(data) {
                return $http.get('/form_edit/' + data);
            },
            getDependentQuestions: function(data) {
                return $http.get('/get_dependent_questions/' + data);
            },
            getDependentAnswers: function(data) {
                return $http.get('/get_dependent_answers/' + data);
            }
        };
    });
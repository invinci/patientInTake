angular.module('MyApp')
    .factory('Appointment', function($http) {
        return {
            appointment: function(data) {
                return $http.put('/appointment_list', data);
            },
            bookAppointment: function(data) {
                return $http.post('/book_appointment', data);
            },
            // staffById: function(data) {
            //     return $http.get('/staff_edit/' + data);
            // },
            // staffEdit: function(data) {
            //     return $http.put('/staff_edit', data);
            // },
            // staffDelete: function(data) {
            //     return $http.get('/staff_delete/' + data);
            // },
            // staffStatus: function(data) {
            //     return $http.post('/staff_status/', data);
            // },
            // getRoles: function(data) {
            //     return $http.get('/get_roles');
            // },
            getDoctor: function(data) {
                return $http.get('/get_doctor');
            },
            getSpeciality: function(data) {
                return $http.get('/get_speciality');
            },
            getPatientDetail: function(data) {
                return $http.put('/get_patient_detail', data);
            },
        };
    });
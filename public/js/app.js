angular.module('MyApp', ['ui.calendar','ngRoute','satellizer','ng-sweet-alert','ngTable','checklist-model','ui.utils.masks','ui.bootstrap','toastr'])
    .config(function($routeProvider, $locationProvider, $authProvider) {
        $locationProvider.html5Mode(true);

        $routeProvider
        .when('/', {
            templateUrl: 'partials/login.html',
            controller: 'LoginCtrl',
            resolve: { skipIfAuthenticated: skipIfAuthenticated }
        })
        .when('/signup', {
            templateUrl: 'partials/signup.html',
            controller: 'SignupCtrl',
            resolve: { skipIfAuthenticated: skipIfAuthenticated }
        })
        .when('/account', {
            templateUrl: 'partials/profile.html',
            controller: 'ProfileCtrl',
            resolve: { loginRequired: loginRequired }
        })
        .when('/forgot', {
            templateUrl: 'partials/forgot.html',
            controller: 'ForgotCtrl',
            resolve: { skipIfAuthenticated: skipIfAuthenticated }
        })
        .when('/reset/:token', {
            templateUrl: 'partials/reset.html',
            controller: 'ResetCtrl',
            resolve: { skipIfAuthenticated: skipIfAuthenticated }
        })
        .when('/dashboard', {
            templateUrl: 'partials/dashboard.html',
            activetab: 'dashboard',
            resolve: { loginRequired: loginRequired }
        })
        .when('/roles', {
            templateUrl: 'partials/role.html',
            controller: 'RoleCtrl',
            activetab: 'roles',
            resolve: { loginRequired: loginRequired }
        })
        .when('/roles/add', {
            templateUrl: 'partials/roleAdd.html',
            controller: 'RoleCtrl',
            activetab: 'roles',
            resolve: { loginRequired: loginRequired }
        })
        .when('/roles/edit/:id', {
            templateUrl: 'partials/roleEdit.html',
            controller: 'RoleCtrl',
            activetab: 'roles',
            resolve: { loginRequired: loginRequired }
        })
        .when('/staff', {
            templateUrl: 'partials/staff.html',
            controller: 'StaffCtrl',
            activetab: 'staff',
            resolve: { loginRequired: loginRequired }
        })
        .when('/staff/add', {
            templateUrl: 'partials/staffAdd.html',
            controller: 'StaffCtrl',
            activetab: 'staff',
            resolve: { loginRequired: loginRequired }
        })
        .when('/staff/edit/:id', {
            templateUrl: 'partials/staffEdit.html',
            controller: 'StaffCtrl',
            activetab: 'staff',
            resolve: { loginRequired: loginRequired }
        })
        .when('/patients', {
            templateUrl: 'partials/patient.html',
            controller: 'PatientCtrl',
            activetab: 'patients',
            resolve: { loginRequired: loginRequired }
        })
        .when('/patients/add', {
            templateUrl: 'partials/patientAdd.html',
            controller: 'PatientCtrl',
            activetab: 'patients',
            resolve: { loginRequired: loginRequired }
        })
        .when('/patients/edit/:id', {
            templateUrl: 'partials/patientEdit.html',
            controller: 'PatientCtrl',
            activetab: 'patients',
            resolve: { loginRequired: loginRequired }
        })
        .when('/forms', {
            templateUrl: 'partials/form.html',
            controller: 'FormCtrl',
            activetab: 'forms',
            resolve: { loginRequired: loginRequired }
        })
        .when('/forms/add', {
            templateUrl: 'partials/formAdd.html',
            controller: 'FormCtrl',
            activetab: 'forms',
            resolve: { loginRequired: loginRequired }
        })
        .when('/forms/edit/:id', {
            templateUrl: 'partials/formEdit.html',
            controller: 'FormCtrl',
            activetab: 'forms',
            resolve: { loginRequired: loginRequired }
        })
        .when('/questions/:id', {
            templateUrl: 'partials/question.html',
            controller: 'QuestionCtrl',
            activetab: 'forms',
            resolve: { loginRequired: loginRequired }
        })
        .when('/speciality', {
            templateUrl: 'partials/speciality.html',
            controller: 'SpecialityCtrl',
            activetab: 'speciality',
            resolve: { loginRequired: loginRequired }
        })
        .when('/speciality/add', {
            templateUrl: 'partials/specialityAdd.html',
            controller: 'SpecialityCtrl',
            activetab: 'speciality',
            resolve: { loginRequired:loginRequired }
        })
        .when('/speciality/edit/:id', {
            templateUrl: 'partials/specialityEdit.html',
            controller: 'SpecialityCtrl',
            activetab: 'speciality',
            resolve: { loginRequired: loginRequired }
        })
        .when('/appointments', {
            templateUrl: 'partials/appointment.html',
            controller: 'AppointmentCtrl',
            activetab: 'appointments',
            resolve: { loginRequired: loginRequired }
        })
        .when('/appointments/:id', {
            templateUrl: 'partials/doctorAppointment.html',
            controller: 'AppointmentCtrl',
            activetab: 'appointments',
            resolve: { loginRequired: loginRequired }
        })
        .otherwise({
            templateUrl: 'partials/404.html'
        });

        $authProvider.loginUrl = '/login';
        $authProvider.signupUrl = '/signup';
        
        function skipIfAuthenticated($location, $auth) {
            if ($auth.isAuthenticated()) {
                $location.path('/');
            }
        }
        function loginRequired($location, $auth) {
            if (!$auth.isAuthenticated()) {
                $location.path('/');
            }
        }
    })
    .run(function($rootScope, $window) {
        if ($window.localStorage.user) {
            $rootScope.currentUser = JSON.parse($window.localStorage.user);
        }
    });
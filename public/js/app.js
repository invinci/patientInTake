angular.module('MyApp', ['ngRoute','satellizer','ng-sweet-alert','ngTable','checklist-model','ui.utils.masks','ui.bootstrap','toastr'])
    .config(function($routeProvider, $locationProvider, $authProvider) {
        $locationProvider.html5Mode(true);

        $routeProvider
        /*.when('/', {
            templateUrl: 'partials/home.html'
        })
        .when('/contact', {
            templateUrl: 'partials/contact.html',
            controller: 'ContactCtrl'
        })*/
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
        .when('/roles/view/:id', {
            templateUrl: 'partials/roleView.html',
            controller: 'RoleCtrl',
            activetab: 'roles',
            resolve: { loginRequired: loginRequired }
        })
        .when('/roles/delete/:id', {
            controller: 'RoleCtrl',
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
        .when('/staff/view/:id', {
            templateUrl: 'partials/staffView.html',
            controller: 'StaffCtrl',
            activetab: 'staff',
            resolve: { loginRequired: loginRequired }
        })
        .when('/staff/delete/:id', {
            controller: 'StaffCtrl',
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
        .when('/patients/view/:id', {
            templateUrl: 'partials/patientView.html',
            controller: 'PatientCtrl',
            activetab: 'patients',
            resolve: { loginRequired: loginRequired }
        })
        .when('/patients/delete/:id', {
            controller: 'PatientCtrl',
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
        .when('/forms/view/:id', {
            templateUrl: 'partials/formView.html',
            controller: 'FormCtrl',
            activetab: 'forms',
            resolve: { loginRequired: loginRequired }
        })
        .when('/forms/delete/:id', {
            controller: 'FormCtrl',
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
        .when('/speciality/view/:id', {
            templateUrl: 'partials/specialityView.html',
            controller: 'SpecialityCtrl',
            activetab: 'speciality',
            resolve: { loginRequired: loginRequired }
        })
        .when('/speciality/delete/:id', {
            controller: 'SpecialityCtrl',
            resolve: { loginRequired: loginRequired }
        })
        .otherwise({
            templateUrl: 'partials/404.html'
        });

        $authProvider.loginUrl = '/login';
        $authProvider.signupUrl = '/signup';
        
        /*$authProvider.facebook({
          url: '/auth/facebook',
          clientId: '980220002068787',
          redirectUri: 'http://localhost:3000/auth/facebook/callback'
        });
        $authProvider.google({
          url: '/auth/google',
          clientId: '631036554609-v5hm2amv4pvico3asfi97f54sc51ji4o.apps.googleusercontent.com'
        });*/

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
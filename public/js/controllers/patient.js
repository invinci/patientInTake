angular.module('MyApp')
    .controller('PatientCtrl', function($scope, $rootScope, $routeParams, $location, toastr, NgTableParams, Patient) {

        // Patient List
        $scope.patientList = function() {
            if ($scope.sortType == '') {
                $scope.sortType = 'created';
                $scope.sortOrder = -1;
            }
            var search = status = dob = '';
            if ($scope.search) {
                search = $scope.search;
            }
            if ($scope.status) {
                status = $scope.status;
            }
            if ($scope.dob) {
                dob = $scope.dob;
            }
            $scope.tableParams = new NgTableParams({
                count: ($scope.count) ? $scope.count : 10,
                page: ($scope.pageNum) ? $scope.pageNum : 1
            }, 
            {
                getData: function(params) {
                    var data = {};
                    data.search = search;
                    data.status = status;
                    data.dob = dob;
                    data.page = params.page();
                    data.count = params.count();
                    data.field = $scope.sortType;
                    data.sortOrder = $scope.sortOrder;
                    return Patient.patient(data).then(function(successData) {
                        params.total(successData.data.total);
                        $scope.patient = successData.data.patient;
                        return $scope.patient;
                    }, function(error) {
                        console.log('error', error);
                    });
                }
            });
        };
        $scope.sortOrderby = function(sortstring, sort) {
            $scope.sortType = sortstring;
            $scope.sortOrder= sort;
            if($scope.sortOrder == false){
                $scope.sortOrder = 1;
            }else{
                $scope.sortOrder = -1;
            }
            $scope.patientList()
        }
        
        // Patient Add
        $scope.patientAdd = function(isValid) {
            if(isValid){
                Patient.patientAdd($scope.patient)
                .then(function(response) {
                    toastr.success(response.data.msg,'Success');
                    $location.path('/patients');
                })
                .catch(function(response) {
                    if(response.data.constructor === Array){
                        for(var j=0; j<response.data.length; j++){
                            toastr.error(response.data[j].msg,'Error');
                        }
                    }else{
                        toastr.error(response.data.msg,'Error');
                    }
                });
            }
        };

        // Patient by Id
        $scope.patientById = function() {
            Patient.patientById($routeParams.id)
            .then(function(response) {
                $scope.patient = response.data.patient;
            })
            .catch(function(response) {
                toastr.error(response.data.msg,'Error');
            });
        };

        // Patient Edit
        $scope.patientEdit = function(isValid) {
            if(isValid){
                Patient.patientEdit($scope.patient)
                .then(function(response) {
                    toastr.success(response.data.msg,'Success');
                    $location.path('/patients');
                })
                .catch(function(response) {
                    if(response.data.constructor === Array){
                        for(var j=0; j<response.data.length; j++){
                            toastr.error(response.data[j].msg,'Error');
                        }
                    }else{
                        toastr.error(response.data.msg,'Error');
                    }
                });
            }
        };

        // Patient Delete
        $scope.sweet = {};
        $scope.sweet.option = {
            title: "Are you sure?",
            text: "You want to delete this patient?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
            cancelButtonText: "No",
            closeOnConfirm: true,
            closeOnCancel: true
        }
        $scope.patientDelete = function(id) {
            Patient.patientDelete(id)
            .then(function(response) {
                toastr.success(response.data.msg,'Success');
                $scope.patientList();
            })
            .catch(function(response) {
                toastr.error(response.data.msg,'Error');
            });
        };

        // Cancel button
        $scope.goBack = function() {
            $location.path('/patients');
        };

        // Check / uncheck all checkboxes in listing page
        $scope.checkAll = {};
        $scope.selectedPatient = {
            patient: []
        };
        $scope.checkAll.val = false;
        $scope.selectAllGroup = function(check) {
            $scope.flag = {};
            $scope.flag.enable = false;
            if (check) {
                $scope.selectedPatient.patient = $scope.patient.map(function(patient) {
                    return patient._id;
                });
                $scope.selectenable = true;
            } else {
                $scope.selectedPatient.patient = [];
                $scope.checkAll.val= false;
                $scope.selectenable = false;
            }
        }

        // Patient Status
        $scope.performAction = function() {
            $scope.selectedAction = selectedAction.value;
            if ($scope.selectedAction == "") {
                toastr.error('Please select some selection','Error');
            }
            if ($scope.selectedPatient.patient.length == 0) {
                toastr.error('Please select atleast one checkbox','Error');
            }
            
            if ($scope.selectedAction == "active" && $scope.selectedPatient.patient.length > 0) {
                $scope.enbl = true;
            }else if ($scope.selectedAction == "active" && $scope.selectedPatient.patient.length > 0) {
                $scope.enbl = false;
            }
            
            if( $scope.selectedPatient.patient.length > 0){
                var data = {};
                data.enabled = $scope.enbl;
                data.allChecked = $scope.selectenable;
                data.patient = $scope.selectedPatient.patient;
                Patient.patientStatus(data).then(function(response) {
                    $scope.patient = response.data.patient;
                    angular.element('#selectedAction').val("");
                    $scope.patientList();
                    $scope.selectedPatient.patient = [];
                    $scope.checkAll.val = false;
                    toastr.success(response.data.msg,'Success');
                });
            }
        }


        // Datepicker
        $scope.dateOptions = {
            dateDisabled: disabled,
            formatYear: 'yy',
            maxDate: new Date(),
            minDate: new Date(1950, 1, 01),
            startingDay: 1
        };
        function disabled(data) {
            var date = data.date, mode = data.mode;
            return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
        }
        $scope.open2 = function() {
            $scope.popup2.opened = true;
        };
        $scope.popup2 = {
            opened: false
        };
    });
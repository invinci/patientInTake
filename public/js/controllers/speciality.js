angular.module('MyApp')
    .controller('SpecialityCtrl', function($scope, $rootScope, $routeParams, $location, toastr, NgTableParams, Speciality) {

        /*
         * Speciality List
         */
        $scope.specialityList = function() {
            if ($scope.sortType == '') {
                $scope.sortType = 'created';
                $scope.sortOrder = -1;
            }
            var search = status = '';
            if ($scope.search) {
                search = $scope.search;
            }
            if ($scope.status) {
                status = $scope.status;
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
                    data.page = params.page();
                    data.count = params.count();
                    data.field = $scope.sortType;
                    data.sortOrder = $scope.sortOrder;
                    return Speciality.speciality(data).then(function(successData) {
                        params.total(successData.data.total);
                        $scope.speciality = successData.data.speciality;
                        return $scope.speciality;
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
            $scope.specialityList()
        }
        
        /*
         * Speciality Add
         */
        $scope.speciality = {form_id: []};
        $scope.specialityAdd = function(isValid) {
            if(isValid){
                Speciality.specialityAdd($scope.speciality)
                .then(function(response) {
                    toastr.success(response.data.msg,'Success');
                    $location.path('/speciality');
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

        /*
         * Speciality by Id
         */
        $scope.specialityById = function() {
            Speciality.specialityById($routeParams.id)
            .then(function(response) {
                $scope.speciality = response.data.speciality;
            })
            .catch(function(response) {
                toastr.error(response.data.msg,'Error');
            });
        };

        /*
         * Speciality Edit
         */
        $scope.speciality = {form_id: []};
        $scope.specialityEdit = function(isValid) {
            if(isValid){
                Speciality.specialityEdit($scope.speciality)
                .then(function(response) {
                    toastr.success(response.data.msg,'Success');
                    $location.path('/speciality');
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

        /*
         * Speciality Delete
         */
        $scope.sweet = {};
        $scope.sweet.option = {
            title: "Are you sure?",
            text: "You want to delete this specality?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
            cancelButtonText: "No",
            closeOnConfirm: true,
            closeOnCancel: true
        }
        $scope.specialityDelete = function(id) {
            Speciality.specialityDelete(id)
            .then(function(response) {
                toastr.success(response.data.msg,'Success');
                $scope.specialityList();
            })
            .catch(function(response) {
                toastr.error(response.data.msg,'Error');
            });
        };

        /*
         * Cancel button
         */
        $scope.goBack = function() {
            $location.path('/speciality');
        };

        /*
         * Check / uncheck all checkboxes in listing page
         */
        $scope.checkAll = {};
        $scope.selectedSpeciality = {
            speciality: []
        };
        $scope.checkAll.val = false;
        $scope.selectAllGroup = function(check) {
            $scope.flag = {};
            $scope.flag.enable = false;
            if (check) {
                $scope.selectedSpeciality.speciality = $scope.speciality.map(function(speciality) {
                    return speciality._id;
                });
                $scope.selectenable = true;
            } else {
                $scope.selectedSpeciality.speciality = [];
                $scope.checkAll.val= false;
                $scope.selectenable = false;
            }
        }

        /*
         * Speciality Status
         */
        $scope.performAction = function() {
            $scope.selectedAction = selectedAction.value;
            if ($scope.selectedAction == "") {
                toastr.error('Please select some selection','Error');
            }
            if ($scope.selectedSpeciality.speciality.length == 0) {
                toastr.error('Please select atleast one checkbox','Error');
            }
            
            if ($scope.selectedAction == "active" && $scope.selectedSpeciality.speciality.length > 0) {
                $scope.enbl = true;
            }else if ($scope.selectedAction == "deactive" && $scope.selectedSpeciality.speciality.length > 0) {
                $scope.enbl = false;
            }
            
            if( $scope.selectedSpeciality.speciality.length > 0){
                var data = {};
                data.enabled = $scope.enbl;
                data.allChecked = $scope.selectenable;
                data.speciality = $scope.selectedSpeciality.speciality;
                Speciality.specialityStatus(data).then(function(response) {
                    $scope.speciality = response.data.speciality;
                    angular.element('#selectedAction').val("");
                    $scope.specialityList();
                    $scope.selectedSpeciality.speciality = [];
                    $scope.checkAll.val = false;
                    toastr.success(response.data.msg,'Success');
                });
            }
        }

        /*
         * Listing of Forms
         */
        $scope.getForms = function() {
            Speciality.getForms()
            .then(function(response) {
                $scope.form = response.data.form;
            })
            .catch(function(response) {
                $scope.messages = {
                    error: Array.isArray(response.data) ? response.data : [response.data]
                };
            });
        };
        $scope.getForms();

    });
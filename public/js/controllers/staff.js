angular.module('MyApp')
    .controller('StaffCtrl', function($scope, $rootScope, $routeParams, $location, toastr, NgTableParams, Staff) {

        // Staff List
        $scope.staffList = function() {
            if ($scope.sortType == '') {
                $scope.sortType = 'created';
                $scope.sortOrder = -1;
            }
            var search = status = role_id = '';
            if ($scope.search) {
                search = $scope.search;
            }
            if ($scope.status) {
                status = $scope.status;
            }
            if ($scope.role_id) {
                role_id = $scope.role_id;
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
                    data.role_id = role_id;
                    data.page = params.page();
                    data.count = params.count();
                    data.field = $scope.sortType;
                    data.sortOrder = $scope.sortOrder;
                    return Staff.staff(data).then(function(successData) {
                        params.total(successData.data.total);
                        $scope.staff = successData.data.staff;
                        return $scope.staff;
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
            $scope.staffList()
        }
        
        // Staff Add
        $scope.staffAdd = function(isValid) {
            if(isValid){
                Staff.staffAdd($scope.staff)
                .then(function(response) {
                    toastr.success(response.data.msg,'Success');
                    $location.path('/staff');
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

        // Staff by Id
        $scope.staffById = function() {
            Staff.staffById($routeParams.id)
            .then(function(response) {
                $scope.staff = response.data.staff;
                $scope.staff.role_id = response.data.staff.role_id._id;
                $scope.staff.speciality_id = response.data.staff.speciality_id._id;
                changeRole($scope.staff.role_id);
            })
            .catch(function(response) {
                toastr.error(response.data.msg,'Error');
            });
        };

        // Staff Edit
        $scope.staffEdit = function(isValid) {
            if(isValid){
                Staff.staffEdit($scope.staff)
                .then(function(response) {
                    toastr.success(response.data.msg,'Success');
                    $location.path('/staff');
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

        // Staff Delete
        $scope.sweet = {};
        $scope.sweet.option = {
            title: "Are you sure?",
            text: "You want to delete this staff?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
            cancelButtonText: "No",
            closeOnConfirm: true,
            closeOnCancel: true
        }
        $scope.staffDelete = function(id) {
            Staff.staffDelete(id)
            .then(function(response) {
                toastr.success(response.data.msg,'Success');
                $scope.staffList();
            })
            .catch(function(response) {
                toastr.error(response.data.msg,'Error');
            });
        };

        // Cancel button
        $scope.goBack = function() {
            $location.path('/staff');
        };

        // Check / uncheck all checkboxes in listing page
        $scope.checkAll = {};
        $scope.selectedStaff = {
            staff: []
        };
        $scope.checkAll.val = false;
        $scope.selectAllGroup = function(check) {
            $scope.flag = {};
            $scope.flag.enable = false;
            if (check) {
                $scope.selectedStaff.staff = $scope.staff.map(function(staff) {
                    return staff._id;
                });
                $scope.selectenable = true;
            } else {
                $scope.selectedStaff.staff = [];
                $scope.checkAll.val= false;
                $scope.selectenable = false;
            }
        }

        // Staff Status
        $scope.performAction = function() {
            $scope.selectedAction = selectedAction.value;
            if ($scope.selectedAction == "") {
                toastr.error('Please select some selection','Error');
            }
            if ($scope.selectedStaff.staff.length == 0) {
                toastr.error('Please select atleast one checkbox','Error');
            }
            
            if ($scope.selectedAction == "active" && $scope.selectedStaff.staff.length > 0) {
                $scope.enbl = true;
            }else if ($scope.selectedAction == "deactive" && $scope.selectedStaff.staff.length > 0) {
                $scope.enbl = false;
            }

            if( $scope.selectedStaff.staff.length > 0){
                var data = {};
                data.enabled = $scope.enbl;
                data.allChecked = $scope.selectenable;
                data.staff = $scope.selectedStaff.staff;
                Staff.staffStatus(data).then(function(response) {
                    $scope.staff = response.data.staff;
                    angular.element('#selectedAction').val("");
                    $scope.staffList();
                    $scope.selectedStaff.staff = [];
                    $scope.checkAll.val = false;
                    toastr.success(response.data.msg,'Success');
                });
            }
        }

        // Listing of Roles
        $scope.getRoles = function() {
            Staff.getRoles()
            .then(function(response) {
                $rootScope.role = response.data.role;
            })
            .catch(function(response) {
                $scope.messages = {
                    error: Array.isArray(response.data) ? response.data : [response.data]
                };
            });
        };
        $scope.getRoles();

        // Show / Hide section based on the select role
        $scope.changeRole = function() {
            var $roleId = $scope.staff.role_id;
            var $roleVal = $scope.role.filter(function (role) {
                return role._id == $roleId;
            })[0].name;
            $rootScope.selectedRole = $roleVal;
        }
        function changeRole(data){
            var $roleId = data;
            var $roleVal = $scope.role.filter(function (role) {
                return role._id == $roleId;
            })[0].name;
            $rootScope.selectedRole = $roleVal;
        }

        // Listing of Speciality
        $scope.getSpeciality = function() {
            Staff.getSpeciality()
            .then(function(response) {
                $rootScope.speciality = response.data.speciality;
            })
            .catch(function(response) {
                $scope.messages = {
                    error: Array.isArray(response.data) ? response.data : [response.data]
                };
            });
        };
        $scope.getSpeciality();

    });
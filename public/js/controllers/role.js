angular.module('MyApp')
    .controller('RoleCtrl', function($scope, $rootScope, $routeParams, $location, toastr, NgTableParams, Role) {

        // Role List
        $scope.roleList = function() {
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
                    return Role.role(data).then(function(successData) {
                        //console.log(successData);
                        // console.log('total', successData.data.total)
                        params.total(successData.data.total);
                        //params.count([10,25,50,100]);
                        // console.log('<<<<<<<<>>>>>>>>>', params.total(successData.data.total));
                        //console.log('data',successData.data.data);
                        $scope.role = successData.data.role;
                        // console.log('$scope.customers', $scope.customers);
                        return $scope.role;
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
            $scope.roleList()
        }
        
        // Role Add
        $scope.roleAdd = function(isValid) {
            if(isValid){
                Role.roleAdd($scope.role)
                .then(function(response) {
                    // $rootScope.messages = {
                    //     success: [response.data]
                    // };

                    toastr.success(response.data.msg,'Success');
                    $location.path('/roles');
                })
                .catch(function(response) {
                    // $scope.messages = {
                    //     error: Array.isArray(response.data) ? response.data : [response.data]
                    // };
                    
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

        // Role by Id
        $scope.roleById = function() {
            Role.roleById($routeParams.id)
            .then(function(response) {
                $scope.role = response.data.role;
            })
            .catch(function(response) {
                toastr.error(response.data.msg,'Error');
                // $scope.messages = {
                //     error: Array.isArray(response.data) ? response.data : [response.data]
                // };
            });
        };

        // Role Edit
        $scope.roleEdit = function(isValid) {
            if(isValid){
                Role.roleEdit($scope.role)
                .then(function(response) {
                    // $rootScope.messages = {
                    //     success: [response.data]
                    // };

                    toastr.success(response.data.msg,'Success');
                    $location.path('/roles');
                })
                .catch(function(response) {
                    if(response.data.constructor === Array){
                        for(var j=0; j<response.data.length; j++){
                            toastr.error(response.data[j].msg,'Error');
                        }
                    }else{
                        toastr.error(response.data.msg,'Error');
                    }
                    // $scope.messages = {
                    //     error: Array.isArray(response.data) ? response.data : [response.data]
                    // };
                });
            }
        };

        // Role Delete
        $scope.sweet = {};
        $scope.sweet.option = {
            title: "Are you sure?",
            text: "You want to delete this role?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
            cancelButtonText: "No",
            closeOnConfirm: true,
            closeOnCancel: true
        }
        /*$scope.sweet.confirm = {
            title: 'Deleted!',
            text: 'Role has been deleted successfully.',
            type: 'success'
        };
        $scope.sweet.cancel = {
            title: 'Cancelled!',
            type: 'error'
        }*/
        $scope.roleDelete = function(id) {
            Role.roleDelete(id)
            .then(function(response) {

                // $scope.messages = {
                //     success: [response.data]
                // };

                toastr.success(response.data.msg,'Success');
                $scope.roleList();
            })
            .catch(function(response) {
                toastr.error(response.data.msg,'Error');
                // $scope.messages = {
                //     error: Array.isArray(response.data) ? response.data : [response.data]
                // };
            });
        };

        // Cancel button
        $scope.goBack = function() {
            $location.path('/roles');
        };

        // Check / uncheck all checkboxes in listing page
        $scope.checkAll = {};
        $scope.selectedRole = {
            role: []
        };
        $scope.checkAll.val = false;
        $scope.selectAllGroup = function(check) {
            $scope.flag = {};
            $scope.flag.enable = false;
            if (check) {
                $scope.selectedRole.role = $scope.role.map(function(role) {
                    return role._id;
                });
                $scope.selectenable = true;
            } else {
                $scope.selectedRole.role = [];
                $scope.checkAll.val= false;
                $scope.selectenable = false;
            }
        }

        // Role Status
        $scope.performAction = function() {
            $scope.selectedAction = selectedAction.value;
            if ($scope.selectedAction == "") {
                //$scope.messages = {'error':[{'msg':'Please select some selection'}]};
                toastr.error('Please select some selection','Error');
            }
            if ($scope.selectedRole.role.length == 0) {
                //$scope.messages = {'error':[{'msg':'Please select atleast one checkbox'}]};
                toastr.error('Please select atleast one checkbox','Error');
            }
            
            if ($scope.selectedAction == "active" && $scope.selectedRole.role.length > 0) {
                $scope.enbl = true;
            }else if ($scope.selectedAction == "deactive" && $scope.selectedRole.role.length > 0) {
                $scope.enbl = false;
            }
            
            if( $scope.selectedRole.role.length > 0){
                var data = {};
                data.enabled = $scope.enbl;
                data.allChecked = $scope.selectenable;
                data.role = $scope.selectedRole.role;
                Role.roleStatus(data).then(function(response) {
                    $scope.role = response.data.role;
                    angular.element('#selectedAction').val("");
                    $scope.roleList();
                    $scope.selectedRole.role = [];
                    $scope.checkAll.val = false;
                    toastr.success(response.data.msg,'Success');
                });
            }
        }

    });
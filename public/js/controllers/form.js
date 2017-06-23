angular.module('MyApp')
    .controller('FormCtrl', function($scope, $rootScope, $routeParams, $location, toastr, NgTableParams, Form) {

        /*
         * Form List
         */
        $scope.formList = function() {
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
                    return Form.form(data).then(function(successData) {
                        params.total(successData.data.total);
                        $scope.form = successData.data.form;
                        return $scope.form;
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
            $scope.formList()
        }
        
        /*
         * Form Add
         */
        $scope.formAdd = function(isValid) {
            if(isValid){
                Form.formAdd($scope.form)
                .then(function(response) {
                    toastr.success(response.data.msg,'Success');
                    $location.path('/forms');
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
         * Form by Id
         */
        $scope.formById = function() {
            Form.formById($routeParams.id)
            .then(function(response) {
                $scope.form = response.data.form;
            })
            .catch(function(response) {
                toastr.error(response.data.msg,'Error');
            });
        };

        /*
         * Form Edit
         */
        $scope.formEdit = function(isValid) {
            if(isValid){
                Form.formEdit($scope.form)
                .then(function(response) {
                    toastr.success(response.data.msg,'Success');
                    $location.path('/forms');
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
         * Form Delete
         */
        $scope.sweet = {};
        $scope.sweet.option = {
            title: "Are you sure?",
            text: "You want to delete this form?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
            cancelButtonText: "No",
            closeOnConfirm: true,
            closeOnCancel: true
        }
        $scope.formDelete = function(id) {
            Form.formDelete(id)
            .then(function(response) {
                toastr.success(response.data.msg,'Success');
                $scope.formList();
            })
            .catch(function(response) {
                toastr.error(response.data.msg,'Error');
            });
        };

        /*
         * Cancel button
         */
        $scope.goBack = function() {
            $location.path('/forms');
        };

        /*
         * Check / uncheck all checkboxes in listing page
         */
        $scope.checkAll = {};
        $scope.selectedForm = {
            form: []
        };
        $scope.checkAll.val = false;
        $scope.selectAllGroup = function(check) {
            $scope.flag = {};
            $scope.flag.enable = false;
            if (check) {
                $scope.selectedForm.form = $scope.form.map(function(form) {
                    return form._id;
                });
                $scope.selectenable = true;
            } else {
                $scope.selectedForm.form = [];
                $scope.checkAll.val= false;
                $scope.selectenable = false;
            }
        }

        /*
         * Form Status
         */
        $scope.performAction = function() {
            $scope.selectedAction = selectedAction.value;
            if ($scope.selectedAction == "") {
                toastr.error('Please select some selection','Error');
            }
            if ($scope.selectedForm.form.length == 0) {
                toastr.error('Please select atleast one checkbox','Error');
            }
            
            if ($scope.selectedAction == "active" && $scope.selectedForm.form.length > 0) {
                $scope.enbl = true;
            }else if ($scope.selectedAction == "deactive" && $scope.selectedForm.form.length > 0) {
                $scope.enbl = false;
            }
            
            if( $scope.selectedForm.form.length > 0){
                var data = {};
                data.enabled = $scope.enbl;
                data.allChecked = $scope.selectenable;
                data.form = $scope.selectedForm.form;
                Form.formStatus(data).then(function(response) {
                    $scope.form = response.data.form;
                    angular.element('#selectedAction').val("");
                    $scope.formList();
                    $scope.selectedForm.form = [];
                    $scope.checkAll.val = false;
                    toastr.success(response.data.msg,'Success');
                });
            }
        }
    });
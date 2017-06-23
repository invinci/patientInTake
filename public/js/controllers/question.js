angular.module('MyApp')
    .controller('QuestionCtrl', function($window, $scope, $uibModal, $rootScope, $routeParams, $location, toastr, NgTableParams, Question) {

        /*
         * Array for answers section
         */
        $scope.choices = [{id:'choice1'}];

        /*
         * Insert answer section
         */
        $scope.addNewChoice = function() {
            var newItemNo = $scope.choices.length + 1;
            $scope.choices.push({'id':'choice' + newItemNo});
        };

        /*
         * Remove answer section
         */
        $scope.removeChoice = function() {
            var lastItem = $scope.choices.length - 1;
            if (angular.isDefined($scope.question.answer)) {
                for(var x=0; x<$scope.choices.length; x++){
                    if(x == lastItem){

                        // Remove the last element values
                        delete $scope.question.answer[x].answer_label;
                        delete $scope.question.answer[x].answer_value;
                    }
                }
            }
            $scope.choices.splice(lastItem);
        };

        /*
         * Show / Hide answers section based on the selected question type
         */
        $scope.isTypeActive = false; 
        $scope.type = [{id:1,name:'Radio'},{id:2,name:'Checkbox'},{id:3,name:'Text'}]
        $scope.changeType = function() {
            var $questionTypeId = $scope.question.question_type;
            changeType($questionTypeId);
        }
        function changeType(data){
            var $questionTypeId = data;

            if($questionTypeId > 0){
                $scope.isTypeActive = true;
            }else{
                $scope.isTypeActive = false;
            }
        }
        
        /*
         * Show / Hide dependency answer section based on the selected dependency
         */
        $scope.isDependentAnswer = false;
        $scope.changeDependency = function() {
            var $dependencyQuestionId = $scope.question.dependencyQuestion;
            changeDependency($dependencyQuestionId);
        }
        function changeDependency(data){
            var $dependencyQuestionId = data;

            if($dependencyQuestionId != ""){

                // Listing of Dependent answers
                Question.getDependentAnswers($dependencyQuestionId)
                .then(function(response) {
                    $scope.answers = response.data.answers[0].answers;
                })
                .catch(function(response) {
                    $scope.messages = {
                        error: Array.isArray(response.data) ? response.data : [response.data]
                    };
                });
                $scope.isDependentAnswer = true;
            }else{
                $scope.isDependentAnswer = false;
            }
        }

        /*
         * Listing of Dependent questions
         */
        $scope.getDependentQuestions = function() {
            Question.getDependentQuestions($routeParams.id)
            .then(function(response) {
                $scope.questions = response.data.questions;
            })
            .catch(function(response) {
                $scope.messages = {
                    error: Array.isArray(response.data) ? response.data : [response.data]
                };
            });
        };
        $scope.getDependentQuestions();

        /*
         * Question List
         */
        $scope.questionList = function() {
            if ($scope.sortType == '') {
                $scope.sortType = 'created';
                $scope.sortOrder = -1;
            }
            var search = '';
            if ($scope.search) {
                search = $scope.search;
            }
            $scope.tableParams = new NgTableParams({
                count: ($scope.count) ? $scope.count : 10,
                page: ($scope.pageNum) ? $scope.pageNum : 1
            }, 
            {
                getData: function(params) {
                    var data = {};
                    data.search = search;
                    data.form_id = $routeParams.id;
                    data.page = params.page();
                    data.count = params.count();
                    data.field = $scope.sortType;
                    data.sortOrder = $scope.sortOrder;
                    return Question.question(data).then(function(successData) {
                        params.total(successData.data.total);
                        $scope.question = successData.data.question;
                        return $scope.question;
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
            $scope.questionList()
        }

        /*
         * Modal Open for Add case
         */
        $scope.open = function () {
            $rootScope.modalInstance = $uibModal.open({
                templateUrl: '../partials/modalQuestionAdd.html', // loads the template
                backdrop: true, // setting backdrop allows us to close the modal window on clicking outside the modal window
                windowClass: 'modal', // windowClass - additional CSS class(es) to be added to a modal window template
                controller: 'QuestionCtrl',
                size: 'lg'
            });
        };

        /*
         * Modal Open for Edit case
         */
        $scope.edit = function (questionId) {
            $rootScope.modalInstance = $uibModal.open({
                templateUrl: '../partials/modalQuestionEdit.html', // loads the template
                backdrop: true, // setting backdrop allows us to close the modal window on clicking outside the modal window
                windowClass: 'modal', // windowClass - additional CSS class(es) to be added to a modal window template
                controller: 'QuestionCtrl',
                size: 'lg',
                scope: $scope,
                resolve: {
                    questionId: function () {
                        $scope.questionId = questionId;
                    }
                }
            });
        };

        /*
         * Modal Close
         */
        $scope.cancel = function () {
            $rootScope.modalInstance.close();
        };

        /*
         * Question Add
         */
        $scope.questionAdd = function(isValid) {
            if(isValid){
                $scope.question.form_id = $routeParams.id;

                if (angular.isDefined($scope.question.dependencyQuestion) && angular.isDefined($scope.question.dependencyAnswer)) {
                    if($scope.question.dependencyQuestion !== '' && $scope.question.dependencyAnswer !== ''){
                        $scope.question.dependency = {
                            'dependencyQuestion':$scope.question.dependencyQuestion,
                            'dependencyAnswer':$scope.question.dependencyAnswer
                        };
                    }else{
                        $scope.question.dependency = [];
                    }
                }

                var arr = [];
                for(var key in $scope.question.answer){
                    for(var index in $scope.choices){
                        if(key == index){
                            arr.push($scope.question.answer[key]);
                        }
                    }
                }
                $scope.question.answers = arr;
                
                Question.questionAdd($scope.question)
                .then(function(response) {
                    toastr.success(response.data.msg,'Success');
                    $window.location.reload();
                    $rootScope.modalInstance.close();
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
         * Question by Id
         */
        $scope.questionById = function(questionId) {
            Question.questionById(questionId)
            .then(function(response) {
                $scope.question = response.data.question;
                $scope.question.answer = $scope.question.answers;
                for(var x=2; x <= $scope.question.answers.length; x++){
                    $scope.choices.push({id:'choice'+x});
                }

                changeType($scope.question.question_type);

                if($scope.question.dependency != ''){
                    $scope.question.dependencyQuestion = $scope.question.dependency[0].dependencyQuestion;
                    $scope.question.dependencyAnswer = $scope.question.dependency[0].dependencyAnswer;
                    changeDependency($scope.question.dependencyQuestion);
                }
            })
            .catch(function(response) {
                toastr.error(response.data.msg,'Error');
            });
        };

        /*
         * Question Edit
         */
        $scope.questionEdit = function(isValid) {
            if(isValid){
                $scope.question.form_id = $routeParams.id;
                
                if (angular.isDefined($scope.question.dependencyQuestion) && angular.isDefined($scope.question.dependencyAnswer)) {
                    if($scope.question.dependencyQuestion !== '' && $scope.question.dependencyAnswer !== ''){
                        $scope.question.dependency = {
                            'dependencyQuestion':$scope.question.dependencyQuestion,
                            'dependencyAnswer':$scope.question.dependencyAnswer
                        };
                    }else{
                        $scope.question.dependency = [];
                    }
                }

                var arr = [];
                for(var key in $scope.question.answer){
                    for(var index in $scope.choices){
                        if(key == index){
                            arr.push($scope.question.answer[key]);
                        }
                    }
                }
                $scope.question.answers = arr;

                Question.questionEdit($scope.question)
                .then(function(response) {
                    toastr.success(response.data.msg,'Success');
                    $window.location.reload();
                    $rootScope.modalInstance.close();
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
         * Question Delete
         */
        $scope.sweet = {};
        $scope.sweet.option = {
            title: "Are you sure?",
            text: "You want to delete this question?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
            cancelButtonText: "No",
            closeOnConfirm: true,
            closeOnCancel: true
        }
        $scope.questionDelete = function(id) {
            Question.questionDelete(id)
            .then(function(response) {
                toastr.success(response.data.msg,'Success');
                $scope.questionList();
            })
            .catch(function(response) {
                toastr.error(response.data.msg,'Error');
            });
        };

        /*
         * For form name on listing page heading
         */
        $scope.getFormById = function() {
            Question.getFormById($routeParams.id)
            .then(function(response) {
                $scope.form = response.data.form;
            })
            .catch(function(response) {
                toastr.error(response.data.msg,'Error');
            });
        };
        $scope.getFormById();
    });
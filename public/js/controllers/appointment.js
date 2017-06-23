angular.module('MyApp')
    .controller('AppointmentCtrl', function($scope, $filter, $uibModal, $rootScope, $routeParams, $location, NgTableParams, toastr, Appointment) {

        /*
         * Calendar
         */
        var date = new Date();
        var d = date.getDate();
        var m = date.getMonth();
        var y = date.getFullYear();

        /* event source that pulls from google.com */
        $scope.eventSource = {
            url: "http://www.google.com/calendar/feeds/usa__en%40holiday.calendar.google.com/public/basic",
            className: 'gcal-event',           // an option!
            currentTimezone: 'America/Chicago' // an option!
        };

        /* event source that contains custom events on the scope */
        $scope.events = [
            {title: 'All Day Event',start: new Date(y, m, 1)},
            {title: 'Long Event',start: new Date(y, m, d - 5),end: new Date(y, m, d - 2)},
            {id: 999,title: 'Repeating Event',start: new Date(y, m, d - 3, 16, 0),allDay: false},
            {id: 999,title: 'Repeating Event',start: new Date(y, m, d + 4, 16, 0),allDay: false},
            {title: 'Birthday Party',start: new Date(y, m, d + 1, 19, 0),end: new Date(y, m, d + 1, 22, 30),allDay: false},
            {title: 'Click for Google',start: new Date(y, m, 28),end: new Date(y, m, 29),url: 'http://google.com/'}
        ];
        
        /* event source that calls a function on every view switch */
        $scope.eventsF = function (start, end, timezone, callback) {
            var s = new Date(start).getTime() / 1000;
            var e = new Date(end).getTime() / 1000;
            var m = new Date(start).getMonth();
            var events = [{title: 'Feed Me ' + m,start: s + (50000),end: s + (100000),allDay: false, className: ['customFeed']}];
            callback(events);
        };

        $scope.calEventsExt = {
            color: '#f00',
            textColor: 'yellow',
            events: [ 
                {type:'party',title: 'Lunch',start: new Date(y, m, d, 12, 0),end: new Date(y, m, d, 14, 0),allDay: false},
                {type:'party',title: 'Lunch 2',start: new Date(y, m, d, 12, 0),end: new Date(y, m, d, 14, 0),allDay: false},
                {type:'party',title: 'Click for Google',start: new Date(y, m, 28),end: new Date(y, m, 29),url: 'http://google.com/'}
            ]
        };
        
        /* alert on eventClick */
        $scope.alertOnEventClick = function( date, jsEvent, view){
            $scope.alertMessage = (date.title + ' was clicked ');
            console.log('here');
        };

        /* alert on Drop */
        $scope.alertOnDrop = function(event, delta, revertFunc, jsEvent, ui, view){
            $scope.alertMessage = ('Event Dropped to make dayDelta ' + delta);
        };

        /* alert on Resize */
        $scope.alertOnResize = function(event, delta, revertFunc, jsEvent, ui, view ){
            $scope.alertMessage = ('Event Resized to make dayDelta ' + delta);
        };

        /* add and removes an event source of choice */
        $scope.addRemoveEventSource = function(sources,source) {
            var canAdd = 0;
            angular.forEach(sources,function(value, key){
                if(sources[key] === source){
                    sources.splice(key,1);
                    canAdd = 1;
                }
            });
            if(canAdd === 0){
                sources.push(source);
            }
        };

        /* Add custom event on calendar */
        $scope.addEvent = function(title, start, end) {
            $scope.events.push({
                title: title,
                start: start,
                end: end,
                className: ['openSesame']
            });
        };

        /* Remove event */
        $scope.remove = function(index) {
            $scope.events.splice(index,1);
        };

        /* Change View */
        $scope.changeView = function(view,calendar) {
            uiCalendarConfig.calendars[calendar].fullCalendar('changeView',view);
        };

        /* Change View */
        $scope.renderCalender = function(calendar) {
            if(uiCalendarConfig.calendars[calendar]){
                uiCalendarConfig.calendars[calendar].fullCalendar('render');
            }
        };

         /* Render Tooltip */
        $scope.eventRender = function( event, element, view ) { 
            element.attr({'tooltip': event.title, 'tooltip-append-to-body': true});
            $compile(element)($scope);
        };

    /* config object */
    // $scope.uiConfig = {
    //   calendar:{
    //     height: 450,
    //     editable: true,
    //     header:{
    //       left: 'title',
    //       center: '',
    //       right: 'today prev,next'
    //     },
    //     eventClick: $scope.alertOnEventClick,
    //     eventDrop: $scope.alertOnDrop,
    //     eventResize: $scope.alertOnResize,
    //     eventRender: $scope.eventRender
    //   }
    // };

        $scope.uiConfig = {
            calendar:{
                height: 700,
                editable: true,
                header:{
                    //left: 'title',
                    left: 'month agendaWeek agendaDay',
                    //center: '',
                    center: 'title',
                    right: 'today prev,next'
                },
                eventClick: $scope.alertOnEventClick
                // eventDrop: $scope.alertOnDrop,
                // eventResize: $scope.alertOnResize,
                // eventClick: $scope.eventClick,
                // viewRender: $scope.renderView
            }
        };

        $scope.eventSources = [$scope.events, $scope.eventSource, $scope.eventsF];

        /*
         * Appointment List
         */
        $scope.appointmentList = function() {
            if ($scope.sortType == '') {
                $scope.sortType = 'created';
                $scope.sortOrder = -1;
            }
            var doctor_id = speciality_id = '';
            if ($scope.doctor_id) {
                doctor_id = $scope.doctor_id;
            }
            if ($scope.speciality_id) {
                speciality_id = $scope.speciality_id;
            }
            $scope.tableParams = new NgTableParams({
                count: ($scope.count) ? $scope.count : 10,
                page: ($scope.pageNum) ? $scope.pageNum : 1
            }, 
            {
                getData: function(params) {
                    var data = {};
                    data.doctor_id = doctor_id;
                    data.speciality_id = speciality_id;
                    data.page = params.page();
                    data.count = params.count();
                    data.field = $scope.sortType;
                    data.sortOrder = $scope.sortOrder;
                    return Appointment.appointment(data).then(function(successData) {
                        params.total(successData.data.total);
                        $scope.doctor = successData.data.doctor;
                        return $scope.doctor;
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
            $scope.appointmentList()
        }
        
        /*
         * Listing of Speciality
         */
        $scope.getSpeciality = function() {
            Appointment.getSpeciality()
            .then(function(response) {
                $scope.speciality = response.data.speciality;
            })
            .catch(function(response) {
                $scope.messages = {
                    error: Array.isArray(response.data) ? response.data : [response.data]
                };
            });
        };
        $scope.getSpeciality();

        /*
         * Listing of Doctor
         */
        $scope.getDoctor = function() {
            Appointment.getDoctor()
            .then(function(response) {
                $scope.doctor = response.data.doctor;
            })
            .catch(function(response) {
                $scope.messages = {
                    error: Array.isArray(response.data) ? response.data : [response.data]
                };
            });
        };
        $scope.getDoctor();

        /*
         * Modal Open for Add case
         */
        $scope.open = function () {
            $rootScope.modalInstance = $uibModal.open({
                templateUrl: '../partials/modalBookAppointment.html', // loads the template
                backdrop: true, // setting backdrop allows us to close the modal window on clicking outside the modal window
                windowClass: 'modal', // windowClass - additional CSS class(es) to be added to a modal window template
                controller: 'AppointmentCtrl',
                size: 'lg'
            });
        };

        /*
         * Modal Close
         */
        $scope.cancel = function () {
            $rootScope.modalInstance.close();
        };

        /*
         * Datepicker
         */
        $scope.dateOptions = {
            dateDisabled: disabled,
            formatYear: 'yy',
            maxDate: new Date(2080, 1, 01),
            minDate: new Date(),
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

        /*
         * Get patient details based on MRN
         */
        $scope.getPatientDetail = function(){
            Appointment.getPatientDetail($scope.appointment)
            .then(function(response) {
                $scope.appointment = response.data.patient;
                $scope.appointment.dob = $filter('date')(response.data.patient.dob,'yyyy-MM-dd');
            })
            .catch(function(response) {
                toastr.error(response.data.msg,'Error');
            });
        }

        /*
         * Book Appointment
         */
        $scope.bookAppointment = function(isValid) {
            if(isValid){
                $scope.appointment.doctor_id = $routeParams.id;
                
                Appointment.bookAppointment($scope.appointment)
                .then(function(response) {
                    toastr.success(response.data.msg,'Success');

                    var title = 'Appointment with Anuj' + $scope.appointment.name;
                    var appointmentDate = $scope.appointment.appointment_date.toString();
                    var splitDate = appointmentDate.split('-');
                    var start = new Date(splitDate[0],splitDate[1],splitDate[2]);
                    var end = new Date(splitDate[0],splitDate[1],splitDate[2]);
                    $scope.addEvent(title, start, end);
                    
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

        

    });
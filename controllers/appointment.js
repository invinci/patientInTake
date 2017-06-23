var User = require('../models/User');
var Patient = require('../models/Patient');
var Appointment = require('../models/Appointment');

/**
 * Login required middleware
 */
exports.ensureAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(401).send({ msg: 'Unauthorized' });
    }
};

/**
 * PUT /appointment_list
 */
exports.appointmentList = function(req, res) {
    var page = req.body.page, 
        count = req.body.count,
        doctor_id = req.body.doctor_id,
        speciality_id = req.body.speciality_id,
        sort = req.body.sortOrder || -1,
        sort_field =  req.body.field || '_id',
        skipNo = (page - 1) * count;

    var sortObject = {};
    var stype = sort_field;
    var sdir = sort;
    sortObject[stype] = sdir;
    var query = {role_id:'5938dabbbef60e0f70a93866',is_deleted:false,is_status:true};
    if (doctor_id != '') {
        query._id = doctor_id;
    }
    if (speciality_id != '') {
        query.speciality_id = speciality_id;
    }
    User.count(query).exec(function(err, total) {
        if (err) return res.status(400).send({msg:'Something went wrong please try again.'});
        
        User.find(query).populate('speciality_id').sort(sortObject).skip(skipNo).limit(count).exec(function(err, doctor) {
            if (err) return res.status(400).send({msg:'Something went wrong please try again.'});

            res.send({msg:'success',doctor:doctor,total:total,status:200});
        })
    })
};

/**
 * POST /book_appointment
 */
exports.bookAppointment = function(req, res, next) {
    // req.assert('question_name', 'Question cannot be blank').notEmpty();
    
    // var errors = req.validationErrors();
    // if (errors) {
    //     return res.status(400).send(errors);
    // }

    // var questionname = req.body.question_name.toLowerCase();
    Patient.findOne({ mrn: req.body.mrn }, function(err, patient) {
        if (!patient) {
            return res.status(401).send({ msg: 'Patient not exist.'});
        }
        Appointment.findOne({ }, function(err, appointment) {
            if (appointment) {
                return res.status(400).send({msg:'Appointment already exist.'});
            }
            appointment = new Appointment({
                doctor_id: req.body.doctor_id,
                patient_id: patient._id,
                appointment_date: req.body.appointment_date,
                appointment_time: req.body.appointment_time
            });
            appointment.save(function(err) {
                if (err) return res.status(400).send({msg:'Something went wrong please try again.'});

                res.send({msg:'Appointment has been book successfully.'});
            });
        });
    });
};

/**
 * GET /get_doctor
 */
exports.getDoctor = function(req, res) {
    User.find({role_id:'5938dabbbef60e0f70a93866', is_deleted:false, is_status:true}, function(err, doctor) {
        if (!doctor) {
            return res.status(401).send({msg:'No record found.'});
        }
        res.json({doctor:doctor});
    });
};
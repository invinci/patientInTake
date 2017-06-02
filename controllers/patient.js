var Patient = require('../models/Patient');

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
 * PUT /staff_list
 */
exports.patientList = function(req, res) {
    var page = req.body.page, 
        count = req.body.count,
        status = req.body.status,
        search = req.body.search,
        dob = req.body.dob,
        sort = req.body.sortOrder || -1,
        sort_field =  req.body.field || '_id',
        skipNo = (page - 1) * count;

    var sortObject = {};
    var stype = sort_field;
    var sdir = sort;
    sortObject[stype] = sdir;
    var query = {is_deleted:false};
    if (search) {
        query['$or'] = [];
        query['$or'].push({name: new RegExp(search,'i')})
        query['$or'].push({mrn: new RegExp(search,'i')})
    }
    if (dob) {
        query.dob = dob;
    }
    if (status == 'active' || status == 'deactive') {
        var statusVal = (status == 'active' ? true : false);
        query.is_status = statusVal;
    }
    Patient.count(query).exec(function(err, total) {
        if (err) return res.status(400).send({msg:'Something went wrong please try again.'});

        Patient.find(query).sort(sortObject).skip(skipNo).limit(count).exec(function(err, patient) {
            if (err) return res.status(400).send({msg:'Something went wrong please try again.'});

            res.send({msg:'success',patient:patient,total:total,status:200});
        })
    })
};

/**
 * POST /patient_add
 */
exports.patientAdd = function(req, res, next) {
    req.assert('name', 'Name cannot be blank').notEmpty();
    req.assert('dob', 'DOB cannot be blank').notEmpty();
    req.assert('mrn', 'MRN cannot be blank').notEmpty();
    req.assert('password', 'Password cannot be blank').notEmpty();
    
    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).send(errors);
    }

    Patient.findOne({ mrn: req.body.mrn }, function(err, patient) {
        if (patient) {
            return res.status(400).send({msg:'The MRN you have entered is already associated with another account.' });
        }
        patient = new Patient({
            name: req.body.name.toLowerCase(),
            dob: req.body.dob,
            mrn: req.body.mrn,
            password: req.body.password,
            gender: req.body.gender
        });
        patient.save(function(err) {
            if (err) return res.status(400).send({msg:'Something went wrong please try again.'});

            res.send({msg:'Patient has been saved successfully.'});
        });
    });
};

/**
 * GET /patient_edit/:id
 */
exports.getPatientById = function(req, res) {
    Patient.findById(req.params.id).exec(function(err, patient) {
        if (!patient) {
            return res.status(401).send({msg:'No record found.'});
        }
        res.json({patient:patient});
    });
};

/**
 * PUT /patient_edit
 */
exports.patientEdit = function(req, res, next) {
    req.assert('name', 'Name cannot be blank').notEmpty();
    req.assert('dob', 'DOB cannot be blank').notEmpty();
    req.assert('mrn', 'MRN cannot be blank').notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).send(errors);
    }
    Patient.findById(req.body._id, function(err, patient) {
        if (!patient) {
            return res.status(401).send({msg:'No record found.'});
        }
        patient.name = req.body.name.toLowerCase();
        patient.dob = req.body.dob;
        patient.mrn = req.body.mrn;
        patient.gender = req.body.gender;
        patient.modified = Date.now();
        patient.save(function(err) {
            if(err && err.code === 11000) return res.status(401).send({msg:'Patient already exist.'});

            res.send({msg:'Patient has been updated successfully.'});
        });
    });
};

/**
 * GET /patient_delete/:id
 */
exports.patientDelete = function(req, res) {
    Patient.findById(req.params.id, function(err, patient) {
        if (!patient) {
            return res.status(401).send({msg:'No record found.'});
        }
        patient.is_deleted = true;
        patient.save(function(err) {
            if(err) res.status(409).send({msg:'Something went wrong please try again.'});

            res.send({patient:patient,msg:'Patient has been deleted successfully.'});
        });
    });
};

/**
 * POST /patient_status
 */
exports.patientStatus = function(req, res) {
    var enabled = req.body.enabled;
    var selAll = req.body.allChecked;
    var query = {};
    var fields = {};
    query._id = {
        $in: req.body.patient
    };

    fields.is_status = false;
    if (enabled == true) {
        fields.is_status = true;
    }
    Patient.update(query, fields, {
        multi: true
    }).exec(function(error, patient) {
        if (error) return res.status(400).send({msg:'Something went wrong please try again.'});

        Patient.find({_id: {$in:["patient"]},is_deleted:false}, function(err, patient) {
            if (error) return res.status(400).send({msg:'Something went wrong please try again.'});
            
            res.send({msg:'Status has been changed successfully',patient:patient,status:200});
        })
    })
}
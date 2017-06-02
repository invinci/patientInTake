var Speciality = require('../models/Speciality');

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
 * PUT /speciality_list
 */
exports.specialityList = function(req, res) {
    var page = req.body.page, 
        count = req.body.count,
        status = req.body.status,
        search = req.body.search,
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
    }
    if (status == 'active' || status == 'deactive') {
        var statusVal = (status == 'active' ? true : false);
        query.is_status = statusVal;
    }
    Speciality.count(query).exec(function(err, total) {
        if (err) return res.status(400).send({msg:'Something went wrong please try again.'});
        
        Speciality.find(query).sort(sortObject).skip(skipNo).limit(count).exec(function(err, speciality) {
            if (err) return res.status(400).send({msg:'Something went wrong please try again.'});
                
            res.send({msg:'success',speciality:speciality,total:total,status:200});
        })
    })
};

/**
 * POST /speciality_add
 */
exports.specialityAdd = function(req, res, next) {
    req.assert('name', 'Name cannot be blank').notEmpty();
    
    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).send(errors);
    }

    var specialityname = req.body.name.toLowerCase();
    Speciality.findOne({ name: specialityname }, function(err, speciality) {
        if (speciality) {
            return res.status(400).send({msg:'Speciality already exist.'});
        }
        speciality = new Speciality({
            name: specialityname,
            form_id: req.body.form_id
        });
        speciality.save(function(err) {
            if (err) return res.status(400).send({msg:'Something went wrong please try again.'});

            res.send({msg:'Speciality has been saved successfully.'});
        });
    });
};

/**
 * GET /speciality_edit/:id
 */
exports.getSpecialityById = function(req, res) {
    Speciality.findById(req.params.id, function(err, speciality) {
        if (!speciality) {
            return res.status(401).send({msg:'No record found.'});
        }
        res.json({speciality:speciality});
    });
};

/**
 * PUT /speciality_edit
 */
exports.specialityEdit = function(req, res, next) {
    req.assert('name', 'Name cannot be blank').notEmpty();
    
    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).send(errors);
    }
    var specialityname = req.body.name.toLowerCase();
    Speciality.findById(req.body._id, function(err, speciality) {
        if (!speciality) {
            return res.status(401).send({msg:'No record found.'});
        }
        speciality.name = specialityname;
        speciality.form_id = req.body.form_id;
        speciality.modified = Date.now();
        speciality.save(function(err) {
            if(err && err.code === 11000) return res.status(401).send({msg:'Speciality name already exist.'});

            res.send({msg:'Speciality has been updated successfully.'});
        });
    });
};

/**
 * GET /speciality_delete/:id
 */
exports.specialityDelete = function(req, res) {
    Speciality.findById(req.params.id, function(err, speciality) {
        if (!speciality) {
            return res.status(401).send({msg:'No record found.'});
        }
        speciality.is_deleted = true;
        speciality.save(function(err) {
            if(err) res.status(409).send({msg:'Something went wrong please try again.'});

            res.send({speciality:speciality,msg:'Speciality has been deleted successfully.'});
        });
    });
};

/**
 * POST /speciality_status
 */
exports.specialityStatus = function(req, res) {
    var enabled = req.body.enabled;
    var selAll = req.body.allChecked;
    var query = {};
    var fields = {};
    query._id = {
        $in: req.body.speciality
    };

    fields.is_status = false;
    if (enabled == true) {
        fields.is_status = true;
    }
    Speciality.update(query, fields, {
        multi: true
    }).exec(function(error, speciality) {
        if (error) return res.status(400).send({msg:'Something went wrong please try again.'});
        
        Speciality.find({_id: {$in:["speciality"]},is_deleted:false}, function(err, speciality) {
            if (error) return res.status(400).send({msg:'Something went wrong please try again.'});
        
            res.send({msg:'Status has been changed successfully',speciality:speciality,status:200});
        })
    })
}

/**
 * GET /get_speciality
 */
exports.getSpeciality = function(req, res) {
    Speciality.find({ is_deleted:false, is_status:true}, function(err, speciality) {
        if (!speciality) {
            return res.status(401).send({msg:'No record found.'});
        }
        res.json({speciality:speciality});
    });
};
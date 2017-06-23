var Form = require('../models/Form');

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
 * PUT /form_list
 */
exports.formList = function(req, res) {
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
    Form.count(query).exec(function(err, total) {
        if (err) return res.status(400).send({msg:'Something went wrong please try again.'});

        Form.find(query).sort(sortObject).skip(skipNo).limit(count).exec(function(err, form) {
            if (err) return res.status(400).send({msg:'Something went wrong please try again.'});

            res.send({msg:'success',form:form,total:total,status:200});
        })
    })
};

/**
 * POST /form_add
 */
exports.formAdd = function(req, res, next) {
    req.assert('name', 'Name cannot be blank').notEmpty();
    
    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).send(errors);
    }

    var formname = req.body.name.toLowerCase();
    Form.findOne({ name: formname }, function(err, form) {
        if (form) {
            return res.status(400).send({msg:'Form already exist.'});
        }
        form = new Form({
            name: formname,
            description: req.body.description
        });
        form.save(function(err) {
            if (err) return res.status(400).send({msg:'Something went wrong please try again.'});

            res.send({msg:'Form has been saved successfully.'});
        });
    });
};

/**
 * GET /form_edit/:id
 */
exports.getFormById = function(req, res) {
    Form.findById(req.params.id).exec(function(err, form) {
        if (!form) {
            return res.status(401).send({msg:'No record found.'});
        }
        res.json({form:form});
    });
};

/**
 * PUT /form_edit
 */
exports.formEdit = function(req, res, next) {
    req.assert('name', 'Name cannot be blank').notEmpty();
    
    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).send(errors);
    }
    Form.findById(req.body._id, function(err, form) {
        if (!form) {
            return res.status(401).send({msg:'No record found.'});
        }
        form.name = req.body.name.toLowerCase();
        form.description = req.body.description;
        form.modified = Date.now();
        form.save(function(err) {
            if(err && err.code === 11000) return res.status(401).send({msg:'Form already exist.'});

            res.send({msg:'Form has been updated successfully.'});
        });
    });
};

/**
 * GET /form_delete/:id
 */
exports.formDelete = function(req, res) {
    Form.findById(req.params.id, function(err, form) {
        if (!form) {
            return res.status(401).send({msg:'No record found.'});
        }
        form.is_deleted = true;
        form.save(function(err) {
            if(err) res.status(409).send({msg:'Something went wrong please try again.'});

            res.send({form:form,msg:'Form has been deleted successfully.'});
        });
    });
};

/**
 * POST /form_status
 */
exports.formStatus = function(req, res) {
    var enabled = req.body.enabled;
    var selAll = req.body.allChecked;
    var query = {};
    var fields = {};
    query._id = {
        $in: req.body.form
    };

    fields.is_status = false;
    if (enabled == true) {
        fields.is_status = true;
    }
    Form.update(query, fields, {
        multi: true
    }).exec(function(error, form) {
        if (error) return res.status(400).send({msg:'Something went wrong please try again.'});

        Form.find({_id: {$in:["form"]},is_deleted:false}, function(err, form) {
            if (error) return res.status(400).send({msg:'Something went wrong please try again.'});
            
            res.send({msg:'Status has been changed successfully',form:form,status:200});
        })
    })
}

/**
 * GET /get_forms
 */
exports.getForms = function(req, res) {
    Form.find({ is_deleted:false, is_status:true}, function(err, form) {
        if (!form) {
            return res.status(401).send({msg:'No record found.'});
        }
        res.send({form:form});
    });
};
var Role = require('../models/Role');
var User  = require('../models/User');
var mongoose= require ('mongoose');
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
 * PUT /role_list
 */

exports.roleList = function(req, res) {
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
    Role.count(query).exec(function(err, total) {
        if (err) return res.status(400).send({msg:'Something went wrong please try again.'});
        
        Role.find(query).sort(sortObject).skip(skipNo).limit(count).exec(function(err, role) {
            if (err) return res.status(400).send({msg:'Something went wrong please try again.'});
                
            res.send({msg:'success',role:role,total:total,status:200});
        })
    })
};

/**
 * POST /role_add
 */
exports.roleAdd = function(req, res, next) {
    req.assert('name', 'Name cannot be blank').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).send(errors);
    }

    var rolename = req.body.name.toLowerCase();
    Role.findOne({ name: rolename }, function(err, role) {
        if (role) {
            return res.status(400).send({msg:'Role already exist.'});
        }
        var roles = new Role({
            name: req.body.name

        });
        console.log("hello",roles);
        roles.save(function(err) {
            if (err) return res.status(400).send({msg:'Something went wrong please try again.'});
            res.send({msg:'Role has been saved successfully.'});
        });
    });
};

/**
 * GET /role_edit/:id
 */
exports.getRoleById = function(req, res) {
    Role.findById(req.params.id, function(err, role) {
        if (!role) {
            return res.status(401).send({ msg: 'No record found.'});
        }
        res.json({ role: role });
    });
};

// /**
//  * GET /permission
//  */
// exports.getPermission = function(req, res) {
//     Permission.find({}, function(err, permission) {
//         console.log(permission);
//         if (!permission) {
//             return res.status(401).send({ msg: 'No record found.'});
//         }
//         res.json({ permission: permission });
//     });
// };

exports.permissionAdd = function(req, res, next) {  
    console.log(req.body.data);
    role = new Role({
    permission_controller:req.body.controller,
    permission_action:req.body.action
        });
        
        role.save(function(err) {
            res.send({ msg: 'Role has been saved successfully.' });
        });
};

/**
 * PUT /role_edit
 */
exports.roleEdit = function(req, res, next) {
    req.assert('name', 'Name cannot be blank').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).send(errors);
    }
    var rolename = req.body.name.toLowerCase();
    Role.findById(req.body._id, function(err, role) {
        if (!role) {
            return res.status(401).send({msg:'No record found.'});
        }
        role.name = rolename;
        role.modified = Date.now();
        role.save(function(err) {
            if(err && err.code === 11000) return res.status(401).send({msg:'Role name already exist.'});

            res.send({msg:'Role has been updated successfully.'});
        });
    });
};

/**
 * GET /role_delete/:id
 */
exports.roleDelete = function(req, res) {
    Role.findById(req.params.id, function(err, role) {
        if (!role) {
            return res.status(401).send({msg:'No record found.'});
        }
        role.is_deleted = true;
        role.save(function(err) {
            if(err) res.status(409).send({msg:'Something went wrong please try again.'});

            res.send({role:role,msg:'Role has been deleted successfully.'});
        });
    });
};

/**
 * POST /role_status
 */
exports.roleStatus = function(req, res) {
    var enabled = req.body.enabled;
    var selAll = req.body.allChecked;
    var query = {};
    var fields = {};
    query._id = {
        $in: req.body.role
    };

    fields.is_status = false;
    if (enabled == true) {
        fields.is_status = true;
    }
    Role.update(query, fields, {
        multi: true
    }).exec(function(error, role) {
        if (error) return res.status(400).send({msg:'Something went wrong please try again.'});
        
        Role.find({_id: {$in:["role"]},is_deleted:false}, function(err, role) {
            if (error) return res.status(400).send({msg:'Something went wrong please try again.'});
        
            res.send({msg:'Status has been changed successfully',role:role,status:200});
        })
    })
}

/**
 * GET /get_roles
 */
exports.getRoles = function(req, res) {
    Role.find({ is_deleted:false, is_status:true}, function(err, role) {
        if (!role) {
            return res.status(401).send({msg:'No record found.'});
        }
        res.json({role:role});
    });
};
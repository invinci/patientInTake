var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var permissionSchema = mongoose.Schema({
    permission_controller : {
        type: Object, 
        required: false
    },
    permission_action : {
        type : Object, 
        required: false
    }
});

var roleSchema = new mongoose.Schema({
    name: {
    	type: String, 
    	unique: true
    },
    permission: {
        type : [permissionSchema],
        required: false
    },
    is_status: {
    	type: Boolean, 
    	default: true
    },
    is_deleted: {
    	type: Boolean, 
    	default: false
    },
    created: {
    	type: Date, 
    	default: Date.now
    },
    modified: {
    	type: Date, 
    	default: Date.now
    }
});
var Role = mongoose.model('Role', roleSchema);
module.exports = Role;
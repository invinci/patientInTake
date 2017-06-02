var mongoose = require('mongoose');

var roleSchema = new mongoose.Schema({
    name: {type: String, unique: true},
    permission: Array,
    is_status: {type: Boolean, default: true},
    is_deleted: {type: Boolean, default: false},
    created: {type: Date, default: Date.now},
    modified: {type: Date, default: Date.now}
});

var Role = mongoose.model('Role', roleSchema);

module.exports = Role;
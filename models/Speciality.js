var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var specialitySchema = new mongoose.Schema({
    name: {type: String, unique: true},
    form_id: [{
        type: Schema.Types.ObjectId,
        ref: 'Form'
    }],
    is_status: {type: Boolean, default: true},
    is_deleted: {type: Boolean, default: false},
    created: {type: Date, default: Date.now},
    modified: {type: Date, default: Date.now}
});

var Speciality = mongoose.model('Speciality', specialitySchema);

module.exports = Speciality;
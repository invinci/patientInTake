var mongoose = require('mongoose');

var patientSchema = new mongoose.Schema({
    name: String,
    dob: Date,
    mrn: {type:String, unique:true},
    gender: String,
    is_status: {type: Boolean, default: true},
    is_deleted: {type: Boolean, default: false},
    created: {type: Date, default: Date.now},
    modified: {type: Date, default: Date.now}
});

var Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;
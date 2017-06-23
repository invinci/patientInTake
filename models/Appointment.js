var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var appointmentSchema = new mongoose.Schema({
    doctor_id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    patient_id: {
        type: Schema.Types.ObjectId,
        ref: 'Patient'
    },
    appointment_date: {
        type: Date, 
        default: Date.now
    },
    appointment_time: String,
    // appointment_time: {
    //     type: Date, 
    //     default: Date.now
    // },
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

var Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;
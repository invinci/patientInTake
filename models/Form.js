var mongoose = require('mongoose');

var formSchema = new mongoose.Schema({
    name: {type: String, unique: true},
    description: String,
    is_status: {type: Boolean, default: true},
    is_deleted: {type: Boolean, default: false},
    created: {type: Date, default: Date.now},
    modified: {type: Date, default: Date.now}
});

var Form = mongoose.model('Form', formSchema);

module.exports = Form;
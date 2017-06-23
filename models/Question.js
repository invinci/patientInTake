var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var answerSchema = mongoose.Schema({
	answer_label : {
		type: Object, 
		required: false
	},
	answer_value : {
		type : Object, 
		required: false
	}
});

let dependencySchema = mongoose.Schema({
	dependencyQuestion: {
		type: mongoose.Schema.Types.ObjectId, 
		required: false
	},
	dependencyAnswer: {
		type: mongoose.Schema.Types.ObjectId, 
		required: false
	}
});

var questionSchema = new mongoose.Schema({
	form_id: {
        type: Schema.Types.ObjectId,
        ref: 'Form'
    },
    question_name: {
    	type: String,
    	unique: true
    },
    question_description: String,
    dependency : {
		type : [dependencySchema],
	    required: false
	},
	question_type : {	// Like text box, select,radio etc
		type : String,
		required: false
	},
	question_sort: {
		type: Number,
		unique: true
	},
	answers : {
		type: [answerSchema],
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
var Question = mongoose.model('Question', questionSchema);
module.exports = Question;
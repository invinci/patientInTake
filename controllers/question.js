var Question = require('../models/Question');

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
 * PUT /question_list
 */
exports.questionList = function(req, res) {
    var page = req.body.page, 
        count = req.body.count,
        search = req.body.search,
        form_id = req.body.form_id,
        sort = req.body.sortOrder || -1,
        sort_field =  req.body.field || '_id',
        skipNo = (page - 1) * count;

    var sortObject = {};
    var stype = sort_field;
    var sdir = sort;
    sortObject[stype] = sdir;
    var query = {form_id:form_id, is_deleted:false};
    if (search) {
        query['$or'] = [];
        query['$or'].push({question_name: new RegExp(search,'i')})
    }
    Question.count(query).exec(function(err, total) {
        if (err) return res.status(400).send({msg:'Something went wrong please try again.'});
        
        Question.find(query).sort(sortObject).skip(skipNo).limit(count).exec(function(err, question) {
            if (err) return res.status(400).send({msg:'Something went wrong please try again.'});
                
            res.send({msg:'success',question:question,total:total,status:200});
        })
    })
};

/**
 * POST /question_add
 */
exports.questionAdd = function(req, res, next) {
    req.assert('question_name', 'Question cannot be blank').notEmpty();
    
    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).send(errors);
    }

    var questionname = req.body.question_name.toLowerCase();
    Question.findOne({ $or:[{question_name:questionname},{question_sort:req.body.question_sort}] }, function(err, question) {
        if (question) {
            return res.status(400).send({msg:'Either question already exist or sort order is same.'});
        }
        question = new Question({
            form_id: req.body.form_id,
            question_name: questionname,
            question_description: req.body.question_description,
            dependency: req.body.dependency,
            question_type: req.body.question_type,
            question_sort: req.body.question_sort,
            answers: req.body.answers
        });
        question.save(function(err) {
            if (err) return res.status(400).send({msg:'Something went wrong please try again.'});

            res.send({msg:'Question has been saved successfully.'});
        });
    });
};

/**
 * GET /get_dependent_questions
 */
exports.getDependentQuestions = function(req, res) {
    Question.find({ form_id:req.params.form_id, is_deleted:false, is_status:true}, function(err, questions) {
        if (!questions) {
            return res.status(401).send({msg:'No record found.'});
        }
        res.send({questions:questions});
    });
};

/**
 * GET /get_dependent_answers
 */
exports.getDependentAnswers = function(req, res) {
    Question.find({ _id:req.params.question_id, is_deleted:false, is_status:true}, function(err, questions) {
        if (!questions) {
            return res.status(401).send({msg:'No record found.'});
        }
        res.send({answers:questions});
    });
};

/**
 * GET /question_edit/:id
 */
exports.getQuestionById = function(req, res) {
    Question.findById(req.params.id).exec(function(err, question) {
        if (!question) {
            return res.status(401).send({msg:'No record found.'});
        }
        res.send({question:question});
    });
};

/**
 * PUT /question_edit
 */
exports.questionEdit = function(req, res, next) {
    req.assert('question_name', 'Question cannot be blank').notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).send(errors);
    }
    Question.findById(req.body._id, function(err, question) {
        if (!question) {
            return res.status(401).send({msg:'No record found.'});
        }
        question.form_id = req.body.form_id;
        question.question_name = req.body.question_name.toLowerCase();
        question.question_description = req.body.question_description;
        question.dependency = req.body.dependency;
        question.question_type = req.body.question_type;
        question.question_sort = req.body.question_sort;
        question.answers = req.body.answers;
        question.modified = Date.now();
        question.save(function(err) {
            if(err && err.code === 11000) return res.status(401).send({msg:'Either question already exist or sort order is same.'});

            res.send({msg:'Question has been updated successfully.'});
        });
    });
};

/**
 * GET /question_delete/:id
 */
exports.questionDelete = function(req, res) {
    Question.findById(req.params.id, function(err, question) {
        if (!question) {
            return res.status(401).send({msg:'No record found.'});
        }
        question.is_deleted = true;
        question.save(function(err) {
            if(err) res.status(409).send({msg:'Something went wrong please try again.'});

            res.send({question:question,msg:'Question has been deleted successfully.'});
        });
    });
};
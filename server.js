var express = require('express');
var path = require('path');
var logger = require('morgan');
var compression = require('compression');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var dotenv = require('dotenv');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var moment = require('moment');
var request = require('request');

// Load environment variables from .env file
dotenv.load();

// Models
var User = require('./models/User');

// Controllers
var userController = require('./controllers/user');
var roleController = require('./controllers/role');
var formController = require('./controllers/form');
var patientController = require('./controllers/patient');
var specialityController = require('./controllers/speciality');

var app = express();

// DB Connection
var dbConnection = require('./db.js');
mongoose.connect(dbConnection.url);
mongoose.connection.on('error', function() {
    console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
    process.exit(1);
});
app.set('port', process.env.PORT || 3000);
app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
    req.isAuthenticated = function() {
    var token = (req.headers.authorization && req.headers.authorization.split(' ')[1]) || req.cookies.token;
        try {
            return jwt.verify(token, process.env.TOKEN_SECRET);
        } catch (err) {
            return false;
        }
    };

    if (req.isAuthenticated()) {
        var payload = req.isAuthenticated();
        User.findById(payload.sub, function(err, user) {
            req.user = user;
            next();
        });
    } else {
        next();
    }
});

/* Basic functionality */
app.put('/account', userController.ensureAuthenticated, userController.accountPut);
app.post('/signup', userController.signupPost);
app.post('/login', userController.loginPost);
app.post('/forgot', userController.forgotPost);
app.post('/reset/:token', userController.resetPost);

/* Roles */
app.put('/role_list', roleController.ensureAuthenticated, roleController.roleList);
app.post('/role_add', roleController.ensureAuthenticated, roleController.roleAdd);
app.get('/role_edit/:id', roleController.ensureAuthenticated, roleController.getRoleById);
app.put('/role_edit', roleController.ensureAuthenticated, roleController.roleEdit);
app.get('/role_delete/:id', roleController.ensureAuthenticated, roleController.roleDelete);
app.post('/role_status', roleController.ensureAuthenticated, roleController.roleStatus);
app.get('/get_roles', roleController.ensureAuthenticated, roleController.getRoles);

/* Staff */
app.put('/staff_list', userController.ensureAuthenticated, userController.staffList);
app.post('/staff_add', userController.ensureAuthenticated, userController.staffAdd);
app.get('/staff_edit/:id', userController.ensureAuthenticated, userController.getStaffById);
app.put('/staff_edit', userController.ensureAuthenticated, userController.staffEdit);
app.get('/staff_delete/:id', userController.ensureAuthenticated, userController.staffDelete);
app.post('/staff_status', userController.ensureAuthenticated, userController.staffStatus);

/* Patients */
app.put('/patient_list', patientController.ensureAuthenticated, patientController.patientList);
app.post('/patient_add', patientController.ensureAuthenticated, patientController.patientAdd);
app.get('/patient_edit/:id', patientController.ensureAuthenticated, patientController.getPatientById);
app.put('/patient_edit', patientController.ensureAuthenticated, patientController.patientEdit);
app.get('/patient_delete/:id', patientController.ensureAuthenticated, patientController.patientDelete);
app.post('/patient_status', patientController.ensureAuthenticated, patientController.patientStatus);

/* Forms */
app.put('/form_list', formController.ensureAuthenticated, formController.formList);
app.post('/form_add', formController.ensureAuthenticated, formController.formAdd);
app.get('/form_edit/:id', formController.ensureAuthenticated, formController.getFormById);
app.put('/form_edit', formController.ensureAuthenticated, formController.formEdit);
app.get('/form_delete/:id', formController.ensureAuthenticated, formController.formDelete);
app.post('/form_status', formController.ensureAuthenticated, formController.formStatus);
app.get('/get_forms', formController.ensureAuthenticated, formController.getForms);

/* Speciality */
app.put('/speciality_list', specialityController.ensureAuthenticated, specialityController.specialityList);
app.post('/speciality_add', specialityController.ensureAuthenticated, specialityController.specialityAdd);
app.get('/speciality_edit/:id', specialityController.ensureAuthenticated, specialityController.getSpecialityById);
app.put('/speciality_edit', specialityController.ensureAuthenticated, specialityController.specialityEdit);
app.get('/speciality_delete/:id', specialityController.ensureAuthenticated, specialityController.specialityDelete);
app.post('/speciality_status', specialityController.ensureAuthenticated, specialityController.specialityStatus);
app.get('/get_speciality', specialityController.ensureAuthenticated, specialityController.getSpeciality);

//app.get('/unlink/:provider', userController.ensureAuthenticated, userController.unlink);
//app.post('/auth/facebook', userController.authFacebook);
//app.get('/auth/facebook/callback', userController.authFacebookCallback);
//app.post('/auth/google', userController.authGoogle);
//app.get('/auth/google/callback', userController.authGoogleCallback);

app.get('*', function(req, res) {
    res.redirect('/#' + req.originalUrl);
});

// Production error handler
if (app.get('env') === 'production') {
    app.use(function(err, req, res, next) {
        console.error(err.stack);
        res.sendStatus(err.status || 500);
    });
}

app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});

module.exports = app;

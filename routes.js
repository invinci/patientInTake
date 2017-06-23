module.exports = function(app, express) {

	let router = express.Router();

	// Models
	var User = require('./models/User');

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

	// Controllers
	var userController = require('./controllers/user');
	var roleController = require('./controllers/role');
	var formController = require('./controllers/form');
	var patientController = require('./controllers/patient');
	var questionController = require('./controllers/question');
	var specialityController = require('./controllers/speciality');
	var appointmentController = require('./controllers/appointment');

	/*************************************************************************************************************/  
	/* Basic functionality */
	/*************************************************************************************************************/ 

	// Profile
	app.put('/account', userController.accountPut);

	// Signup
	app.post('/signup', userController.signupPost);

	// Login
	app.post('/login', userController.loginPost);

	// Forgot password
	app.post('/forgot', userController.forgotPost);

	// Reset password
	app.post('/reset/:token', userController.resetPost);


	/*************************************************************************************************************/ 
	/* Section for Managing Roles */
	/*************************************************************************************************************/ 

	// Roles listing with sorting, searching and pagination
	app.put('/role_list',roleController.roleList);

	// Add role
	app.post('/role_add',roleController.roleAdd);

	// Get particular role information based on Id
	app.get('/role_edit/:id', roleController.getRoleById);

	// Edit role
	app.put('/role_edit', roleController.roleEdit);

	// Delete role
	app.get('/role_delete/:id',roleController.roleDelete);

	// Update role status
	app.post('/role_status',  roleController.roleStatus);

	// Roles listing for dropdown
	app.get('/get_roles', roleController.getRoles);

    // app.get('/permission',roleController.getPermission);

  app.put('/permission_add',roleController.permissionAdd);



	/*************************************************************************************************************/ 
	/* Section for Managing Staff */
	/*************************************************************************************************************/ 

	// Staff listing with sorting, searching and pagination
	app.put('/staff_list',userController.staffList);

	// Add staff
	app.post('/staff_add', userController.staffAdd);

	// Get particular staff information based on Id
	app.get('/staff_edit/:id', userController.getStaffById);

	// Edit staff
	app.put('/staff_edit', userController.staffEdit);

	// Delete staff
	app.get('/staff_delete/:id', userController.staffDelete);

	// Update staff status
	app.post('/staff_status', userController.staffStatus);


	/*************************************************************************************************************/  
	/* Section for Managing Patients */
	/*************************************************************************************************************/ 

	// Patients listing with sorting, searching and pagination
	app.put('/patient_list', patientController.patientList);

	// Add patient
	app.post('/patient_add', patientController.patientAdd);

	// Get particular patient information based on Id
	app.get('/patient_edit/:id', patientController.getPatientById);

	// Edit patient
	app.put('/patient_edit', patientController.patientEdit);

	// Delete patient
	app.get('/patient_delete/:id', patientController.patientDelete);

	// Update patient status
	app.post('/patient_status', patientController.patientStatus);

	// Patients count
	app.get('/get_total_patients', patientController.getTotalPatients);

	// Get patient detail based on MRN
	app.put('/get_patient_detail', patientController.getPatientDetail);

	/*************************************************************************************************************/ 
	/* Section for Managing Forms section
	/*************************************************************************************************************/

	// Forms listing with sorting, searching and pagination
	app.put('/form_list', formController.formList);

	// Add form
	app.post('/form_add', formController.formAdd);

	// Get particular form information based on Id
	app.get('/form_edit/:id', formController.getFormById);

	// Edit form
	app.put('/form_edit', formController.formEdit);

	// Delete form
	app.get('/form_delete/:id', formController.formDelete);

	// Update form status
	app.post('/form_status', formController.formStatus);

	// Forms listing for dropdown
	app.get('/get_forms', formController.getForms);


	/*************************************************************************************************************/  
	/* Section for Managing Questions section
	/*************************************************************************************************************/ 

	// Questions listing with sorting, searching and pagination
	app.put('/question_list', questionController.questionList);

	// Add question
	app.post('/question_add', questionController.questionAdd);

	// Get particular question information based on Id
	app.get('/question_edit/:id', questionController.getQuestionById);

	// Edit question
	app.put('/question_edit', questionController.questionEdit);

	// Delete question
	app.get('/question_delete/:id', questionController.questionDelete);

	// Dependent questions listing for dropdown
	app.get('/get_dependent_questions/:form_id', questionController.getDependentQuestions);

	// Dependent answers listing for dropdown
	app.get('/get_dependent_answers/:question_id', questionController.getDependentAnswers);


	/*************************************************************************************************************/  
	/* Section for Managing Speciality section
	/*************************************************************************************************************/ 

	// Speciality listing with sorting, searching and pagination
	app.put('/speciality_list', specialityController.specialityList);

	// Add speciality
	app.post('/speciality_add', specialityController.specialityAdd);

	// Get particular speciality information based on Id
	app.get('/speciality_edit/:id', specialityController.getSpecialityById);

	// Edit speciality
	app.put('/speciality_edit', specialityController.specialityEdit);

	// Delete speciality
	app.get('/speciality_delete/:id', specialityController.specialityDelete);

	// Update speciality status
	app.post('/speciality_status', specialityController.specialityStatus);

	// Speciality listing for dropdown
	app.get('/get_speciality', specialityController.getSpeciality);


	/*************************************************************************************************************/ 
	/* Section for Managing Appointment */
	/*************************************************************************************************************/ 

	// Appointment listing with sorting, searching and pagination
	app.put('/appointment_list', appointmentController.appointmentList);

	// Doctor listing for dropdown
	app.get('/get_doctor', appointmentController.getDoctor);

	// Book appointment
	app.post('/book_appointment', appointmentController.bookAppointment);

	//app.get('/unlink/:provider', userController.ensureAuthenticated, userController.unlink);
	//app.post('/auth/facebook', userController.authFacebook);
	//app.get('/auth/facebook/callback', userController.authFacebookCallback);
	//app.post('/auth/google', userController.authGoogle);
	//app.get('/auth/google/callback', userController.authGoogleCallback);

}
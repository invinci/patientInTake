var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var jwt = require('jsonwebtoken');
var moment = require('moment');
var request = require('request');
var qs = require('querystring');
var User = require('../models/User');

function generateToken(user) {
    var payload = {
        iss: 'my.domain.com',
        sub: user.id,
        iat: moment().unix(),
        exp: moment().add(7, 'days').unix()
    };
    return jwt.sign(payload, process.env.TOKEN_SECRET);
}

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
// /**
//  * permissions allotted middleware
//  */
 
exports.permissionAuthenticated = function(req, res, next) {
 Permission.find({},function(err, docs) {
      var controller=docs[0].permission_controller;
      var action= docs[0].permission_action;
      console.log(action);
        if (!controller)
           res.status(401).send({ msg: 'Unauthorized' });
        else
           next();
    });
}

/**
 * POST /login
 */
exports.loginPost = function(req, res, next) {
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('email', 'Email cannot be blank').notEmpty();
    req.assert('password', 'Password cannot be blank').notEmpty();
    req.sanitize('email').normalizeEmail({ remove_dots: false });

    var errors = req.validationErrors();

    if (errors) {
        return res.status(400).send(errors);
    }

    User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
            return res.status(401).send({ msg: 'The email address ' + req.body.email + ' is not associated with any account. ' +
            'Double-check your email address and try again.'});
        }
        user.comparePassword(req.body.password, function(err, isMatch) {
            if (!isMatch) {
                return res.status(401).send({ msg: 'Invalid email or password' });
            }
            user.last_login = Date.now();
            user.save(function(err) {
                if(err) return res.status(401).send({ msg: 'Something went wrong please try again.'});

                res.send({ token: generateToken(user), user: user.toJSON() });
            });
        });
    });
};

/**
 * POST /signup
 */
exports.signupPost = function(req, res, next) {
    req.assert('name', 'Name cannot be blank').notEmpty();
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('email', 'Email cannot be blank').notEmpty();
    req.assert('password', 'Password must be at least 4 characters long').len(4);
    req.sanitize('email').normalizeEmail({ remove_dots: false });

    var errors = req.validationErrors();

    if (errors) {
        return res.status(400).send(errors);
    }

    User.findOne({ email: req.body.email }, function(err, user) {
        if (user) {
            return res.status(400).send({ msg: 'The email address you have entered is already associated with another account.' });
        }
        user = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            status:true,
            is_deleted:false
        });
        user.save(function(err) {
            res.send({ token: generateToken(user), user: user });
        });
    });
};

/**
 * PUT /account
 */
exports.accountPut = function(req, res, next) {
    if ('password' in req.body) {
        req.assert('password', 'Password must be at least 4 characters long').len(4);
        req.assert('confirm', 'Passwords must match').equals(req.body.password);
    } else {
        req.assert('email', 'Email is not valid').isEmail();
        req.assert('email', 'Email cannot be blank').notEmpty();
        req.sanitize('email').normalizeEmail({ remove_dots: false });
    }

    var errors = req.validationErrors();

    if (errors) {
        return res.status(400).send(errors);
    }

    User.findById(req.user.id, function(err, user) {
        if ('password' in req.body) {
            user.password = req.body.password;
        } else {
            user.email = req.body.email;
            user.name = req.body.name.toLowerCase();
            user.address = req.body.address;
            user.contact = req.body.contact;
            user.gender = req.body.gender;
        }
        user.save(function(err) {
            if ('password' in req.body) {
                res.send({ msg: 'Your password has been changed.' });
            } else if (err && err.code === 11000) {
                res.status(409).send({ msg: 'The email address you have entered is already associated with another account.' });
            } else {
                res.send({ user: user, msg: 'Your profile information has been updated.' });
            }
        });
    });
};

/**
 * DELETE /account
 */
/*exports.accountDelete = function(req, res, next) {
  User.remove({ _id: req.user.id }, function(err) {
    res.send({ msg: 'Your account has been permanently deleted.' });
  });
};*/

/**
 * GET /unlink/:provider
 */
/*exports.unlink = function(req, res, next) {
  User.findById(req.user.id, function(err, user) {
    switch (req.params.provider) {
      case 'facebook':
        user.facebook = undefined;
        break;
      case 'google':
        user.google = undefined;
        break;
      case 'twitter':
        user.twitter = undefined;
        break;
      case 'vk':
        user.vk = undefined;
        break;
      case 'github':
          user.github = undefined;
        break;      
      default:
        return res.status(400).send({ msg: 'Invalid OAuth Provider' });
    }
    user.save(function(err) {
      res.send({ msg: 'Your account has been unlinked.' });
    });
  });
};*/

/**
 * POST /forgot
 */
exports.forgotPost = function(req, res, next) {
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('email', 'Email cannot be blank').notEmpty();
    req.sanitize('email').normalizeEmail({ remove_dots: false });

    var errors = req.validationErrors();

    if (errors) {
        return res.status(400).send(errors);
    }

    async.waterfall([
        function(done) {
            crypto.randomBytes(16, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done) {
            User.findOne({ email: req.body.email }, function(err, user) {
                if (!user) {
                    return res.status(400).send({ msg: 'The email address ' + req.body.email + ' is not associated with any account.' });
                }
                user.passwordResetToken = token;
                user.passwordResetExpires = Date.now() + 3600000; // expire in 1 hour
                user.save(function(err) {
                    done(err, token, user);
                });
            });
        },
        function(token, user, done) {
            // var transporter = nodemailer.createTransport({
            //     service: 'Mailgun',
            //     auth: {
            //         user: process.env.MAILGUN_USERNAME,
            //         pass: process.env.MAILGUN_PASSWORD
            //     }
            // });
            var transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: process.env.GMAIL_USERNAME,
                    pass: process.env.GMAIL_PASSWORD
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'support@yourdomain.com',
                subject: '✔ Reset your password',
                text: 'You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            transporter.sendMail(mailOptions, function(err) {
                res.send({ msg: 'An email has been sent to ' + user.email + ' with further instructions.' });
                done(err);
            });
        }
    ]);
};

/**
 * POST /reset/:token
 */
exports.resetPost = function(req, res, next) {
    req.assert('password', 'Password must be at least 4 characters long').len(4);
    req.assert('confirm', 'Passwords must match').equals(req.body.password);

    var errors = req.validationErrors();

    if (errors) {
        return res.status(400).send(errors);
    }

    async.waterfall([
        function(done) {
            User.findOne({ passwordResetToken: req.params.token })
            .where('passwordResetExpires').gt(Date.now())
            .exec(function(err, user) {
                if (!user) {
                    return res.status(400).send({ msg: 'Password reset token is invalid or has expired.' });
                }
                user.password = req.body.password;
                user.passwordResetToken = undefined;
                user.passwordResetExpires = undefined;
                user.save(function(err) {
                    done(err, user);
                });
            });
        },
        function(user, done) {
            // var transporter = nodemailer.createTransport({
            //     service: 'Mailgun',
            //     auth: {
            //         user: process.env.MAILGUN_USERNAME,
            //         pass: process.env.MAILGUN_PASSWORD
            //     }
            // });
            var transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: process.env.GMAIL_USERNAME,
                    pass: process.env.GMAIL_PASSWORD
                }
            });
            var mailOptions = {
                from: 'support@yourdomain.com',
                to: user.email,
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            transporter.sendMail(mailOptions, function(err) {
                res.send({ msg: 'Your password has been changed successfully.' });
            });
        }
    ]);
};

/**
 * POST /auth/facebook
 * Sign in with Facebook
 */
/*exports.authFacebook = function(req, res) {
  var profileFields = ['id', 'name', 'email', 'gender', 'location'];
  var accessTokenUrl = 'https://graph.facebook.com/v2.5/oauth/access_token';
  var graphApiUrl = 'https://graph.facebook.com/v2.5/me?fields=' + profileFields.join(',');

  var params = {
    code: req.body.code,
    client_id: req.body.clientId,
    client_secret: process.env.FACEBOOK_SECRET,
    redirect_uri: req.body.redirectUri
  };

  // Step 1. Exchange authorization code for access token.
  request.get({ url: accessTokenUrl, qs: params, json: true }, function(err, response, accessToken) {
    if (accessToken.error) {
      return res.status(500).send({ msg: accessToken.error.message });
    }

    // Step 2. Retrieve user's profile information.
    request.get({ url: graphApiUrl, qs: accessToken, json: true }, function(err, response, profile) {
      if (profile.error) {
        return res.status(500).send({ msg: profile.error.message });
      }

      // Step 3a. Link accounts if user is authenticated.
      if (req.isAuthenticated()) {
        User.findOne({ facebook: profile.id }, function(err, user) {
          if (user) {
            return res.status(409).send({ msg: 'There is already an existing account linked with Facebook that belongs to you.' });
          }
          user = req.user;
          user.name = user.name || profile.name;
          user.gender = user.gender || profile.gender;
          user.picture = user.picture || 'https://graph.facebook.com/' + profile.id + '/picture?type=large';
          user.facebook = profile.id;
          user.save(function() {
            res.send({ token: generateToken(user), user: user });
          });
        });
      } else {
        // Step 3b. Create a new user account or return an existing one.
        User.findOne({ facebook: profile.id }, function(err, user) {
          if (user) {
            return res.send({ token: generateToken(user), user: user });
          }
          User.findOne({ email: profile.email }, function(err, user) {
            if (user) {
              return res.status(400).send({ msg: user.email + ' is already associated with another account.' })
            }
            user = new User({
              name: profile.name,
              email: profile.email,
              gender: profile.gender,
              location: profile.location && profile.location.name,
              picture: 'https://graph.facebook.com/' + profile.id + '/picture?type=large',
              facebook: profile.id
            });
            user.save(function(err) {
              return res.send({ token: generateToken(user), user: user });
            });
          });
        });
      }
    });
  });
};

exports.authFacebookCallback = function(req, res) {
  res.send('Loading...');
};*/

/**
 * POST /auth/google
 * Sign in with Google
 */
/*exports.authGoogle = function(req, res) {
  var accessTokenUrl = 'https://accounts.google.com/o/oauth2/token';
  var peopleApiUrl = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';

  var params = {
    code: req.body.code,
    client_id: req.body.clientId,
    client_secret: process.env.GOOGLE_SECRET,
    redirect_uri: req.body.redirectUri,
    grant_type: 'authorization_code'
  };

  // Step 1. Exchange authorization code for access token.
  request.post(accessTokenUrl, { json: true, form: params }, function(err, response, token) {
    var accessToken = token.access_token;
    var headers = { Authorization: 'Bearer ' + accessToken };

    // Step 2. Retrieve user's profile information.
    request.get({ url: peopleApiUrl, headers: headers, json: true }, function(err, response, profile) {
      if (profile.error) {
        return res.status(500).send({ message: profile.error.message });
      }
      // Step 3a. Link accounts if user is authenticated.
      if (req.isAuthenticated()) {
        User.findOne({ google: profile.sub }, function(err, user) {
          if (user) {
            return res.status(409).send({ msg: 'There is already an existing account linked with Google that belongs to you.' });
          }
          user = req.user;
          user.name = user.name || profile.name;
          user.gender = profile.gender;
          user.picture = user.picture || profile.picture.replace('sz=50', 'sz=200');
          user.location = user.location || profile.location;
          user.google = profile.sub;
          user.save(function() {
            res.send({ token: generateToken(user), user: user });
          });
        });
      } else {
        // Step 3b. Create a new user account or return an existing one.
        User.findOne({ google: profile.sub }, function(err, user) {
          if (user) {
            return res.send({ token: generateToken(user), user: user });
          }
          user = new User({
            name: profile.name,
            email: profile.email,
            gender: profile.gender,
            picture: profile.picture.replace('sz=50', 'sz=200'),
            location: profile.location,
            google: profile.sub
          });
          user.save(function(err) {
            res.send({ token: generateToken(user), user: user });
          });
        });
      }
    });
  });
};

exports.authGoogleCallback = function(req, res) {
  res.send('Loading...');
};*/


/**
 * PUT /staff_list
 */
exports.staffList = function(req, res) {
    var page = req.body.page, 
        count = req.body.count,
        status = req.body.status,
        search = req.body.search,
        role_id = req.body.role_id,
        sort = req.body.sortOrder || -1,
        sort_field =  req.body.field || '_id',
        skipNo = (page - 1) * count;

    var sortObject = {};
    var stype = sort_field;
    var sdir = sort;
    sortObject[stype] = sdir;
    var query = {is_deleted:false,role_id:{"$exists":true}};
    if (search) {
        query['$or'] = [];
        query['$or'].push({name: new RegExp(search,'i')})
        query['$or'].push({email: new RegExp(search,'i')})
    }
    if (status == 'active' || status == 'deactive') {
        var statusVal = (status == 'active' ? true : false);
        query.is_status = statusVal;
    }
    if (role_id != '') {
        query.role_id = role_id;
    }
    User.count(query).exec(function(err, total) {
        if (err) return res.status(400).send({msg:'Something went wrong please try again.'});
        
        User.find(query).populate('role_id').populate('speciality_id').sort(sortObject).skip(skipNo).limit(count).exec(function(err, staff) {
            if (err) return res.status(400).send({msg:'Something went wrong please try again.'});

            res.send({msg:'success',staff:staff,total:total,status:200});
        })
    })
};

/**
 * POST /staff_add
 */
exports.staffAdd = function(req, res, next) {
    req.assert('name', 'Name cannot be blank').notEmpty();
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('email', 'Email cannot be blank').notEmpty();
    req.assert('password', 'Password cannot be blank').notEmpty();
    req.sanitize('email').normalizeEmail({ remove_dots: false });

    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).send(errors);
    }

    User.findOne({ email: req.body.email }, function(err, staff) {
        if (staff) {
            return res.status(400).send({msg:'The email address you have entered is already associated with another account.' });
        }
        staff = new User({
            role_id: req.body.role_id,
            name: req.body.name.toLowerCase(),
            email: req.body.email,
            password: req.body.password,
            speciality_id: req.body.speciality_id,
            practice_year: req.body.practice_year,
            address: req.body.address,
            education: req.body.education,
            work_experience: req.body.work_experience,
            contact: req.body.contact,
            gender: req.body.gender
        });
        staff.save(function(err) {
            if (err) return res.status(400).send({msg:'Something went wrong please try again.'});

            res.send({msg:'Staff has been saved successfully.'});
        });
    });
};

/**
 * GET /staff_edit/:id
 */
exports.getStaffById = function(req, res) {
    User.findById(req.params.id).populate('role_id').populate('speciality_id').exec(function(err, staff) {
        if (!staff) {
            return res.status(401).send({msg:'No record found.'});
        }
        res.json({staff:staff});
    });
};

/**
 * PUT /staff_edit
 */
exports.staffEdit = function(req, res, next) {
    req.assert('name', 'Name cannot be blank').notEmpty();
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('email', 'Email cannot be blank').notEmpty();
    req.sanitize('email').normalizeEmail({ remove_dots: false });

    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).send(errors);
    }
    User.findById(req.body._id, function(err, staff) {
        if (!staff) {
            return res.status(401).send({msg:'No record found.'});
        }
        staff.role_id = req.body.role_id;
        staff.name = req.body.name.toLowerCase();
        staff.email = req.body.email;
        staff.speciality_id = req.body.speciality_id;
        staff.practice_year = req.body.practice_year;
        staff.address = req.body.address;
        staff.education = req.body.education;
        staff.work_experience = req.body.work_experience;
        staff.contact = req.body.contact;
        staff.gender = req.body.gender;
        staff.modified = Date.now();
        staff.save(function(err) {
            if(err && err.code === 11000) return res.status(401).send({msg:'Staff already exist.'});

            res.send({msg:'Staff has been updated successfully.'});
        });
    });
};

/**
 * GET /staff_delete/:id
 */
exports.staffDelete = function(req, res) {
    User.findById(req.params.id, function(err, staff) {
        if (!staff) {
            return res.status(401).send({msg:'No record found.'});
        }
        staff.is_deleted = true;
        staff.save(function(err) {
            if(err) res.status(409).send({msg:'Something went wrong please try again.'});

            res.send({staff:staff,msg:'Staff has been deleted successfully.'});
        });
    });
};

/**
 * POST /staff_status
 */
exports.staffStatus = function(req, res) {
    var enabled = req.body.enabled;
    var selAll = req.body.allChecked;
    var query = {};
    var fields = {};
    query._id = {
        $in: req.body.staff
    };

    fields.is_status = false;
    if (enabled == true) {
        fields.is_status = true;
    }
    User.update(query, fields, {
        multi: true
    }).exec(function(error, staff) {
        if (error) return res.status(400).send({msg:'Something went wrong please try again.'});

        User.find({_id: {$in:["staff"]},is_deleted:false}, function(err, staff) {
            if (error) return res.status(400).send({msg:'Something went wrong please try again.'});

            res.send({msg:'Status has been changed successfully',staff:staff,status:200});
        })
    })
}
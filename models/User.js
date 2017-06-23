var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schemaOptions = {
    timestamps: true,
    toJSON: {
        virtuals: true
    }
};

var userSchema = new mongoose.Schema({
    role_id: {
        type: Schema.Types.ObjectId,
        ref: 'Role'
    },
    name: String,
    email: { 
        type: String, 
        unique: true
    },
    password: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    speciality_id: {
        type: Schema.Types.ObjectId,
        ref: 'Speciality'
    },
    practice_year: Number,
    address: String,
    gender: String,
    contact: String,
    education: String,
    work_experience: String,
    is_status: {
        type: Boolean, 
        default: true
    },
    is_deleted: {
        type: Boolean, 
        default: false
    },
    last_login: {
        type: Date, 
        default: Date.now
    },
    created: {
        type: Date, 
        default: Date.now
    },
    modified: {
        type: Date, 
        default: Date.now
    }
}, schemaOptions);

userSchema.pre('save', function(next) {
    var user = this;
    if (!user.isModified('password')) { return next(); }
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(user.password, salt, null, function(err, hash) {
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function(password, cb) {
    bcrypt.compare(password, this.password, function(err, isMatch) {
        cb(err, isMatch);
    });
};

userSchema.virtual('gravatar').get(function() {
    if (!this.get('email')) {
        return 'https://gravatar.com/avatar/?s=200&d=retro';
    }
    var md5 = crypto.createHash('md5').update(this.get('email')).digest('hex');
    return 'https://gravatar.com/avatar/' + md5 + '?s=200&d=retro';
});

userSchema.options.toJSON = {
    transform: function(doc, ret, options) {
        delete ret.password;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
    }
};

var User = mongoose.model('User', userSchema);
module.exports = User;
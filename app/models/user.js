//***PACKAGES***
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  bcrypt = require('bcrypt-nodejs');

//User schema
var UserSchema = new Schema({
  name: String,
  username: {
    type: String,
    required: true,
    index: {
      unique: true
    }
  },
  password: {
    type: String,
    required: true,
    select: false
  }
});

//Hash password
UserSchema.pre('save', function (next) {
  var user = this;

  //Skip if password hasn't been changed
  if (!user.isModified('password')) {
    return next();
  }

  //
  bcrypt.hash(user.password, null, null, function (err, hash) {
    if (err) {
      return next(err);
    }

    user.password = hash;
    next();
  });
});

//Validate password
UserSchema.methods.comparePassword = function (password) {
  var user = this;

  return bcrypt.compareSync(password, user.password);
};

module.exports = mongoose.model('User', UserSchema);
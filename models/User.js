'use strict';

// bring in mongoose for db management
var bcrypt = require('bcrypt-nodejs');
var eat = require('eat');
var mongoose = require('mongoose');

// Expiration Time
var expiresAfterHours = 2;

// Setup schema via mongoose function, add basic for auth as sub-object
var userSchema = mongoose.Schema({
  eat: Number,
  username: String,
  basic: {
    email: { type: String,
           unique: true},
    password: String
  }
});

// Validations
userSchema.path('username').required(true);             // require username
userSchema.path('basic.email').required(true);
userSchema.path('basic.email').index({unique: true});   // require unique email
userSchema.path('basic.password').required(true);


// Mongoose methods to make userSchema do stuff via User
userSchema.methods.genHash = function(password, callback) {  // may have to pass next or done
  bcrypt.genSalt(8, function (err, salt) {
    bcrypt.hash(password, salt, null, function(err, hash) {
      if (err) throw err;
      callback(hash);       // password to store hash in db
    });
  });
};

userSchema.methods.checkPassword = function(password, callback) {
  bcrypt.compare(password, this.basic.password, function(err, res) {
    if (err) throw err;
    callback(res);      // if fails, res=false. if success, res=true
  });
};

userSchema.methods.genToken = function(secret, callback) {
  var currentDate = new Date();
  this.eat = currentDate.setHours(currentDate.getHours() + expiresAfterHours);

  this.save(function(err, user) {
    if (err) {
      console.log("Error saving new user.eat value. Error: ", err);
      throw err;
    }

    eat.encode({ eat: user.eat }, secret, function(err, eatoken) {
      if (err) {
        console.log('Error encoding eat. Error: ', err);
        return callback(err, null);
      }
      callback(err, eatoken);
    });
  });
};

userSchema.methods.invalidateToken = function(callback) {
  this.eat = null;
  this.save(function(err, user) {
    if (err) {
      console.log('Could not save upated user token');
      return callback(err, null);
    }
    callback(err, user);
  });
};

// Export mongoose model with Name/schema
module.exports = mongoose.model('User', userSchema);

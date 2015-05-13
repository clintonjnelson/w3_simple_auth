'use strict';

// bring in mongoose for db management
var bcrypt = require('bcrypt-nodejs');
var eat = require('eat');
var mongoose = require('mongoose');

// Setup schema via mongoose function, add basic for auth as sub-object
var userSchema = mongoose.Schema({
  eatoken: String,
  eatimestamp: { type: Date, default: Date.now },
  username: String,
  basic: {
    email: { type: String, unique: true },
    passtoken: String
  }
});

// Validations
userSchema.path('username').required(true);
// userSchema.path('username').index({unique: true});   // bring back later

// Mongoose methods to make userSchema do stuff via User
userSchema.methods.genHash = function(password, callback) {  // may have to pass next or done
  bcrypt.genSalt(8, function (err, salt) {
    bcrypt.hash(password, salt, null, function(err, hash) {
      if (err) throw err;
      // STORE PASSWORD IN DB VIA CALLBACK(?)
      // or this.basic.password = hash;
    });
  });
};

userSchema.methods.checkPassword = function(password, callback) {
  bcrypt.compare(password, this.basic.password, function(err, res) {
    if (err) throw err;
    // if fails, res=false. if success, res=true
    // DO SOMETHING WITH CALLBACK
  });
};

userSchema.methods.genToken = function(secret, callback) {
  eat.encode({ eatoken: this.eatoken, eatimestamp: this.eatimestamp }, secret, function(err, token) {
    if (err) throw err;
    // SEND TOKEN WITH CALLBACK(?)
  });
}

// Export mongoose model with Name/schema
module.exports = mongoose.model('User', userSchema);

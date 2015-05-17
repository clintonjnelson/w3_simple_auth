'use strict';

var BasicStrategy = require('passport-http').BasicStrategy;
var User = require('../models/User.js');

// do this stuff to with a passport for validation
module.exports = function(passport) {
  // Per docs should be:
  passport.use('basic', new BasicStrategy({}, function(email, password, done) {
    // attempt to validate or return out of process
    User.findOne({'basic.email': email}, function(err, user) {
      if (err) return done('database error');
      if (!user) return done('user not found');
      user.checkPassword(password, function(result) {  // user schema has password checking on it!
        if (!result) return done('wrong password');
      });

      return done(null, user);  // return user if no auth errors
    });
  }));
};

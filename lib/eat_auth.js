'use strict';

var eat = require('eat');
var User = require('../models/User.js');


module.exports = function (secret) {
  // This needs to be MIDDLEWARE format, so returns function w/secret used INSIDE
  return function eatAuth(req, res, next) {
    var eatoken = req.headers.eat || req.body.eat || req.params.eat;

    if (!eatoken) {  // token provided?
      console.log('No eat provided.');
      return res.status(401).json({msg: 'please sign in to do that'});
    }

    eat.decode(eatoken, secret, function(err, decoded) {  // token exists - try to decode
      if (err) {
        console.log('EAT was not valid. Error: ', err);
        return res.status(401).json({msg: 'please sign in to do that'});
      }

      User.findOne(decoded, function(err, user) {  // token decodes - find user
        if (err || !user) {
          console.log("No User matches EAT. Error: ", err);
          return res.status(401).json({msg: 'please sign in to do that'});
        }

        req.user = user;  // user exists - attach for server use
        next();  // next middleware
      });
    });

  };
};

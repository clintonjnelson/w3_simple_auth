'use strict';

var bodyparser = require('body-parser');
var eatAuth = require('../lib/eat_auth.js')(process.env.AUTH_SECRET);  // call func, passing secret
var User = require('../models/User.js');


module.exports = function(router, passport) {
  router.use(bodyparser.json());

  // Creating a user
  router.post('/createuser', function(req, res) {
    // create a userData with limited data in case need to send info back
    var userData = JSON.parse(JSON.stringify(req.body));   // REFACTOR LATER
    delete userData.email;
    delete userData.password;
    userData.basic = {};
    userData.basic.email = req.body.email;
    var newUser = new User(userData); // Won't save user/pass EVEN if someone changes schema!

    // populate the basic-level schema for db here so don't expose or save wrongly
    newUser.genHash(req.body.password, function(hash) {
      newUser.basic.password = hash;      // save here to keep things consistent
      newUser.save(function(err, user) {  // save properly formatted user
        if (err) {
          console.log(err);
          return res.status(500).json({msg: 'email has already been used'});
        }
        user.genToken(process.env.APP_SECRET, function(err, eat) {
          if (err) {
            console.log(err);
            return res.status(500).json({msg: 'error generating authorization token'});
          }
          res.json({eat: eat});
        });
      });
    });
  });

  // Existing user signin (creating EAT)
  router.get('/signin', passport.authenticate('basic', { session: false }), function(req, res) {
    // user gets added to the request on success by passport_strategy
    req.user.genToken(process.env.APP_SECRET, function(err, eat) {
      if (err) {
        console.log(err);
        return res.status(500).json({msg: 'error generating authorization token'});
      }
      res.json({eat: eat});
    });
  });

  // Signout user (invalidate EAT)
  // multiple callbacks after path act like middleware filtering
  router.get('/signout/:eat', eatAuth, function(req, res) {
    req.user.invalidateToken(function(err, confirm){
      if (err) {
        console.log('Error invalidating token: ', err);
        return res.status(500).json({msg: 'internal server error'});
      }
      res.json({msg: 'you have been signed out'});
    });
  });
};







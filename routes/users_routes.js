'use strict';

var eatAuth = require('../lib/eat_auth.js')(process.env.AUTH_SECRET);
var bodyparser = require('body-parser');
var User = require('../models/User'); // Require in model

// setup function to export; takes express router
module.exports = function(router) {
  router.use(bodyparser.json());  // api will receive JSON


  // R: get user (see user info)
  router.get('/users/:username', eatAuth, function(req, res) {
    var username = req.params.username;  // // BODY EMPTY, PARAMS HAS: username
    User.find({'username': username}, function(err, data) {  // lookup in db
      if (err) {  // handle error - conole it, vague message user
        console.log(err);
        return res.status(500).json( {msg: 'internal server error'} );
      }

      res.json(data);  // send raw data to user
    });
  });

  // C: User creation POST route is now in auth_routes.js

  // U: update user
  router.put('/users/:id', eatAuth, function(req, res) {
    var updatedUser = req.body;
    console.log('HERE"S THE USER ITS TRYING TO UPDATE FOR: ', req.body);
    delete updatedUser._id;   // pass option for props to ignore in update
    delete updatedUser.eat;   // DELETE ENCODED TOKEN

    User.update({'_id': req.params.id}, updatedUser, function(err, data) {
      switch(true) {
        case !!(err && err.code === 11000):
          return res.json({msg: 'username already exists - please try a different username'});
        case !!(err && err.username):
          return res.json( {msg: err.username.message.replace("Path", '')} );
        case !!(err && err.name === 'CastError'):
          return res.json( {msg: 'invalid user'} );
        case !!err:
          console.log(err);
          return res.status(500).json({msg: 'internal server error'});
      }

      res.json({msg: 'user updated'});
    });
  });

  // D: destroy user
  router.delete('/users/:id', eatAuth, function(req, res) {
    User.remove({'_id': req.params.id}, function(err, data) {
      switch(true) {
        case !!(err && err.name === 'CastError'):
          return res.json( {msg: 'invalid user'} );
        case !!err:
          console.log(err);
          return res.status(500).json({msg: 'internal server error'});
      }

      // To get a report back on outcome, check data.result.n
      res.json({msg: (data.result.n ? 'user removed' : 'user could not be removed')});  //returns 0 or more
    });
  });
};









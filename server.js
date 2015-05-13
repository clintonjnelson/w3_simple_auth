'use strict';

var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var app = express();                    // make app/server via express

// Express Routers
var authRouter = express.Router()
var usersRouter = express.Router();

// Setup db & host to listen
// SETUP THESE AS ENV VARIABLES!!!!!!
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/users_development');

// initialize passport strategy
app.use(passport.initialize());

// Populate Router by passing to routes file
require('./routes/users_routes.js')(usersRouter);
require('./routes/auth_routes.js')(authRouter, passport); // takes an initialized passport library!

// Assign base route & Router of subroutes to app
app.use('/api', usersRouter);
app.use('/api', authRouter);

// Start server on env port or default 3000
app.listen(process.env.PORT || 3000, function() {
  console.log('server running on port ' + (process.env.PORT || 3000));
});










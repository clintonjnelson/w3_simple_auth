'use strict';

var chai = require('chai');
var chaihttp = require('chai-http');
var expect = chai.expect;
chai.use(chaihttp);
var mongoose = require('mongoose');
var User = require('../models/User.js');

// point to db
process.env.MONGOLAB_URI = 'mongodb://localhost/user_development';

// start server
require('../server.js');

// Tests
describe('Authentication', function() {
  describe('with correct inputs', function() {
    var resToken;
    var newUser;
    beforeEach(function(done) {
      chai.request('localhost:3000')
        .post('/api/createuser')
        .send({username: 'jen', email: 'jen@example.com', password: 'foobar'})
        .end(function(err, res) {
          expect(err).to.eq(null);
          resToken = res.body.eat;
          User.findOne({username: 'jen'}, function(err, user){
            expect(err).to.eq(null);
            newUser = user;
            done();
          });
        });
    });
    afterEach(function(done) {
      mongoose.connection.db.dropDatabase(function(){done();});
    });

    describe('POST /createuser', function() {
      it('does not allow duplicate users to be created', function(ready) {
        chai.request('localhost:3000')
          .post('/api/createuser')
          .send({username: 'jen2', email: 'jen@example.com', password: 'foobar2'})
          .end(function(err, res){
            expect(err).to.eq(null);
            expect(res.body.msg).to.eq('email has already been used');
            ready();
          });
      });
      it('creates a new user per the inputs', function(done) {
        expect(newUser.username).to.eq('jen');
        expect(newUser.basic.email).to.eq('jen@example.com');
        expect(newUser.basic.email).to.exist;              // jshint ignore:line
        expect(typeof newUser.eat).to.eq('number');
        expect(Object.prototype.toString.call(newUser.eat)).to.eq('[object Number]');
        done();
      });
      it('returns an eat', function(done) {
        expect(typeof resToken).to.eq('string');
        done();
      });
    });

    describe('GET /signin', function() {
      it('returns an eat', function(done) {
        chai.request('localhost:3000')
          .get('/api/signin')
          .auth('jen@example.com', 'foobar')
          .end(function(err, res) {
            var resEat = res.body.eat;
            expect(err).to.eq(null);
            expect(typeof resEat).to.eq('string');
            done();
          });
      });
    });

    describe('GET /signout', function() {
      it('invalidates the eat', function(done) {
        chai.request('localhost:3000')
          .get('/api/signout/' + resToken)
          .end(function(err, res) {
            expect(err).to.eq(null);
            expect(res.body.msg).to.eq('you have been signed out');
            done();
          });
      });
    });
  });
});

'use strict';

var chai = require('chai');               // needed for should/expect assertions
var chaiHttp = require('chai-http');      // needed for requests
var expect = chai.expect;
chai.use(chaiHttp);                       // tell chai to use chai-http
var mongoose = require('mongoose');       // needed to working with server
var User = require('../models/User.js');  // bring in model constructor to test

// Point to db via
process.env.MONGOLAB_URI = 'mongodb://localhost/user_development';

// Start server for testing
require('../server.js');

describe('Users', function() {
  describe('with existing user', function() {
    // Setup Database before each describe block
    var resToken;
    var newUser;
    before(function(done) {
      chai.request('localhost:3000')
        .post('/api/createuser')
        .send({username: 'joe', email: 'joe@example.com', password: 'foobar'})
        .end(function(err, res) {
          expect(err).to.eq(null);
          resToken = res.body.eat;
          User.findOne({username: 'joe'}, function(err, user){
            expect(err).to.eq(null);
            newUser = user;
            done();
          });
        });
    });
    // Drop database after each run
    after(function(done) {
      mongoose.connection.db.dropDatabase(function(){done();});
    });

    describe('GET /spi/users/joe for a specific user', function() {
      var joe;
      console.log('RESTOKEN IS: ', resToken);
      before(function(done) {
        chai.request('localhost:3000')
          .get('/api/users/joe')
          .send({eat: resToken})
          .end(function(err, res) {
            joe = res.body[0];
            done();
          });
      });
      it('returns the user', function() {
        expect(typeof joe).to.eq('object');
      });
      it('returns the user\'s username', function(){
        expect(joe.username).to.eql('joe');
      });
      it('returns the user\'s  email', function() {
        expect(joe.basic.email).to.eql('joe@example.com');
      });
      it('returns the user\'s  passtoken', function() {
        expect(typeof joe.basic.password).to.eq('string');
      });
    });

    describe('PUT', function() {
      var response;
      before(function(done) {
        console.log('NEW USER THAT WE NEED TO USE: ', newUser);
        chai.request('localhost:3000')
          .put('/api/users/' + newUser._id)
          .send({email: 'joe@newemail.com'})
          .send({eat: resToken})
          .end(function(err, res) {
            response = res.body;
            done();
          });
      });
      it('updates the user', function() {
        expect(response.msg).to.eq('user updated');
      });
    });

    describe('DELETE', function() {
      var response;
      before(function(done) {
        chai.request('localhost:3000')
          .del('/api/users/' + newUser._id)
          .send({eat: resToken})
          .end(function(err, res) {
            response = res.body;
            done();
          });
      });
      // Having my POST test above triggers this to be wrong... how fix?
      it('deletes the user from db', function(done) {
        User.find({'_id': newUser.id}, function(err, user) {
          expect(user).to.eql([]);
          done();
        });
      });
      it('responds with the message "user removed"', function() {
        expect(response.msg).to.eql('user removed');
      });
    });
  });


  describe('with NON-existing user', function() {
    describe('GET /api/notauser', function() {
      it('returns a message to please sign in', function(done) {
        chai.request('localhost:3000')
          .get('/api/users/notauser')
          .end(function(err, res) {
            expect(err).to.eql(null);
            expect(res.body.msg).to.eql('please sign in to do that');
            done();
          });
      });
    });
    describe('PUT', function() {
      it('returns an auth error message in the body', function(done) {
        chai.request('localhost:3000')
          .put('/api/users/123456789wrong')
          .send({username: 'thiswillfail'})
          .end(function(err, res) {
            expect(err).to.eq(null);
            expect(res.body.msg).to.eq('please sign in to do that');
            done();
          });
      });
    });
    describe('DELETE', function() {
      it('returns an auth error message in the body', function(done) {
        chai.request('localhost:3000')
          .del('/api/users/123456789wrong')
          .end(function(err, res) {
            expect(err).to.eq(null);
            expect(res.body.msg).to.eq('please sign in to do that');
            done();
          });
      });
    });
  });
});




























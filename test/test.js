const assert = require('assert');
const request = require("request");
const host = "http://localhost:3000";
const dotenv = require('dotenv').config({path:'./config.env'});
const jwt = require('jsonwebtoken');

const user = {
  firstname: 'Fred',
  lastname: 'Flintstone',
  clearance: 9,
  // token: jwt.sign({ user: this }, process.env.JWT_SECRET, { expiresIn: '1m' })
}

describe("Run All Tests", function(){
  before(function(done){
    jwt.sign({ user: user }, process.env.JWT_SECRET, { expiresIn: '1m' }, function(err, token){
      user.token = token;
      done();
    });
  });

  describe("Home Page", function() {
    it("Route Accessed OK", function(done) {
      request.get(host, function(err, res){
        assert.equal(res.statusCode, 200);
        done();
      });
    });
  });
  
  describe("Sessions Page", function() {
    it("Route Accessed OK", function(done) {
      request.get(`${host}/sessions`, function(err, res){
        assert.equal(res.statusCode, 200);
        done();
      });
    });
  });
  
  describe("Topic Bank Page", function() {
    it("Route Accessed OK", function(done) {
      request.get(`${host}/topics`, function(err, res){
        assert.equal(res.statusCode, 200);
        done();
      });
    });
  
    it("Unauthorised Get Topics", function(done) {
      request.get(`${host}/getTopics`, function(err, res, body){
        assert.equal(res.statusCode, 400);
        done();
      });
    });
  
    it("Authorised Get Topics", function(done) {
      const options = {
        headers: {
          // 'Admission': true,
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        }
      }
      
      request(`${host}/getTopics`, options, function(err, res){
        assert.equal(res.statusCode, 200);
        done();
      });
    });
  });
})
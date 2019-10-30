const assert = require('chai').assert;
const request = require('request');
const host = "http://localhost:3000";
const dotenv = require('dotenv').config({path:'../../config.env'});
const jwt = require('jsonwebtoken');

const users = {
  nine: {
    id: 1,
    firstname: 'Admin',
    lastname: 'Istrator',
    clearance: 9
  },
  five: {
    id: 2,
    firstname: 'Test',
    lastname: 'Subject',
    clearance: 5
  },
  one: {
    firstname: 'David',
    lastname: 'Egbue',
    email: 'd.master700@gmail.com',
    username: 'david',
    password1: 'davido607',
    password2: 'davido607',
    subscribe: false
  }
}

const options = {
  standard: { headers: { 'Content-Type': 'application/json' } },
  strong: (user) => ({
    headers: {
      'Authorization': `Bearer ${user.token}`,
      'Content-Type': 'application/json',
    }
  }),
  strongCRUD: (user) => ({
    headers: { 'Authorization': `Bearer ${user.token}` }
  }),
  weak: {
    headers: {
      'Authorization': process.env.AUTH_KEY,
      'Content-Type': 'application/json',
    }
  }
}

module.exports = {
  assert,
  request,
  host,
  jwt,
  users,
  options
}
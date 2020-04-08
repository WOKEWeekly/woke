const { assert, jwt, request, HEADERS } = require('./configuration/constants.js');
const { TEST_USERS } = require('./configuration/data.js');

const superuser = TEST_USERS.NINE;

let USER_ID = 1;

describe("Users Tests", function() {
  this.slow(10000);
  
  before(function(done){
    jwt.sign({ user: superuser }, process.env.JWT_SECRET, { expiresIn: '1m' }, function(err, token){
      superuser.token = token;
      done();
    });
  });

  /** Test retrieval of all users */
  describe("Read", function() {
    it("Get all users", function(done) {
      request({
        url: `/api/v1/users`,
        method: 'GET',
        headers: HEADERS.TOKEN(superuser),
        done,
        onSuccess: ({status, data}) => {
          assert.equal(status, 200);
          assert.isArray(data);
        }
      });
    });

    it("Get single user", function(done) {
      request({
        url: `/api/v1/users/${USER_ID}`,
        method: 'GET',
        headers: HEADERS.KEY,
        done,
        onSuccess: ({status, data}) => {
          assert.equal(status, 200);
          assert.isObject(data);
        }
      });
    });
  });


  /** Test updating the user */
  describe("Update", function() {
    xit("Change user clearance", function(done) {
      request({
        url: `/api/v1/users/${USER_ID}/clearance/5`,
        method: 'PUT',
        body: JSON.stringify(TEST_TOPICS.UPDATED),
        headers: HEADERS.TOKEN(superuser),
        done,
        onSuccess: ({status}) => {
          assert.equal(status, 200);
        }
      });
    });
  });
});
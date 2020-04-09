const { assert, jwt, request, HEADERS } = require('./configuration/constants.js');
const { TEST_USERS } = require('./configuration/data.js');

const superuser = TEST_USERS.NINE;

let PAGE_NAME = 'about';

describe("Page Tests", function() {
  this.slow(10000);
  
  before(function(done){
    jwt.sign({ user: superuser }, process.env.JWT_SECRET, { expiresIn: '1m' }, function(err, token){
      superuser.token = token;
      done();
    });
  });

  /** Test updating the user */
  describe("Update", function() {
    xit("Update page", function(done) {
      request({
        url: `/api/v1/pages`,
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
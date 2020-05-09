const { assert, request, HEADERS } = require('./configuration/constants.js');
const { TEST_USERS } = require('./configuration/data.js');

const superuser = TEST_USERS.NINE;

const PAGE_NAME = 'about';

describe('Page Tests', function () {
  this.slow(10000);

  /** Test updating the user */
  describe('Update', function () {
    it('Update page', function (done) {
      request({
        url: `/api/v1/pages`,
        method: 'PUT',
        body: JSON.stringify({
          page: PAGE_NAME,
          text: 'This is an updated page through service tests.',
        }),
        headers: HEADERS.TOKEN(superuser),
        done,
        onSuccess: ({ status }) => {
          assert.equal(status, 200);
        },
      });
    });
  });
});

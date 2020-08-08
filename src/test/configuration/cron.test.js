const { assert, request, HEADERS } = require('./configuration');
const { TEST_ARTICLES, TEST_USERS } = require('./configuration/data.js');

/** Test creating a new article */
describe('Create', function () {
  it('Add article', function (done) {
    request({
      url: `/api/v1/articles`,
      method: 'POST',
      body: JSON.stringify({
        article: TEST_ARTICLES.CREATED,
        isPublish: true
      }),
      headers: HEADERS.TOKEN(superuser),
      done,
      onSuccess: ({ status, data }) => {
        assert.equal(status, 201);
        assert.hasAllKeys(data, ['id']);
        ARTICLE_ID = data.id;
      }
    });
  });
});
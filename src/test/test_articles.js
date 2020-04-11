const { assert, jwt, request, HEADERS } = require('./configuration/constants.js');
const { TEST_ARTICLES, TEST_USERS } = require('./configuration/data.js');

const superuser = TEST_USERS.NINE;

let ARTICLE_ID = 0;

describe("Article Tests", function() {
  this.slow(10000);
  
  before(function(done){
    jwt.sign({ user: superuser }, process.env.JWT_SECRET, { expiresIn: '1m' }, function(err, token){
      superuser.token = token;
      done();
    });
  });

  /** Test creating a new article */
  describe("Create", function() {
    it("Add article", function(done) {
      request({
        url: `/api/v1/articles`,
        method: 'POST',
        body: JSON.stringify(TEST_ARTICLES.CREATED),
        headers: HEADERS.TOKEN(superuser),
        done,
        onSuccess: ({status, data}) => {
          assert.equal(status, 201);
          assert.hasAllKeys(data, ['id']);
          ARTICLE_ID = data.id;
        }
      });
    });
  });

  /** Test retrieval of all articles */
  describe("Read", function() {
    it("Get all articles", function(done) {
      request({
        url: `/api/v1/articles`,
        method: 'GET',
        headers: HEADERS.TOKEN(superuser),
        done,
        onSuccess: ({status, data}) => {
          assert.equal(status, 200);
          assert.isArray(data);
        }
      });
    });

    it("Get only published articles", function(done) {
      request({
        url: `/api/v1/articles/published`,
        method: 'GET',
        headers: HEADERS.KEY,
        done,
        onSuccess: ({status, data}) => {
          assert.equal(status, 200);
          assert.isArray(data);
          data.forEach(article => {
            assert.equal(article.status, 'PUBLISHED');
          });
        }
      });
    });

    it("Get single article", function(done) {
      request({
        url: `/api/v1/articles/${ARTICLE_ID}`,
        method: 'GET',
        headers: HEADERS.KEY,
        done,
        onSuccess: ({status, data}) => {
          assert.equal(status, 200);
          assert.isObject(data);
        }
      });
    });

    it("Attempt get single article with invalid ID", function(done) {
      request({
        url: `/api/v1/articles/0`,
        method: 'GET',
        headers: HEADERS.KEY,
        done,
        onError: ({status}) => {
          assert.equal(status, 404);
        }
      });
    });
  });


  /** Test updating the article */
  describe("Update", function() {
    it("Update article without image change", function(done) {
      request({
        url: `/api/v1/articles/${ARTICLE_ID}`,
        method: 'PUT',
        body: JSON.stringify({
          article: TEST_ARTICLES.UPDATED,
          changed: false
        }),
        headers: HEADERS.TOKEN(superuser),
        done,
        onSuccess: ({status, data}) => {
          assert.equal(status, 200);
          assert.hasAllKeys(data, ['slug']);
        }
      });
    });

    it("Update article with image change", function(done) {
      request({
        url: `/api/v1/articles/${ARTICLE_ID}`,
        method: 'PUT',
        body: JSON.stringify({
          article: TEST_ARTICLES.UPDATED,
          changed: true
        }),
        headers: HEADERS.TOKEN(superuser),
        done,
        onSuccess: ({status, data}) => {
          assert.equal(status, 200);
          assert.hasAllKeys(data, ['slug']);
        }
      });
    });

    it("Attempt update article with invalid ID", function(done) {
      request({
        url: `/api/v1/articles/0`,
        method: 'PUT',
        body: JSON.stringify({
          article: TEST_ARTICLES.UPDATED,
          changed: true
        }),
        headers: HEADERS.TOKEN(superuser),
        done,
        onError: ({status}) => {
          assert.equal(status, 404);
        }
      });
    });
  });

  /** Test deleting the article */
  describe("Delete", function() {
    it("Delete article", function(done) {
      request({
        url: `/api/v1/articles/${ARTICLE_ID}`,
        method: 'DELETE',
        headers: HEADERS.TOKEN(superuser),
        done,
        onSuccess: ({status}) => {
          assert.equal(status, 204);
        }
      });
    });

    it("Attempt delete article with invalid ID", function(done) {
      request({
        url: `/api/v1/articles/0`,
        method: 'DELETE',
        headers: HEADERS.TOKEN(superuser),
        done,
        onError: ({status}) => {
          assert.equal(status, 404);
        }
      });
    });
  });
});
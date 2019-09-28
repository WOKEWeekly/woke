const { assert, jwt, host, options, request, users } = require('./_config.js');
const fs = require('fs');

const superuser = users.nine;

const review = {
  referee: 'Oye Abraham',
  position: 'Founder of T4C',
  rating: 5,
  description: 'We love #WOKEWeekly',
  image: fs.createReadStream('static/images/test/addSession.jpg'),
};

const review2 = {
  referee: 'Oye Isaiah',
  position: 'Founder of T5C',
  rating: 4,
  description: 'We like #WOKEWeekly',
  image: fs.createReadStream('static/images/test/updateSession.png'),
};

const review3 = {
  referee: 'Oye Abrahamaic',
  position: 'Founder of T4C',
  rating: 5,
  description: 'We love #WOKEWeekly',
};

describe("Reviews Page", function() {
  before(function(done){
    jwt.sign({ user: superuser }, process.env.JWT_SECRET, { expiresIn: '1m' }, function(err, token){
      superuser.token = token;
      done();
    });
  });

  it("Route Accessed OK", function(done) {
    request.get(`${host}/reviews`, function(err, res){
      assert.equal(res.statusCode, 200);
      done();
    });
  });

  it("Get Reviews", function(done) {
    request.get(`${host}/getReviews`, options.weak, function(err, res){
      assert.equal(res.statusCode, 200);
      done();
    });
  });

  it("Add Review", function(done) {
    const data = {
      review: JSON.stringify(review),
      changed: 'true',
      file: review.image
    }

    request({
      url: `${host}/addReview`,
      method: 'POST',
      formData: data,
      ...options.strongCRUD(superuser)
    }, function(err, res, body){
      assert.equal(res.statusCode, 200, JSON.parse(body).message);
      Object.assign(review, JSON.parse(body));
      review2.id = review3.id = JSON.parse(body).id;
      done();
    });
  });

  it("Update Review With Image", function(done) {
    const data = {
      reviews: JSON.stringify({review1: review, review2}),
      changed: 'true',
      file: review2.image
    };

    request({
      url: `${host}/updateReview`,
      method: 'PUT',
      formData: data,
      ...options.strongCRUD(superuser)
    }, function(err, res, body){
      assert.equal(res.statusCode, 200, JSON.parse(body).message);
      Object.assign(review2, JSON.parse(body));
      done();
    });
  });

  it("Update Review Without Image", function(done) {
    const data = {
      reviews: JSON.stringify({review1: review2, review2: review3}),
      changed: 'false'
    };

    request({
      url: `${host}/updateReview`,
      method: 'PUT',
      formData: data,
      ...options.strongCRUD(superuser)
    }, function(err, res, body){
      assert.equal(res.statusCode, 200, JSON.parse(body).message);
      Object.assign(review3, JSON.parse(body));
      done();
    });
  });

  it("Delete Review", function(done) {
    request({
      url: `${host}/deleteReview`,
      method: 'DELETE',
      body: JSON.stringify(review3),
      ...options.strong(superuser)
    }, function(err, res){
      assert.equal(res.statusCode, 200, JSON.parse(res.body).message);
      done();
    });
  });

  it("Add Review Without Image", function(done) {
    const data = {
      review: JSON.stringify(review)
    }

    request({
      url: `${host}/addReview`,
      method: 'POST',
      formData: data,
      ...options.strongCRUD(superuser)
    }, function(err, res, body){
      assert.equal(res.statusCode, 200, JSON.parse(body).message);
      Object.assign(review, JSON.parse(body));
      review2.id = review3.id = JSON.parse(body).id;
      done();
    });
  });

  it("Delete Review Without Image", function(done) {
    request({
      url: `${host}/deleteReview`,
      method: 'DELETE',
      body: JSON.stringify(review),
      ...options.strong(superuser)
    }, function(err, res){
      assert.equal(res.statusCode, 200, JSON.parse(res.body).message);
      done();
    });
  });
});
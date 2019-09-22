
const { assert, jwt, host, options, request, users } = require('./_config.js');
const superuser = users.nine;

const topic = {
  headline: 'Title',
  category: 'Philosophy & Ethics',
  question: 'Is this the topic question?',
  description: 'This is the topic description',
  type: 'Debate',
  polarity: true,
  option1: 'Yes',
  option2: 'No',
  userId: superuser.id
};

const topic2 = {
  headline: 'Changed',
  category: 'Academia',
  question: 'This isn\'t the topic question, is it?',
  description: 'The topic has been changed.',
  type: 'Discussion',
  polarity: false,
  option1: null,
  option2: null
}

describe.skip("Topic Bank Page", function() {
  before(function(done){
    jwt.sign({ user: superuser }, process.env.JWT_SECRET, { expiresIn: '1m' }, function(err, token){
      superuser.token = token;
      done();
    });
  });

  it("Route Accessed OK", function(done) {
    request.get(`${host}/topics`, function(err, res){
      assert.equal(res.statusCode, 200);
      done();
    });
  });

  it("Unauthorised Get Topics", function(done) {
    request.get(`${host}/getTopics`, options.weak, function(err, res){
      assert.notEqual(res.statusCode, 200, JSON.parse(res.body).message);
      done();
    });
  });

  it("Authorised Get Topics", function(done) {
    request.get(`${host}/getTopics`, options.strong(superuser), function(err, res){
      assert.equal(res.statusCode, 200, JSON.parse(res.body).message);
      done();
    });
  });

  it("Add Topic", function(done) {
    request({
      url: `${host}/addTopic`,
      method: 'POST',
      body: JSON.stringify(topic),
      ...options.strong(superuser)
    }, function(err, res, body){
      assert.equal(res.statusCode, 200, JSON.parse(res.body).message);
      topic.id = topic2.id = body;
      done();
    });
  });

  it("Update Topic", function(done) {
    request({
      url: `${host}/updateTopic`,
      method: 'PUT',
      body: JSON.stringify(topic2),
      ...options.strong(superuser)
    }, function(err, res){
      assert.equal(res.statusCode, 200, JSON.parse(res.body).message);
      done();
    });
  });

  it("Delete Topic", function(done) {
    request({
      url: `${host}/deleteTopic`,
      method: 'DELETE',
      body: JSON.stringify(topic),
      ...options.strong(superuser)
    }, function(err, res){
      assert.equal(res.statusCode, 200, JSON.parse(res.body).message);
      done();
    });
  });
});
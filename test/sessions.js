const { assert, jwt, host, options, request, users } = require('./_config.js');
const fs = require('fs');

const superuser = users.nine;

const session = {
  title: 'Title',
  dateHeld: '2019-09-21',
  description: 'This is the session description',
  image: fs.createReadStream('static/images/test/addSession.jpg')
};

const session2 = {
  title: 'New Title',
  dateHeld: '2019-09-22',
  description: 'This is the session description after updating.',
  image: fs.createReadStream('static/images/test/updateSession.png')
};

const session3 = {
  title: 'Another New Title',
  dateHeld: '2019-09-22',
  description: 'This is the session description after updating again without an image.'
};

describe("Sessions Page", function() {
  before(function(done){
    jwt.sign({ user: superuser }, process.env.JWT_SECRET, { expiresIn: '1m' }, function(err, token){
      superuser.token = token;
      done();
    });
  });

  it("Route Accessed OK", function(done) {
    request.get(`${host}/sessions`, function(err, res){
      assert.equal(res.statusCode, 200);
      done();
    });
  });

  it("Get Sessions", function(done) {
    request.get(`${host}/getSessions`, options.weak, function(err, res){
      assert.equal(res.statusCode, 200);
      done();
    });
  });

  it("Add Session", function(done) {
    const data = {
      session: JSON.stringify(session),
      changed: 'true',
      file: session.image
    }

    request({
      url: `${host}/addSession`,
      method: 'POST',
      formData: data,
      ...options.strongCRUD(superuser)
    }, function(err, res, body){
      assert.equal(res.statusCode, 200, JSON.parse(body).message);
      Object.assign(session, JSON.parse(body));
      session2.id = session3.id = JSON.parse(body).id;
      done();
    });
  });

  it("Update Session: Change", function(done) {
    const data = {
      sessions: JSON.stringify({session1: session, session2}),
      changed: 'true',
      file: session2.image
    };

    request({
      url: `${host}/updateSession`,
      method: 'PUT',
      formData: data,
      ...options.strongCRUD(superuser)
    }, function(err, res, body){
      assert.equal(res.statusCode, 200, JSON.parse(body).message);
      Object.assign(session2, JSON.parse(body));
      done();
    });
  });

  it("Update Session: No Change", function(done) {
    const data = {
      sessions: JSON.stringify({session1: session2, session2: session3}),
      changed: 'false'
    };

    request({
      url: `${host}/updateSession`,
      method: 'PUT',
      formData: data,
      ...options.strongCRUD(superuser)
    }, function(err, res, body){
      assert.equal(res.statusCode, 200, JSON.parse(body).message);
      Object.assign(session3, JSON.parse(body));
      done();
    });
  });

  it("Delete Session", function(done) {
    request({
      url: `${host}/deleteSession`,
      method: 'DELETE',
      body: JSON.stringify(session3),
      ...options.strong(superuser)
    }, function(err, res){
      assert.equal(res.statusCode, 200, JSON.parse(res.body).message);
      done();
    });
  });
});
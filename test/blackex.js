const { assert, jwt, host, options, request, users } = require('./_config.js');
const fs = require('fs');

const superuser = users.nine;

const candidate = {
  id: 0,
  name: 'John Smith',
  birthday: '1996-09-24',
  description: 'This is the candidate description',
  occupation: 'Investment Banker',
  image: fs.createReadStream('static/images/test/addSession.jpg'),
  ethnicity: JSON.stringify(['Jamaican', 'Zimbabwean']),
  socials: JSON.stringify({ twitter: 'jsmith' }),
  authorId: superuser.id
};

const candidate2 = {
  id: 0,
  name: 'Nasyah Bandoh',
  birthday: '1996-09-25',
  description: 'This is the candidate description',
  occupation: 'Historian',
  image: fs.createReadStream('static/images/test/updateSession.png'),
  ethnicity: JSON.stringify(['Ghanaian']),
  socials: JSON.stringify({ twitter: 'nbandoh' }),
  authorId: superuser.id
};

const candidate3 = {
  id: 0,
  name: 'Brenda Ukah',
  birthday: '1996-09-26',
  description: 'This is the candidate description',
  occupation: 'Model',
  ethnicity: JSON.stringify(['Nigerian']),
  socials: JSON.stringify({ twitter: 'bukah' }),
  authorId: superuser.id
};

describe("#BlackExcellence Page", function() {
  before(function(done){
    jwt.sign({ user: superuser }, process.env.JWT_SECRET, { expiresIn: '1m' }, function(err, token){
      superuser.token = token;
      done();
    });
  });

  it("Route Accessed OK", function(done) {
    request.get(`${host}/blackexcellence`, function(err, res){
      assert.equal(res.statusCode, 200);
      done();
    });
  });

  it("Get Candidates", function(done) {
    request.get(`${host}/getCandidates`, options.weak, function(err, res){
      assert.equal(res.statusCode, 200);
      done();
    });
  });

  it("Add Candidate", function(done) {
    const data = {
      candidate: JSON.stringify(candidate),
      changed: 'true',
      file: candidate.image
    }

    request({
      url: `${host}/addCandidate`,
      method: 'POST',
      formData: data,
      ...options.strongCRUD(superuser)
    }, function(err, res, body){
      assert.equal(res.statusCode, 200, JSON.parse(body).message);
      Object.assign(candidate, JSON.parse(body));
      done();
    });
  });

  it("Update Candidate: Change", function(done) {
    const data = {
      candidates: JSON.stringify({candidate1: candidate, candidate2}),
      changed: 'true',
      file: candidate2.image
    };

    request({
      url: `${host}/updateCandidate`,
      method: 'PUT',
      formData: data,
      ...options.strongCRUD(superuser)
    }, function(err, res, body){
      assert.equal(res.statusCode, 200, JSON.parse(body).message);
      Object.assign(candidate2, JSON.parse(body));
      done();
    });
  });

  it("Update Candidate: No Change", function(done) {
    const data = {
      candidates: JSON.stringify({candidate1: candidate2, candidate2: candidate3}),
      changed: 'false'
    };

    request({
      url: `${host}/updateCandidate`,
      method: 'PUT',
      formData: data,
      ...options.strongCRUD(superuser)
    }, function(err, res, body){
      assert.equal(res.statusCode, 200, JSON.parse(body).message);
      Object.assign(candidate3, JSON.parse(body));
      done();
    });
  });

  it("Delete Candidate", function(done) {
    request({
      url: `${host}/deleteCandidate`,
      method: 'DELETE',
      body: JSON.stringify(candidate3),
      ...options.strong(superuser)
    }, function(err, res){
      assert.equal(res.statusCode, 200, JSON.parse(res.body).message);
      done();
    });
  });
});
const { assert, host, options, request } = require('./_config.js');

describe("Sessions Page", function() {
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
});
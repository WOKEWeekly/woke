const { assert, host, request } = require('./_config.js');

describe("Home Page", function() {
  it("Route Accessed OK", function(done) {
    request.get(host, function(err, res){
      assert.equal(res.statusCode, 200);
      done();
    });
  });
});
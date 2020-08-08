const { startTestServer } = require('../../server');

before(function (done) {
  startTestServer(done);
});

// Stop server / return control to terminal after running tests.
after(function () {
  setTimeout(() => process.exit(0), 2000);
});

describe('Send Due General Tasks', function () {
  it('Add article', function (done) {
    const trello = require('../../private/cron/trello');
    trello.notifyDueExecTasks();
    done();
  });
});

const schedule = require('node-schedule');
const slack = require('./slack.js');

module.exports = function(conn){

  /** Notify executives of team member birthdays */
  schedule.scheduleJob({ hour: 9 }, function(){
    conn.query("SELECT * FROM team WHERE DATE_FORMAT(birthday,'%m-%d') = DATE_FORMAT(CURDATE(),'%m-%d')", function (err, result) {
      if (err) return console.log(err.toString());
      if (result.length === 0) return console.log("Birthdays: It's no one's birthday today.");

      for(let member of result) {
        slack.sendBirthdayMessage(member);
      }

      console.log("Birthday: messages sent.");
    });
  });
}

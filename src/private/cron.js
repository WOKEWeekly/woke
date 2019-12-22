const schedule = require('node-schedule');
const slack = require('./slack.js');

module.exports = function(conn){

  /** Notify executives of team member birthdays */
  schedule.scheduleJob({ hour: 10, minute: 15 }, function(){
    conn.query("SELECT * FROM team WHERE DATE_FORMAT(birthday,'%m-%d') = DATE_FORMAT(CURDATE(),'%m-%d')", function (err, result) {
      if (err) return console.log(err.toString());
      if (!result.length) return console.log("Birthdays: It's no one's birthday today.");

      for(let member of result) {
        slack.sendBirthdayMessage(member);
        console.log(`Birthday message sent for ${member.firstname} ${member.lastname}.`);
      }

    });
  });
}

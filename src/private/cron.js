const schedule = require('node-schedule');
const slack = require('./slack.js');

const time = { hour: 9, minute: 0 };
const sql = "SELECT * FROM team WHERE DATE_FORMAT(birthday,'%m-%d') = DATE_FORMAT(CURDATE(),'%m-%d')";

// const time = { second: 0 };
// const sql = "SELECT * FROM team LIMIT 1";

module.exports = function(conn){

  /** Notify executives of team member birthdays */
  schedule.scheduleJob({ time }, function(){
    conn.query(sql, function (err, result) {
      if (err) return console.log(err.toString());
      if (!result.length) return console.log("Birthdays: It's no one's birthday today.");

      for(let member of result) {
        slack.sendBirthdayMessage(member);
        console.log(`Birthday message sent for ${member.firstname} ${member.lastname}.`);
      }

    });
  });
}

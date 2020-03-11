const schedule = require('node-schedule');
const slack = require('./slack.js');

const testInterval = { second: 0 };
const birthdayReminderTime = { hour: 7, minute: 0 };
const sessionReminderTime = { hour: 10, minute: 0 };

module.exports = function(conn){

  /** Notify General Slack channel of team member birthdays at 7:00am */
  schedule.scheduleJob(birthdayReminderTime, function(){
    const sql = "SELECT * FROM team WHERE DATE_FORMAT(birthday,'%m-%d') = DATE_FORMAT(CURDATE(),'%m-%d')";
    conn.query(sql, function (err, result) {
      if (err) return console.log(err.toString());
      if (!result.length) return console.log("Birthdays: It's no one's birthday today.");

      for (let member of result) {
        slack.sendBirthdayMessage(member);
        console.log(`Birthday message sent for ${member.firstname} ${member.lastname}.`);
      }
    });
  });

  /** Notify General Slack channel of sessions occurring on the current day at 10:00am */
  schedule.scheduleJob(sessionReminderTime, function(){
    const sql = "SELECT * FROM sessions WHERE dateheld = CURRENT_DATE()";
    conn.query(sql, function (err, result) {
      if (err) return console.log(err.toString());
      if (!result.length) return console.log("Session Reminders: There are no sessions taking place today.");

      for (let session of result) {
        slack.sendSessionReminder(session);
        console.log(`Session reminder sent for ${session.title}.`);
      }
    });
  });
}

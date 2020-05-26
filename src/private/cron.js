const schedule = require('node-schedule');

const slack = require('./slack.js');

// const testInterval = { second: 0 };
const birthdayReminderTime = { hour: 7, minute: 0 };
const sessionReminderTime = { hour: 10, minute: 0 };

module.exports = function (conn) {
  /** Notify General Slack channel of team member birthdays at 7:00am */
  schedule.scheduleJob(birthdayReminderTime, function () {
    const sql =
      "SELECT * FROM members WHERE DATE_FORMAT(birthday,'%m-%d') = DATE_FORMAT(CURDATE(),'%m-%d')";
    conn.query(sql, function (err, result) {
      if (err) return console.error(err.toString());
      if (!result.length)
        return console.info("Birthdays: It's no one's birthday today.");

      for (let member of result) {
        slack.sendBirthdayMessage(member);
        console.info(
          `Birthday message sent for ${member.firstname} ${member.lastname}.`
        );
      }
    });
  });

  /** Notify General Slack channel of sessions occurring on the current day at 10:00am */
  schedule.scheduleJob(sessionReminderTime, function () {
    const sql = 'SELECT * FROM sessions WHERE dateheld = CURRENT_DATE()';
    conn.query(sql, function (err, result) {
      if (err) return console.error(err.toString());
      if (!result.length)
        return console.info(
          'Session Reminders: There are no sessions taking place today.'
        );

      for (let session of result) {
        slack.sendSessionReminder(session);
        console.info(`Session reminder sent for ${session.title}.`);
      }
    });
  });
};

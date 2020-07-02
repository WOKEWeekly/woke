/* eslint-disable import/order */
const slack = require('./slack.js');
const knex = require('../singleton/knex').getKnex();

/** Notify General Slack channel of team member birthdays */
exports.notifyMemberBirthday = () => {
  const query = knex
    .select()
    .from('members')
    .whereRaw("DATE_FORMAT(birthday,'%m-%d') = DATE_FORMAT(CURDATE(),'%m-%d')");
  query.asCallback(function (err, result) {
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
};

/** Notify General Slack channel of sessions occurring on the current day */
exports.notifySessionToday = () => {
  const query = knex
    .select()
    .from('sessions')
    .whereRaw('dateHeld = CURRENT_DATE()');
  query.asCallback(function (err, result) {
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
};

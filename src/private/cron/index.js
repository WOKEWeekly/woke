const fetch = require('node-fetch');
const schedule = require('node-schedule');

const slack = require('./slack.js');

const knex = require('../singleton/knex').getKnex();

const isDev = process.env.NODE_ENV !== 'production';

const testInterval = '*/5 * * * * *';

const isBirthdayTest = isDev && false;
const isSessionTest = isDev && false;
const isTrelloTaskTest = isDev && false;
const isUncaptionedCardTest = isDev && false;

const INTERVALS = {
  // Everyday at 9:00am
  BIRTHDAYS: '0 9 * * *',

  // Everyday at 10:00am
  SESSIONS: '0 10 * * *',

  // Every Monday at 7:00am
  TRELLO_TASKS: '0 7 * * 1',

  // Every weekday at 9:00am
  UNCAPTIONED_CARDS: '0 9 * * 1-5'
};

module.exports = () => {
  schedule.scheduleJob(
    isBirthdayTest ? testInterval : INTERVALS.BIRTHDAYS,
    notifyMemberBirthday
  );

  schedule.scheduleJob(
    isSessionTest ? testInterval : INTERVALS.SESSIONS,
    notifySessionToday
  );

  /** Notify General Slack channel of to accelerate Trello tasks */
  // schedule.scheduleJob(
  //   isTrelloTaskTest ? testInterval : trelloWeeklyReminderTime,
  //   function () {
  //     slack.sendTrelloReminder();
  //     console.info(`Trello weekly reminder sent.`);
  //   }
  // );

  /** Notify General Slack channel of to accelerate Trello tasks */
  schedule.scheduleJob(
    isUncaptionedCardTest ? testInterval : INTERVALS.UNCAPTIONED_CARDS,
    notifyUncaptionedCards
  );
};

/** Notify General Slack channel of team member birthdays */
const notifyMemberBirthday = () => {
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
const notifySessionToday = () => {
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

/** Notify Social Media Slack channel of uncaptioned cards */
const notifyUncaptionedCards = () => {
  const id = 'qKuY4vcl';
  const key = process.env.TRELLO_API_KEY;
  const token = process.env.TRELLO_TOKEN;
  fetch(
    `https://api.trello.com/1/boards/${id}/cards?key=${key}&token=${token}`,
    { method: 'GET' }
  )
    .then((res) => res.json())
    .then((cards) => {
      const uncaptionedCards = cards
        .map((card) => {
          const { name, desc, due } = card;
          const dueinMs = new Date(due).getTime();

          // If card has a due date, is due in the future
          // and doesn't already have a caption...
          if (due && dueinMs > Date.now() && !desc) {
            return { name, due };
          }
        })
        .filter((e) => e);

      if (uncaptionedCards.length) {
        slack.sendSocialMediaUncaptionedCards(uncaptionedCards);
      }
    })
    .catch((err) => console.error(err));
};

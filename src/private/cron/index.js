const async = require('async');
const fetch = require('node-fetch');
const schedule = require('node-schedule');

const slack = require('./slack.js');

const knex = require('../singleton/knex').getKnex();

const isDev = process.env.NODE_ENV !== 'production';
const TRELLO_API_KEY = process.env.TRELLO_API_KEY;
const TRELLO_TOKEN = process.env.TRELLO_TOKEN;
const queryParams = `key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`;

/** 5 second interval for test messages. */
const testInterval = '*/5 * * * * *';

/** Toggle to test each */
const isBirthdayTest = isDev && false;
const isSessionTest = isDev && false;
const isDueExecTaskTest = isDev && true;
const isPostsWithoutCaptionTest = isDev && false;

/** The Trello board IDs */
const BOARDS = {
  EXEC: 'cPCwhUI4',
  GENERAL: 'mbzVPEE6',
  SOCIAL_MEDIA: 'qKuY4vcl'
};

/** The intervals for each cron job */
const INTERVALS = {
  // Everyday at 8:00am
  BIRTHDAYS: '0 8 * * *',

  // Everyday at 10:00am
  SESSIONS: '0 10 * * *',

  // Everyday at 9:00am
  DUE_EXEC_TASKS: '0 7 * * 1',

  // Every weekday at 8:00am
  POSTS_WITHOUT_CAPTIONS: '0 8 * * 1-5'
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

  schedule.scheduleJob(
    isDueExecTaskTest ? testInterval : INTERVALS.DUE_EXEC_TASKS,
    notifyDueExecTasks
  );

  schedule.scheduleJob(
    isPostsWithoutCaptionTest ? testInterval : INTERVALS.POSTS_WITHOUT_CAPTIONS,
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

const notifyDueExecTasks = () => {
  getCardsFromTrelloBoard(BOARDS.EXEC, (cards) => {
    const seenMembers = {};
    const execTasks = cards
      .map((card) => {
        const { name, due, dueComplete, idMembers } = card;
        const dueInMs = new Date(due).getTime();

        // If card has a due date, was due in the past
        // and has not been completed...
        if (due && dueInMs < Date.now() && !dueComplete) {
          const members = idMembers.map((memberId) => {
            seenMembers[memberId] = '';
            return memberId;
          });

          return { name, due, members };
        }
      })
      .filter((e) => e);

    if (!execTasks.length) return;

    async.mapValues(
      seenMembers,
      function (value, id, callback) {
        getMemberByTrelloId(id, (name) => {
          const firstname = name.split(' ')[0];
          callback(null, firstname);
        });
      },
      function (err, memberMapping) {
        const execTasksWithMembers = execTasks.map((card) => {
          card.members = card.members.map((member) => {
            return memberMapping[member];
          });

          return card;
        });

        slack.sendDueExecTasks(execTasksWithMembers);
      }
    );
  });
};

/** Notify Social Media Slack channel of uncaptioned cards */
const notifyUncaptionedCards = () => {
  getCardsFromTrelloBoard(BOARDS.SOCIAL_MEDIA, (cards) => {
    const postWithoutCaptions = cards
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

    if (postWithoutCaptions.length) {
      slack.sendPostsWithoutCaptions(postWithoutCaptions);
    }
  });
};

const getCardsFromTrelloBoard = (boardId, callback) => {
  fetch(`https://api.trello.com/1/boards/${boardId}/cards?${queryParams}`, {
    method: 'GET'
  })
    .then((res) => res.json())
    .then((cards) => callback(cards))
    .catch((err) => console.error(err));
};

const getMemberByTrelloId = (memberId, callback) => {
  fetch(`https://api.trello.com/1/members/${memberId}?${queryParams}`, {
    method: 'GET'
  })
    .then((res) => res.json())
    .then(({ fullName }) => callback(fullName))
    .catch((err) => console.error(err));
};

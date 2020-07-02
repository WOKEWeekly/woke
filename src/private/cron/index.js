const schedule = require('node-schedule');

const database = require('./database');
const trello = require('./trello');

const isDev = process.env.NODE_ENV !== 'production';

/** 5 second interval for test messages. */
const testInterval = '*/5 * * * * *';

/** Toggle to test each */
const isBirthdayTest = isDev && false;
const isSessionTest = isDev && false;
const isDueExecTaskTest = isDev && true;
const isPostsWithoutCaptionTest = isDev && false;

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
    database.notifyMemberBirthday
  );

  schedule.scheduleJob(
    isSessionTest ? testInterval : INTERVALS.SESSIONS,
    database.notifySessionToday
  );

  schedule.scheduleJob(
    isDueExecTaskTest ? testInterval : INTERVALS.DUE_EXEC_TASKS,
    trello.notifyDueExecTasks
  );

  schedule.scheduleJob(
    isPostsWithoutCaptionTest ? testInterval : INTERVALS.POSTS_WITHOUT_CAPTIONS,
    trello.notifyUncaptionedCards
  );
};

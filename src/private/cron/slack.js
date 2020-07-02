const { WebClient } = require('@slack/web-api');
const { zDate, zString } = require('zavid-modules');
const inDev = process.env.NODE_ENV !== 'production';

const slack = new WebClient(process.env.SLACK_TOKEN);

const mySlackID = 'UDEMRRR8T';
const channels = {
  exec: 'exec',
  general: 'general',
  socialMedia: 'socialmedia'
};

exports.sendBirthdayMessage = async (member) => {
  const message = constructBirthdayMessage(member);
  await postMessage(message, channels.general);
};

exports.sendSessionReminder = async (session) => {
  const message = constructSessionReminderMessage(session);
  await postMessage(message, channels.general);
};

exports.sendDueExecTasks = async (cards) => {
  const message = constructDueExecTaskMessage(cards);
  await postMessage(message, channels.exec);
};

exports.sendPostsWithoutCaptions = async (cards) => {
  const message = constructSMUCMessage(cards);
  await postMessage(message, channels.socialMedia);
};

/**
 * Post a constructed message to the Slack channel.
 * @param {string} message - The message to be sent.
 * @param {string} channel - The ID of the channel to post to.
 * @returns {string} The sender function.
 */
const postMessage = (message, channel) => {
  if (inDev) channel = mySlackID;
  return slack.chat.postMessage({
    channel,
    username: '#WOKEWeekly',
    blocks: [{ type: 'section', text: { type: 'mrkdwn', text: message } }]
  });
};

/**
 * Constructs the birthday message to be sent.
 * @param {object} member - The details of the celebrating member.
 * @returns {string} The constructed message.
 */
const constructBirthdayMessage = (member) => {
  let pronoun, title;

  if (member.sex === 'M') {
    pronoun = 'his';
    title = 'king';
  } else if (member.sex === 'F') {
    pronoun = 'her';
    title = 'queen';
  } else {
    pronoun = 'their';
    title = 'buddy';
  }

  const intros = ['Shout out', 'Big love', 'More life', 'Best wishes'];

  const outros = [
    'Blessings! :heart:',
    'Keep being great! :muscle::skin-tone-5: :raised_hands::skin-tone-5:',
    'Stay blessed! :pray::skin-tone-5: :heart:',
    'Have an amazing day! :tada: :heart:',
    'Enjoy your day! :zany_face: :dizzy:',
    'Live it up! :clinking_glasses: :tada:'
  ];

  let message = `${getRandomMessage(intros)} to our ${member.role}, *${
    member.firstname
  } ${
    member.lastname
  }*, on ${pronoun} birthday! Happy Birthday to you, ${title}! ${getRandomMessage(
    outros
  )}`;

  if (member.slackId !== null) {
    message += ` <@${member.slackId}>`;
  }

  return message;
};

/**
 * Constructs the session reminder message to be sent.
 * @param {string} session - The session.
 * @param {string} session.title - The title of the session.
 * @param {string} session.timeHeld - The time the session will be held.
 * @returns {string} The constructed message.
 */
const constructSessionReminderMessage = ({ title, timeHeld }) => {
  // If there is no time set for the session, default to blank
  if (timeHeld !== null) {
    timeHeld = ` at *${zDate.formatTime(timeHeld)}*`;
  } else {
    timeHeld = '';
  }

  const firstSentences = [
    `We have the *${title}* session taking place today${timeHeld}!`,
    `We got *${title}* on today${timeHeld}!`,
    `Another day, another sesh: *${title}*${timeHeld} today.`
  ];

  const secondSentences = [
    'Good luck to the team hosting it! :raised_hands::skin-tone-5:',
    'Do your best, team! :heart:',
    'Represent, team! :call_me_hand::skin-tone-5:',
    'Wish the team luck! :star:',
    "Let's do it! :muscle::skin-tone-5:"
  ];

  return `${getRandomMessage(firstSentences)} ${getRandomMessage(
    secondSentences
  )}`;
};

const constructDueExecTaskMessage = (cards) => {
  const cardMessages = cards
    .map(({ name, due, members }) => {
      const item = `• "_${name}_" assigned to *${zString.toPunctuatedList(
        members
      )}* which was due *${zDate.formatDate(due, true)}*`;
      return item;
    })
    .join('\n');

  return `
  Executives.\nThe following tasks have passed their due date:\n\n${cardMessages}\n\nPlease report the status of your task. If it is complete, move it to "Done".
  `;
};

/**
 * Constructs the message containing uncaptioned cards.
 * @param {object[]} cards - The list of uncaptioned cards.
 * @returns {string} The constructed message.
 */
const constructSMUCMessage = (cards) => {
  const cardMessages = cards
    .map((card) => {
      return `• "_${card.name}_" due *${zDate.formatDate(card.due, true)}*`;
    })
    .join('\n');
  return `
  Social Media Team!\nThe following posts have been scheduled but have not yet been captioned:\n\n${cardMessages}\n\nCan somebody please caption them!
  `;
};

/**
 * Retrieve a random message from an array of messages;
 * @param {string[]} messages - An array of messages.
 * @returns {string} A random message.
 */
const getRandomMessage = (messages) => {
  return messages[Math.floor(Math.random() * messages.length)];
};

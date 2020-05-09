const { WebClient } = require('@slack/web-api');
const dev = process.env.NODE_ENV !== 'production';
const token = process.env.SLACK_TOKEN;

const slack = new WebClient(token);

const mySlackID = 'UDEMRRR8T';
const channel = dev ? mySlackID : 'general';

const { zDate } = require('zavid-modules');

module.exports = {
  sendBirthdayMessage: async member => {
    const message = constructBirthdayMessage(member);
    await postMessage(message);
  },
  sendSessionReminder: async session => {
    const message = constructSessionReminderMessage(session);
    await postMessage(message);
  }
};

/**
 * Retrieve a random message from an array of messages;
 * @param {string[]} messages - An array of messages.
 * @returns A random message.
 */
const getRandomMessage = messages => {
  return messages[Math.floor(Math.random() * messages.length)];
};

/**
 * Post a constructed message to the Slack channel.
 * @param {string} message - The message to be sent.
 * @returns The sender function.
 */
const postMessage = message => {
  return slack.chat.postMessage({
    channel,
    username: '#WOKEWeekly',
    blocks: [{ type: 'section', text: { type: 'mrkdwn', text: message } }]
  });
};

/**
 * Constructs the birthday message to be sent.
 * @param {Object} member - The details of the celebrating member.
 * @returns The constructed message.
 */
const constructBirthdayMessage = member => {
  let pronoun, title;

  if (member.sex === 'M') {
    pronoun = 'his';
    title = 'king';
  } else {
    pronoun = 'her';
    title = 'queen';
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
 * @param {string} session.title - The title of the session.
 * @returns The constructed message.
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

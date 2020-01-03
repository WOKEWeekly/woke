const { WebClient } = require('@slack/web-api');
const token = process.env.SLACK_TOKEN;

const slack = new WebClient(token);

module.exports = {
  sendBirthdayMessage: async(member) => {
    const channel = process.env.LOCAL_ENV ? 'test' : 'general';
    let pronoun, title;

    if (member.sex === 'M'){
      pronoun = 'his';
      title = 'king';
    } else {
      pronoun = 'her';
      title = 'queen';
    }

    let message = `${randomMessage(intros)} to our ${member.role}, *${member.firstname} ${member.lastname}*, on ${pronoun} birthday! Happy Birthday to you, ${title}! ${randomMessage(outros)}`;

    if (member.slackID !== null){
      message += ` <@${member.slackID}>`
    }

    await slack.chat.postMessage({
      channel,
      username: '#WOKEWeekly',
      blocks: [{ type: 'section', text: { type: 'mrkdwn', text: message } }]
    });
  }
}

const randomMessage = (messages) => {
  return messages[Math.floor(Math.random() * messages.length)];
}

const intros = [
  'Shout out',
  'Big love',
  'More life',
  'Best wishes'
];

const outros = [
  'Blessings! :heart:',
  'Keep being great! :muscle::skin-tone-5: :raised_hands::skin-tone-5:',
  'Stay blessed! :pray::skin-tone-5: :heart:',
  'Have an amazing day! :tada: :heart:',
  'Enjoy your day! :zany_face: :dizzy:',
  'Live it up! :clinking_glasses: :tada:'
];
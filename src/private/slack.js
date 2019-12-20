const { WebClient } = require('@slack/web-api');
const token = process.env.SLACK_TOKEN;

const slack = new WebClient(token);

module.exports = {
  sendBirthdayMessage: async(member) => {
    const channel = process.env.LOCAL_ENV ? 'test' : 'discussions';
    let pronoun, title;

    if (member.sex === 'M'){
      pronoun = 'his';
      title = 'KING';
    } else {
      pronoun = 'her';
      title = 'QUEEN';
    }

    let message = `Shout out to our ${member.role}, *${member.firstname} ${member.lastname}*, on ${pronoun} birthday! Happy Birthday to you, ${title}! :tada: :heart:`;

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
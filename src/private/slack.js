const { WebClient } = require('@slack/web-api');
const token = process.env.SLACK_TOKEN;

const slack = new WebClient(token);

module.exports = {
  sendBirthdayMessage: async(member) => {
    const channel = 'test';
    const message = `It's ${member.firstname}'s birthday today! Happy Birthday to you! <@${member.slackID}>`;
    await slack.chat.postMessage({
      channel,
      username: '#WOKEWeekly',
      blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: message
            }
          }
      ]
    });
  }
}
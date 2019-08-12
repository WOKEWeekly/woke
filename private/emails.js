const dev = process.env.NODE_ENV !== 'production';
const dotenv = require('dotenv').config({path: dev ? './config.env' : '/root/config.env'});
const nodemailer = require('nodemailer');

let { domain, emails } = require('../constants/settings.js');

const main = domain;
domain = dev ? 'http://localhost:3000' : domain;

/** Pass credentials to transporter */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PWD,
  }
});

/** Construct template for emails */
sendMail = (from, to, subject, message) => {
  transporter.sendMail({
    from: from,
    to: to,
    subject: subject,
    html: message
  }, function(err){
    if (err) console.error(err);
  });
}

/*******************************************
* Email Templates
*******************************************/

module.exports = {

  sendWelcomeEmail: (user, token) => {
    const subject = 'Welcome to the #WOKEWeekly Website!'
    const message = designMessage(`
    Hey ${user.firstname}!
    <br><br>
    
    Thank you for joining the #WOKEWeekly website. We're very honoured to have your support!
    <br><br>
    
    Remember, your username is
    <span style="${textStyleBold}">${user.username}</span>.
    You can use your username, as well as this email address, to log in to the website from here on out.
    You are free to change your username at any point in time by clicking the "Change Username" option on the account pane.
    <br><br>
    
    There are new features bound to arrive soon such as our Topic Suggestion forum. But in order to have access to these features, you'll need to verify your account. So you may as well get ahead of the crowd before they're released.
    <br><br>
    
    Verify your account by clicking the button below:

    <div style="${buttonContainerStyle}">
      <a href="${domain}/verifyAccount/${token}" style="${buttonStyle}">
        Verify Your Account
      </a>
    </div>
    
    We look forward to your interaction with our site or any other enquiries you may have!
    <br><br>
    `, true);
    
    sendMail(emails.website, user.email, subject, message);
  },

  resendVerificationEmail: (user, token) => {
    const subject = 'Account Verification'
    const message = designMessage(`
    Hey ${user.firstname}!<br><br>
    
    You recently requested to have another verification email sent to you. To verify your account,
    click on the button below:

    <div style="${buttonContainerStyle}">
      <a href="${domain}/verifyAccount/${token}" style="${buttonStyle}">
        Verify Your Account
      </a>
    </div>
    `, true);
    
    sendMail(emails.site, user.email, subject, message);
  },

  sendAccountRecoveryEmail: (user, token) => {
    const subject = 'Account Recovery'
    const message = designMessage(`
    Hey ${user.firstname}!
    <br><br>

    You're receiving this email because you've requested to reset your password as you may have forgotten it. Click the button below to reset it.
    
    <div style="${buttonContainerStyle}">
      <a href="${domain}/account/reset/${token}" style="${buttonStyle}">
        Reset Your Password
      </a>
    </div>

    If you didn't request to reset your password, please ignore this email or respond to let us know there has
    been an error.<br><br>
    
    Please note that this password reset is only valid for the next 30 minutes.
    <br><br>
    `, true);
    
    sendMail(emails.website, user.email, subject, message);
  },
  
  sendTopicDeletionEmail: (topic) => {
    const subject = 'Review: Topic Deletion';
    const message = designMessage(`A topic has been deleted from the Topic Bank.<br><br>
    <strong>Headline:</strong> ${topic.headline},<br>
    <strong>Question:</strong> ${topic.question},<br>
    <strong>Category:</strong> ${topic.category},<br>
    <strong>Type:</strong> ${topic.type},<br>
    <strong>User:</strong> ${topic.user}<br><br>
    
    <a href="${domain}/topics">Click here</a> to view the Topic Bank.
    `);
    
    sendMail(emails.website, emails.director, subject, message);
  },
  
  sendNewSuggestionEmail: (topic) => {
    const subject = 'New Topic Suggestion';
    const message = designMessage(`A new topic suggestion has been made:<br><br>
    <strong>Question:</strong> ${topic.question},<br>
    <strong>Category:</strong> ${topic.category},<br>
    <strong>Type:</strong> ${topic.type},<br>
    <strong>User:</strong> ${topic.user}<br><br>
    
    <a href="${domain}/suggestions">Click here</a> to view all topic suggestions.
    <br><br>
    `);
    
    sendMail(emails.website, emails.director, subject, message);
  }

};

/** Abstraction of message design */
const designMessage = (content, withFooter) => {
  const footer = `
    Yours truly,<br>
    The #WOKEWeekly Team.

    <hr style="margin-top: .8em">
    <img src="${main}/static/images/logos/email-signature.png" style="width:175px" alt="#WOKEWeekly">
  `
  return (
    `
    <!DOCTYPE html>
    <html>
      <head>
        <title></title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />

        <link href="https://fonts.googleapis.com/css?family=Raleway:700|Patua+One" rel="stylesheet" type="text/css">
      </head>
      <div style="${emailStyle}">
        <div style="${textStyle}">
          ${content}
          ${withFooter ? footer : null}
        </div>
      </div>
    </html>
    `
  )
}

/******************************************
*** CSS Styling
******************************************/

const emailStyle = `
  background: #b894e2;
  margin: 1em auto;
  padding: 1em;
`;

const textStyle = `
  background: white;
  color: black;
  font-family: 'Raleway', Arial, Helvetica, sans-serif;
  font-size: 1.05em;
  line-height: 1.5;
  padding: 1em;
`;

const textStyleBold = `font-weight: bold;`;

const buttonContainerStyle = `
  cursor: pointer;
  margin: 1em 0;
  padding: .5em 0;
`;

const buttonStyle = `
  background: #9769cc;
  border-radius: 10px;
  color: white;
  font-size: .8em;
  font-weight: bold;
  padding: 1em;
  text-decoration: none;
`;
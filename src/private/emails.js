const nodemailer = require('nodemailer');

let { cloudinary, domain, emails } = require('../constants/settings.js');
const { config } = require('../server.js');

require('dotenv').config({ path: config });

/** Initialise the mail transporter */
const transporter = nodemailer.createTransport({
  host: 'mail.privateemail.com',
  port: 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PWD
  }
});

/**
 * Send transport email.
 * @param {string} to - The recipient of the email.
 * @param {string} subject - The subject of the email.
 * @param {string} message - The content of the message.
 * @param {Function} callback - The callback function.
 * @param {string} token - The user token.
 */
const sendMail = (to, subject, message, callback, token) => {
  transporter.sendMail(
    {
      from: `#WOKEWeekly Website <${emails.site}>`,
      to: to,
      subject: subject,
      html: message
    },
    function (err) {
      console.info(`Emails: ${subject} email sent to ${to}.`);
      if (callback) {
        callback(err, { token });
      }
    }
  );
};

exports.sendWelcomeEmail = (user, token, callback) => {
  const subject = 'Welcome to our website!';
  const message = designMessage(
    `
  Hey ${user.firstname}!
  <br><br>
  
  Thank you for joining the #WOKEWeekly website. We're very honoured to have your support!
  <br><br>
  
  Remember, your username is <strong>${user.username}</strong>.
  You can use your username, as well as this email address, to log in to the website from here on out.
  You are free to change your username at any point in time by clicking the "Change Username" option on the account pane.
  <br><br>
  
  There are new features bound to arrive soon such as our Topic Suggestion forum. But in order to have access to these features, you'll need to verify your account. So you may as well get ahead of the crowd before they're released.
  <br><br>
  
  Verify your account by clicking the button below:

  <div style="${buttonContainerStyle}">
    <a href="${domain}/account?verify=${token}" style="${buttonStyle}">
      Verify Your Account
    </a>
  </div>
  
  We look forward to your interaction with our site or any other enquiries you may have!
  <br><br>
  `,
    true
  );

  sendMail(user.email, subject, message, callback, token);
};

exports.resendVerificationEmail = (user, token, callback) => {
  const subject = 'Account Verification';
  const message = designMessage(
    `
  Hey ${user.firstname}!<br><br>
  
  You recently requested to have another verification email sent to you. To verify your account,
  click on the button below:

  <div style="${buttonContainerStyle}">
    <a href="${domain}/account?verify=${token}" style="${buttonStyle}">
      Verify Your Account
    </a>
  </div>

  Please note that this account verification link is only valid for the next 30 minutes.
  <br><br>
  `,
    true
  );

  sendMail(user.email, subject, message, callback, token);
};

exports.sendAccountRecoveryEmail = (user, token, callback) => {
  const subject = 'Account Recovery';
  const message = designMessage(
    `
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
  
  Please note that this password reset link is only valid for the next 30 minutes.
  <br><br>
  `,
    true
  );

  sendMail(user.email, subject, message, callback, token);
};

/** Abstraction of message design */
const designMessage = (content, withFooter) => {
  const footer = `
    Yours truly,<br>
    The #WOKEWeekly Team.

    <hr style="margin-top: .8em">
    <img src="${cloudinary.url}/public/logos/email-signature.png" style="width:175px" alt="#WOKEWeekly">
  `;
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title></title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />

        <link href="https://fonts.googleapis.com/css?family=Raleway:400,700" rel="stylesheet" type="text/css">
      </head>
      <div style="${emailStyle}">
        <div style="${textStyle}">
          ${content}
          ${withFooter ? footer : null}
        </div>
      </div>
    </html>
    `;
};

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

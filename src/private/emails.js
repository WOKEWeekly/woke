const ejs = require('ejs');
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

exports.sendWelcomeEmail = (user, token, callback) => {
  const subject = 'Welcome To Our Website!';
  ejs.renderFile(__dirname + "/emails/welcome.ejs", { user, token, domain, cloudinary }, function (err, data) {
    sendMail(user.email, subject, data, callback, token);
  });
};

exports.resendVerificationEmail = (user, token, callback) => {
  const subject = 'Verify Your Account';
  ejs.renderFile(__dirname + "/emails/verification.ejs", { user, token, domain, cloudinary }, function (err, data) {
    sendMail(user.email, subject, data, callback, token);
  });
};

exports.sendAccountRecoveryEmail = (user, token, callback) => {
  const subject = 'Account Recovery';
  ejs.renderFile(__dirname + "/emails/recovery.ejs", { user, token, domain, cloudinary }, function (err, data) {
    sendMail(user.email, subject, data, callback, token);
  });
};

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
      from: `#WOKEWeekly <${emails.site}>`,
      to: to,
      subject: subject,
      html: message
    },
    function (err) {
      console.info(`Emails: "${subject}" email sent to ${to}.`);
      if (callback) {
        callback(err, { token });
      }
    }
  );
};
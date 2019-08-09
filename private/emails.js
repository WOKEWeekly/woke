const dev = process.env.NODE_ENV !== 'production';
const dotenv = require('dotenv').config({path: dev ? './config.env' : '/root/config.env'});
const nodemailer = require('nodemailer');

const { domain, emails } = require('../constants/settings.js');

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

  sendWelcomeEmail: (user, salt) => {
    const subject = 'Welcome to the #WOKEWeekly Website!'
    const message = `
    Dear ${user.firstname},<br><br>
    
    Thank you for joining us, we're very honoured to have your support!<br><br>
    
    Your username is <strong>${user.username}</strong>. You can use this, as well as the email address you used to sign up, to log in to the website for future references.
    You are free to change your username at any point in time by clicking the "Change Username" option on the account pane.<br><br>
    
    Perhaps you signed up in order to suggest a topic via our Topic Suggestor tool? In that case, please verify your account by
    <a href="${domain}/verifyAccount/${user.id}/${salt}" style="font-weight: bold">
    clicking here</a>
    before preceding to suggest any topics.
    
    We look forward to your topic suggestions or any other enquiries you may have.<br><br>
    
    Love,<br>
    The #WOKEWeekly Team.
    
    <hr>
    
    <img src="${domain}/static/images/logos/email-signature.png" style="width:250px" alt="#WOKEWeekly">
    `;
    
    sendMail(process.env.EMAIL_USER, user.email, subject, message);
  },

  resendVerificationEmail: (user, salt) => {
    const subject = 'Welcome to the #WOKEWeekly Website!'
    const message = `<div style="${textStyle}">

      Dear ${user.firstname},<br><br>
      
      You recently requested to have another verification email sent to you. To verify your account,
      click on the button below:
      <br><br>

      <a href="${domain}/verifyAccount/${user.user_id}/${salt}" style="${buttonStyle}">
      Verify Your Account</a>
      <br><br>

      Yours truly,
      <br>
      The #WOKEWeekly Team.
      
      <hr>
      <img src="${domain}/static/images/logos/email-signature.png" style="width:175px" alt="#WOKEWeekly">
    </div>
    `;
    
    sendMail(process.env.EMAIL_USER, user.email, subject, message);
  },

  sendAccountRecoveryEmail: (user, salt) => {
    const subject = 'Account Recovery'
    const message = `
    <div style="${textStyle}">
    
      Dear ${user.firstname},
      <br><br>

      You're receiving this email because you've requested to reset your password to recover your account as you
      may have forgotten your password. Click the button below to reset it.
      <br><br>
      
      <a href="${domain}/account/reset-password/${user.user_id || user.id}/${salt}" style="${buttonStyle}">
      Reset Your Password</a>
      <br><br>

      If you didn't request to reset your password, please ignore this email or respond to tell us there has
      been an error. This password reset is only valid for the next 30 minutes.
      <br><br>

      Yours truly,
      <br>
      The #WOKEWeekly Team.

      <hr>
      <img src="${domain}/static/images/logos/email-signature.png" style="width:175px" alt="#WOKEWeekly">
    
    </div>
    `;
    
    sendMail(process.env.EMAIL_USER, user.email, subject, message);
  },
  
  sendTopicDeletionEmail: (topic) => {
    const subject = 'Review: Topic Deletion';
    const message = `A topic has been deleted from the Topic Bank.<br><br>
    <strong>Headline:</strong> ${topic.headline},<br>
    <strong>Question:</strong> ${topic.question},<br>
    <strong>Category:</strong> ${topic.category},<br>
    <strong>Type:</strong> ${topic.type},<br>
    <strong>User:</strong> ${topic.user}<br><br>
    
    <a href="${domain}/topics">Click here</a> to view the Topic Bank.
    `;
    
    sendMail(emails.updates, emails.director, subject, message);
  },
  
  sendNewSuggestionEmail: (topic) => {
    const subject = 'New Topic Suggestion';
    const message = `A new topic suggestion has been made:<br><br>
    <strong>Question:</strong> ${topic.question},<br>
    <strong>Category:</strong> ${topic.category},<br>
    <strong>Type:</strong> ${topic.type},<br>
    <strong>User:</strong> ${topic.user}<br><br>
    
    <a href="${domain}/suggestions">Click here</a> to view all topic suggestions.
    `;
    
    sendMail(emails.updates, emails.director, subject, message);
  }

};

const buttonStyle = `
  background: #6C4D90;
  border-radius: 10px;
  color: white;
  cursor: pointer;
  font-weight: bold;
  margin: 1em 0;
  padding: 1em;
  text-decoration: none;
`;

const textStyle = `
  background: white;
  color: black;
  font-family: 'Raleway', Arial, Helvetica, sans-serif;
  padding: 1em;
`;
const dotenv = require('dotenv').config({path: '/root/config.env'});
const nodemailer = require('nodemailer');

const emails = require('../constants/settings.js');

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
  }, function(error, response){
    if (error) console.log(error);
  });
}

/*******************************************
* Email Templates
*******************************************/

module.exports = {

  sendWelcomeEmail: (user, salt) => {
    var subject = 'Welcome to the #WOKEWeekly Website!'
    var message = `
    Dear ${user.firstname},<br><br>
    
    Thank you for joining us, we're very honoured to have your support!<br><br>
    
    Your username is <strong>${user.username}</strong>. You can use this, as well as the email address you used to sign up, to log in to the website for future references.
    You are free to change your username at any point in time by clicking the "Change Username" option on the account pane.<br><br>
    
    Perhaps you signed up in order to suggest a topic via our Topic Suggestor tool? In that case, please verify your account by
    <a href="https://www.wokeweekly.co.uk/verifyAccount/${user.id}/${salt}" style="font-weight: bold">
    clicking here</a>
    before preceding to suggest any topics.
    
    We look forward to your topic suggestions or any other enquiries you may have.<br><br>
    
    Love,<br>
    The #WOKEWeekly Team.
    
    <hr>
    
    <img src="https://www.wokeweekly.co.uk/images/logos/email-signature.png" style="width:250px" alt="#WOKEWeekly">
    `;
    
    sendMail(process.env.EMAIL_USER, user.email, subject, message);
  },

  resendVerificationEmail: (user, salt) => {
    var subject = 'Welcome to the #WOKEWeekly Website!'
    var message = `
    Dear ${user.firstname},<br><br>
    
    Verify your account by
    <a href="https://www.wokeweekly.co.uk/verifyAccount/${user.user_id}/${salt}" style="font-weight: bold">
    clicking on this link</a>.

    <br><br>
    The #WOKEWeekly Team.
    
    <hr>
    
    <img src="https://www.wokeweekly.co.uk/images/logos/email-signature.png" style="width:175px" alt="#WOKEWeekly">
    `;
    
    sendMail(process.env.EMAIL_USER, user.email, subject, message);
  },
  
  sendTopicDeletionEmail: (topic) => {
    var subject = 'Review: Topic Deletion';
    var message = `A topic has been deleted from the Topic Bank.<br><br>
    <strong>Headline:</strong> ${topic.headline},<br>
    <strong>Question:</strong> ${topic.question},<br>
    <strong>Category:</strong> ${topic.category},<br>
    <strong>Type:</strong> ${topic.type},<br>
    <strong>User:</strong> ${topic.user}<br><br>
    
    <a href="https://wokeweekly.co.uk/topics">Click here</a> to view the Topic Bank.
    `;
    
    sendMail(emails.updates, emails.director, subject, message);
  },
  
  sendNewSuggestionEmail: (topic) => {
    var subject = 'New Topic Suggestion';
    var message = `A new topic suggestion has been made:<br><br>
    <strong>Question:</strong> ${topic.question},<br>
    <strong>Category:</strong> ${topic.category},<br>
    <strong>Type:</strong> ${topic.type},<br>
    <strong>User:</strong> ${topic.user}<br><br>
    
    <a href="https://wokeweekly.co.uk/suggestions">Click here</a> to view all topic suggestions.
    `;
    
    sendMail(emails.updates, emails.director, subject, message);
  }

};
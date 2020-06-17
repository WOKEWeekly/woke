const ejs = require('ejs');
const nodemailer = require('nodemailer');
const { zDate, zText } = require('zavid-modules');

const { cloudinary, domain, emails } = require('../../constants/settings.js');
const { SUBSCRIPTIONS } = require('../../constants/strings.js');
const { config } = require('../../server.js');
const knex = require('../api/knex').getKnex();

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
  ejs.renderFile(
    __dirname + '/templates/welcome.ejs',
    { user, token, domain, cloudinary },
    function (err, data) {
      sendMail(user.email, subject, data, callback, token);
    }
  );
};

exports.resendVerificationEmail = (user, token, callback) => {
  const subject = 'Verify Your Account';
  ejs.renderFile(
    __dirname + '/templates/verification.ejs',
    { user, token, domain, cloudinary },
    function (err, data) {
      sendMail(user.email, subject, data, callback, token);
    }
  );
};

exports.sendAccountRecoveryEmail = (user, token, callback) => {
  const subject = 'Account Recovery';
  ejs.renderFile(
    __dirname + '/templates/recovery.ejs',
    { user, token, domain, cloudinary },
    function (err, data) {
      sendMail(user.email, subject, data, callback, token);
    }
  );
};

/**
 * Send an email to all subscribers to new article.
 * @param {object} article - The article details
 * @param {object} options - The callback options for this function.
 * @param {Function} [options.callback] - The callback function called on completion.
 * @param {object} [options.params] - The parameters sent via the callback.
 */
exports.notifyNewArticle = (article, options) => {
  const {
    title,
    content,
    datePublished,
    image,
    slug,
    authorName,
    authorLevel,
    authorImage,
    authorSlug
  } = article;

  const subject = `Blog: "${title}" by ${authorName}`;
  const isGuest = authorLevel === 'Guest';

  ejs.renderFile(
    __dirname + '/templates/article.ejs',
    {
      article: Object.assign({}, article, {
        content: zText.truncateText(content),
        slug: `${domain}/blog/${slug}`,
        datePublished: zDate.formatDate(datePublished, true),
        image: `${cloudinary.url}/w_768,c_lfill/${image}`,
        authorImage: `${cloudinary.url}/w_400,c_lfill/${authorImage}`,
        authorSlug: `${domain}/${isGuest ? 'author' : 'team'}/${authorSlug}`
      }),
      domain
    },
    function (err, data) {
      sendMailToAllSubscribers(SUBSCRIPTIONS.ARTICLES, subject, data, options);
    }
  );
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
      to,
      subject,
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

/**
 * Send email to all subscribers.
 * @param {string} type - The type of subscription.
 * @param {string} subject - The subject of the email.
 * @param {string} message - The content of the message.
 * @param {object} [options] - The callback options for this function.
 * @param {Function} [options.callback] - The callback function called on completion.
 * @param {object} [options.params] - The parameters sent via the callback.
 */
const sendMailToAllSubscribers = (type, subject, message, options = {}) => {
  const { callback, params } = options;

  const query = knex.select().from('subscribers');
  query.asCallback(function (err, results) {
    // Retrieve list of subscribers to corresponding type
    const mailList = results.map((subscriber) => {
      const subscriptions = JSON.parse(subscriber.subscriptions);
      const isSubscribed = subscriptions[type];
      if (isSubscribed) return subscriber.email;
    });

    // Send email to shortlisted subscribers on mailing list
    transporter.sendMail(
      {
        from: `#WOKEWeekly <${emails.site}>`,
        to: mailList,
        subject,
        html: message
      },
      function (err) {
        console.info(
          `Emails: "${subject}" email sent to all ${type} subscribers.`
        );
        if (callback) callback(err, params);
      }
    );
  });
};

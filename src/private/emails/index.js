const async = require('async');
const ejs = require('ejs');
const htmlToText = require('html-to-text');
const nodemailer = require('nodemailer');
const { zDate, zText } = require('zavid-modules');

const {
  accounts,
  cloudinary,
  copyright,
  domain,
  emails
} = require('../../constants/settings.js');
const { SUBSCRIPTIONS } = require('../../constants/strings.js');
const { config } = require('../../server.js');
const knex = require('../singleton/knex').getKnex();

require('dotenv').config({ path: config });
const isDev = process.env.NODE_ENV !== 'production';

/** A map of variables used in all EJS emails */
const ejsLocals = {
  accounts,
  cloudinary,
  copyright,
  domain
};

/** The common HTML-to-text options for all emails. */
const htmlToTextOptions = {
  hideLinkHrefIfSameAsText: true,
  ignoreImage: true,
  noLinkBrackets: true,
  preserveNewlines: true,
  uppercaseHeadings: false,
  wordwrap: 80
};

/** The email address of the recipient in development. */
const testRecipient = process.env.ETHEREAL_EMAIL;

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
 * Send the account recovery email to a user.
 * @param {object} user - The recipient user.
 * @param {string} token - The user token.
 * @param {Function} callback - The callback function called on completion.
 */
exports.sendWelcomeEmail = (user, token, callback) => {
  const subject = 'Welcome To Our Website!';
  ejs.renderFile(
    __dirname + '/templates/welcome.ejs',
    { user, token, ...ejsLocals },
    function (err, data) {
      sendMail(user.email, subject, data, {
        callback,
        token,
        emailText: { baseElement: 'div.email-content' }
      });
    }
  );
};

/**
 * Resend the email address verification email to a user.
 * @param {object} user - The recipient user.
 * @param {string} token - The user token.
 * @param {Function} callback - The callback function called on completion.
 */
exports.resendVerificationEmail = (user, token, callback) => {
  const subject = 'Verify Your Account';
  ejs.renderFile(
    __dirname + '/templates/verification.ejs',
    { user, token, ...ejsLocals },
    function (err, data) {
      sendMail(user.email, subject, data, {
        callback,
        token,
        emailText: { baseElement: 'div.email-content' }
      });
    }
  );
};

/**
 * Send the account recovery email to a user.
 * @param {object} user - The recipient user.
 * @param {string} token - The user token.
 * @param {Function} callback - The callback function called on completion.
 */
exports.sendAccountRecoveryEmail = (user, token, callback) => {
  const subject = 'Account Recovery';
  ejs.renderFile(
    __dirname + '/templates/recovery.ejs',
    { user, token, ...ejsLocals },
    function (err, data) {
      sendMail(user.email, subject, data, {
        callback,
        token,
        emailText: { baseElement: 'div.email-content' }
      });
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
    coverImage,
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
        coverImage: `${cloudinary.url}/w_768,c_lfill/${coverImage}`,
        authorImage: `${cloudinary.url}/w_400,c_lfill/${authorImage}`,
        authorSlug: `${domain}/${isGuest ? 'author' : 'team'}/${authorSlug}`
      }),
      ...ejsLocals
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
 * @param {object} [options] - Additional options.
 * @param {Function} [options.callback] - The callback function.
 * @param {string} [options.token] - The user token.
 */
const sendMail = (to, subject, message, options = {}) => {
  const { callback, emailText, token } = options;
  transporter.sendMail(
    {
      from: `#WOKEWeekly <${emails.site}>`,
      to: isDev ? testRecipient : to,
      subject,
      html: message,
      text: htmlToText.fromString(
        message,
        Object.assign({}, htmlToTextOptions, emailText)
      )
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
  const { callback, emailText, params } = options;

  const query = knex.select().from('subscribers');
  query.asCallback(function (err, results) {
    // Retrieve list of subscribers to corresponding type
    const mailList = isDev
      ? [testRecipient]
      : results.map((subscriber) => {
          const subscriptions = JSON.parse(subscriber.subscriptions);
          const isSubscribed = subscriptions[type];
          if (isSubscribed) return subscriber.email;
        });

    // Send email to shortlisted subscribers on mailing list
    async.each(
      mailList,
      function (recipient, callback) {
        transporter.sendMail(
          {
            from: `#WOKEWeekly <${emails.site}>`,
            to: recipient,
            subject,
            html: message,
            text: htmlToText.fromString(
              message,
              Object.assign({}, htmlToTextOptions, emailText)
            )
          },
          function (err) {
            callback(err);
          }
        );
      },
      function (err) {
        console.info(
          `Emails: "${subject}" email sent to ${mailList.length} ${type} subscribers.`
        );
        if (callback) callback(err, params);
      }
    );
  });
};

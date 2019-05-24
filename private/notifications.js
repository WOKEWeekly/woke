const { Expo } = require('expo-server-sdk');
const async = require('async');
const expo = new Expo();

module.exports = {

  /** Send notification to only one user */
  one: (conn, title, message, id) => {
    let sql = `SELECT token_string FROM user_tokens WHERE type='push' AND user_id = ${id}`;
    processNotifications(conn, sql, title, message);
  },
  /** Send notification to executives */
  exec: (conn, title, message) => {
    let sql = `SELECT token_string FROM user_tokens
    INNER JOIN user ON user_tokens.user_id = user.id
    WHERE type='push' AND clearance >= 7`;
    processNotifications(conn, sql, title, message);
  },
  /** Send notification to all users */
  all: (conn, title, message, type) => {
    let sql;
    if (type === 'sessions'){
      sql = `SELECT token_string FROM user_tokens WHERE type='push' AND _sessions = 1`;
    } else if (type === 'qotd'){
      sql = `SELECT token_string FROM user_tokens WHERE type='push' AND _qotd = 1`;
    } else {
      sql = `SELECT token_string FROM user_tokens WHERE type='push'`;
    }
    
    processNotifications(conn, sql, title, message);
  }
}

processNotifications = (conn, sql, title, message) => {
  async.waterfall([
    function(callback){
      conn.query(sql, function (err, result, fields) {
        if (!err){
          callback(null, result)
        } else {
          console.error(err.toString())
        }
      });
    }
  ], function(err, result){
    let messages = [];

    for (let row of result) {
      var pushToken = row.token_string;
      
      /** Validate push tokens */
      if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`Push token ${pushToken} is not a valid Expo push token`);
        continue;
      }
      
      /** Construct messages */
      messages.push({
        to: pushToken,
        title: title,
        body: message,
        sound: 'default',
      })
    }

    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];

    (async () => {
      /** Send chunks to the Expo push notification service */
      for (let chunk of chunks) {
        try {
          let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          console.log('Ticket chunk:', ticketChunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error(error);
        }
      }
    })();

    let receiptIds = [];

    for (let ticket of tickets) {
      if (ticket.id) {
        receiptIds.push(ticket.id);
      }
    }
    
    let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);

    (async () => {
      for (let chunk of receiptIdChunks) {
        try {
          let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
          console.log('Receipts:', receipts);
    
          for (let receipt of receipts) {
            if (receipt.status === 'ok') {
              continue;
            } else if (receipt.status === 'error') {
              console.error(`There was an error sending a notification: ${receipt.message}`);
              if (receipt.details && receipt.details.error) {
                console.error(`The error code is ${receipt.details.error}`);
              }
            }
          }
        } catch (error) {
          console.error(error);
        }
      }
    })();
  });
}
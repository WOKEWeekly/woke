const schedule = require('node-schedule');

module.exports = function(conn){
  
  /** Send Question of the Day notifications at 9:00am everyday */
  schedule.scheduleJob('0 9 * * *', function(){
    let sql = `SELECT headline, question FROM topics
    WHERE polarity = 1
    AND category != 'Christian'
    AND category != 'Mental Health'
    ORDER BY RAND() LIMIT 1;`;
    
    conn.query(sql, function (err, result, fields) {
      if (!err){
        let topic = result[0];
        let title = `QOTD: ${topic.headline}`;
        let message = topic.question;
        notifications.all(conn, title, message, 'qotd');
      } else {
        console.log(err.toString());
      }
    });
  });
  
  /** Notify any sessions happening on current day at 10:00am */
  schedule.scheduleJob('0 10 * * *', function(){
    conn.query("SELECT * FROM sessions WHERE dateHeld = CURDATE()", function (err, result, fields) {
      if (!err){
        for (let session of result) {
          let title = 'New Session Today!';
          let message = `${session.title} is taking place today!`;
          notifications.all(conn, title, message, 'sessions');
        }
      } else {
        console.log(err.toString());
      }
    });
  });
  
  /** Notify executives of team member birthdays */
  schedule.scheduleJob('0 0 * * *', function(){
    conn.query("SELECT * FROM team WHERE DATE_FORMAT(birthday,'%m-%d') = DATE_FORMAT(CURDATE(),'%m-%d')", function (err, result, fields) {
      if (!err){
        for (let member of result) {
          let title = '';
          let message = `It's ${member.firstname} ${member.lastname}'s birthday today!`;
          notifications.exec(conn, title, message);
        }
      } else {
        console.log(err.toString());
      }
    });
  });
}

const TOPICS = {
  /**
   * Constructs the SQL statement to create a topic.
   * @param {object} topic - The object containing the topic details.
   * @returns {object} The SQL statement and the values.
   */
  CREATE: (topic) => {
    const sql =
      'INSERT INTO topics (headline, category, question, description, type, polarity, validated, sensitivity, option1, option2, userId) VALUES ?';
    const values = [
      [
        topic.headline,
        topic.category,
        topic.question,
        topic.description,
        topic.type,
        topic.polarity,
        topic.validated,
        topic.sensitivity,
        topic.option1,
        topic.option2,
        topic.userId
      ]
    ];
    return { sql, values };
  },
  READ: {
    /**
     * Constructs the SQL statement to return information for all topics.
     * @param {string} [fields] - The fields to be queried.
     * @returns {string} The constructed statement.
     */
    ALL: (fields = '*') => {
      return `SELECT ${fields} FROM topics`;
    },

    /**
     * Constructs the SQL statement to return information for a single topic.
     * @param {string} [fields] - The fields to be queried.
     * @returns {string} The constructed statement.
     */
    SINGLE: (fields = '*') => {
      const sql = `SELECT ${fields} FROM topics WHERE ID = ?`;
      return sql;
    },

    /** The SQL statement to return a random topic. */
    RANDOM:
      "SELECT id, headline, category, question, option1, option2, yes, no FROM topics WHERE polarity = 1 AND category != 'Christian' AND category != 'Mental Health' ORDER BY RAND() LIMIT 1;",

    /**
     * Constructs the SQL statement and values required to
     * regenerate a Topic Bank token.
     * @returns {object} The SQL statement, its values, and the generated token.
     */
    REGENERATE_TOKEN: () => {
      const token = generateRandomString(12);
      const sql = `UPDATE tokens SET value = ?, lastUpdated = ? WHERE name = ?`;
      const values = [token, new Date(), 'topicBank'];
      return { sql, values, token };
    }
  },

  UPDATE: {
    /**
     * Constructs the SQL statement to update a topic.
     * @param {number} id - The identifier of the topic.
     * @param {object} topic - The object containing the topic details.
     * @returns {object} The SQL statement and the values.
     */
    DETAILS: (id, topic) => {
      const sql = `UPDATE topics SET headline = ?, category = ?, question = ?, description = ?, type = ?, polarity = ?, validated = ?, sensitivity = ?, option1 = ?, option2 = ? WHERE id = ?`;
      const values = [
        topic.headline,
        topic.category,
        topic.question,
        topic.description,
        topic.type,
        topic.polarity,
        topic.validated,
        topic.sensitivity,
        topic.option1,
        topic.option2,
        id
      ];
      return { sql, values };
    },

    /**
     * Constructs the SQL statement to vote on a topic.
     * @param {number} id - The identifier of the topic.
     * @param {string} option - The selected option. Either 'yes' or 'no'.
     * @returns {string} The constructed statement.
     */
    VOTE: (id, option) => {
      const sql = `UPDATE topics SET ${option}=${option}+1 WHERE id = ${id}`;
      return sql;
    }
  },

  /** The SQL statement to delete a member. */
  DELETE: 'DELETE FROM topics WHERE id = ?'
};

const USERS = {
  /**
   * Constructs the SQL statement to create a user.
   * @param {object} user - The object containing the user details.
   * @returns {object} The SQL statement and the values.
   */
  CREATE: (user, hash) => {
    const sql =
      'INSERT INTO users (firstname, lastname, clearance, email, username, password) VALUES ?';
    const values = [
      [user.firstname, user.lastname, 1, user.email, user.username, hash]
    ];
    return { sql, values };
  },

  READ: {
    /**
     * Constructs the SQL statement to return information for all users.
     * @param {string} [fields] - The fields to be queried.
     * @returns {string} The constructed statement.
     */
    ALL: (fields = '*') => {
      return `SELECT ${fields} FROM users`;
    },

    /**
     * Constructs the SQL statement to return a user using a username or
     * email address.
     * @param {string} username - The submitted username.
     * @returns {object} The SQL statement and the values.
     */
    LOGIN: (username) => {
      const sql = `SELECT * FROM users WHERE Username = ? OR Email = ?`;
      const values = [username, username];
      return { sql, values };
    },

    /**
     * Constructs the SQL statement to return some user information
     * via email address.
     * @param {string} [fields] - The fields to be queried.
     * @returns {string} The constructed statement.
     */
    RECOVERY: (fields = '*') => {
      return `SELECT ${fields} FROM users WHERE email = ?`;
    },

    /**
     * Constructs the SQL statement to return information for a single user.
     * @param {string} [fields] - The fields to be queried.
     * @returns {string} The constructed statement.
     */
    SINGLE: (fields = '*') => {
      const sql = `SELECT ${fields} FROM users WHERE ID = ?`;
      return sql;
    }
  },

  /**
   * Constructs the SQL statement to change a user's clearance.
   * @param {number} id - The identifier of the user.
   * @param {number} clearance - The clearance value to be changed to.
   * @returns {object} The SQL statement and the values.
   */
  UPDATE: (field, id, val) => {
    const sql = `UPDATE users SET ${field} = ? WHERE id = ?`;
    const values = [val, id];
    return { sql, values };
  },

  /** The SQL statement to delete a user. */
  DELETE: 'DELETE FROM users WHERE id = ?',

  CLEAR: 'DELETE FROM users WHERE id > 2'
};

const TOKENS = {
  READ: (name) => {
    return `SELECT * FROM tokens WHERE name = '${name}'`;
  }
};

module.exports = {
  SESSIONS,
  TOKENS,
  TOPICS,
  USERS
};
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

module.exports = {
  USERS
};
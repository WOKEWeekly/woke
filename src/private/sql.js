module.exports = {
  SESSIONS: {
    CREATE: (session) => {
      const sql = "INSERT INTO sessions (title, dateHeld, timeHeld, image, slug, description) VALUES ?";
      const values = [[session.title, session.dateHeld, session.timeHeld, session.image, session.slug, session.description]];
      return { sql, values };
    },
    READ: {
      ALL: "SELECT * FROM sessions",
      SINGLE: (fields = '*') => {
        const sql = `SELECT ${fields} FROM sessions WHERE ID = ?`;
        return sql;
      },
      UPCOMING: "SELECT * FROM sessions WHERE dateheld > NOW() ORDER BY RAND() LIMIT 1",
      LATEST: "SELECT * FROM sessions ORDER BY dateHeld DESC LIMIT 1",
    },
    UPDATE: (id, session, imageHasChanged) => {
      let sql = "UPDATE sessions SET title = ?, dateHeld = ?, timeHeld = ?, slug = ?, description = ? WHERE id = ?";
      let values = [session.title, session.dateHeld, session.timeHeld, session.slug, session.description, id];
  
      if (imageHasChanged){
        sql = appendFieldToUpdateQuery('image', sql);
        values = insertFieldInValues(session.image, values);
      }
  
      return { sql, values };
    },
    DELETE: "DELETE FROM sessions WHERE id = ?"
  },
  CANDIDATES: {
    CREATE: (candidate) => {
      const sql = "INSERT INTO candidates (id, name, image, birthday, ethnicity, socials, occupation, description,author_id, date_written) VALUES ?";
      const values = [[candidate.id, candidate.name, candidate.image, candidate.birthday, candidate.ethnicity, candidate.socials, candidate.occupation, candidate.description, candidate.authorId, candidate.dateWritten]];
      return { sql, values };
    },
    READ: {
      ALL: "SELECT * FROM candidates",
      RANDOM: "SELECT * FROM candidates ORDER BY RAND() LIMIT 1",
      SINGLE: (fields = '*') => {
        const sql = `SELECT ${fields} FROM candidates WHERE ID = ?`;
        return sql;
      },
      LATEST: "SELECT * FROM candidates ORDER BY id DESC LIMIT 1",
    },
    UPDATE: (id, candidate, imageHasChanged) => {
      let sql = "UPDATE candidates SET id = ?, name = ?, birthday = ?, ethnicity = ?, socials = ?, occupation = ?, description = ?,author_id = ?, date_written = ? WHERE id = ?";
      let values = [candidate.id, candidate.name, candidate.birthday, candidate.ethnicity, candidate.socials, candidate.occupation, candidate.description, candidate.authorId, candidate.dateWritten, id];
  
      if (imageHasChanged){
        sql = appendFieldToUpdateQuery('image', sql);
        values = insertFieldInValues(candidate.image, values);
      }
  
      return { sql, values };
    },
    DELETE: "DELETE FROM candidates WHERE id = ?"
  },
  MEMBERS: {
    READ: {
      ALL: (fields = '*') => {
        return `SELECT ${fields} FROM members`;
      }
    }
  }
}



/**
 * Appends a new field to an existing UPDATE query.
 * @param {string} field - The name of the field to be appended.
 * @param {string} statement - The current SQL query statement.
 * @returns {string} The new query with the appended field.
 */
const appendFieldToUpdateQuery = (field, statement) => {
  const idx = statement.indexOf('? WHERE') + 1;
  const query = [
    statement.slice(0, idx),
    ', ',
    field,
    ' = ?',
    statement.slice(idx)
  ].join('');

  return query;
}

/**
 * Inserts a new field value into an array of values.
 * @param {any} value - The value to be inserted.
 * @param {any[]} array - The array of values.
 * @returns {any[]} The new array of values.
 */
const insertFieldInValues = (value, array) => {
  array.splice(array.length - 1, 0, value);
  return array;
}
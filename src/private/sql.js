module.exports = {
  GET_ALL_SESSIONS: "SELECT * FROM sessions",
  GET_SINGLE_SESSION: (fields = '*') => {
    const sql = `SELECT ${fields} FROM sessions WHERE ID = ?`;
    return sql;
  },
  ADD_SESSION: (session) => {
    const sql = "INSERT INTO sessions (title, dateHeld, timeHeld, image, slug, description) VALUES ?";
    const values = [[session.title, session.dateHeld, session.timeHeld, session.image, session.slug, session.description]];
    return { sql, values };
  },
  UPDATE_SESSION: (id, session, imageHasChanged) => {
    let sql = "UPDATE sessions SET title = ?, dateHeld = ?, timeHeld = ?, slug = ?, description = ? WHERE id = ?";
    let values = [session.title, session.dateHeld, session.timeHeld, session.slug, session.description, id];

    if (imageHasChanged){
      sql = appendFieldToUpdateQuery('image', sql);
      values = insertFieldInValues(session.image, values);
    }

    return { sql, values };
  },
  DELETE_SESSION: "DELETE FROM sessions WHERE id = ?"
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
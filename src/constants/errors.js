module.exports = {
  SERVER: {
    INVALID_SESSION_ID: (id) => new Error(`There exists no session with ID: ${id}.`),
  }
}

module.exports = {

  /**
   * Send a response to the client.
   * @param {object} res - The response context of the service.
   * @param {object} err - The object containing information about the error.
   * @param {object} [json] - The response body to be sent back to the client.
   * @param {number} [expectedStatus] - The expected status code of the
   * response. Defaults to 200.
   */
  respondToClient: (res, err, json = {}, expectedStatus = 200) => {
    if (err && err !== true){
      console.error(err.toString());
      res.status(400).json({message: retrieveErrorMessage(err)});
    } else {
      res.status(expectedStatus).json(json);
    }
  },

  /**
   * Display an error page on the web client with a description of the error.
   * @param {object} req - The request information from the client.
   * @param {object} res - The response context of the service
   * @param {object} err - The object containing information about the error.
   * @param {object} server - The server object.
   */
  renderErrorPage: (req, res, err, server) => {
    if (err) console.error(err.toString());
    const message = err ? retrieveErrorMessage(err) : '';
    return server.render(req, res, '/error', { message });
  }
}

/**
 * Extract and/or simplify the error message using given information. 
 * @param {object} err - The object containing information about the error
 */
retrieveErrorMessage = (err) => {
  if (err.errno === 1062){
    if (err.toString().includes("email")){ // If duplicate entry in MySQL
      return "This email address already exists.";
    } else if (err.toString().includes("username")){
      return "The username you have chosen already exists.";
    }
  }

  if (err.type === 'jwt') return 'jwt';
  if (err.message === 'jwt expired') return `Awkward. The link you followed has expired. Don't say we didn't warn ya!`;

  return err.message; 
}
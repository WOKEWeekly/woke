
module.exports = {

  /**
   * Send a response to the client.
   * @param {object} res - The response context of the service.
   * @param {Error} err - The object containing information about the error.
   * @param {number} [expectedStatus] - The expected status code of the
   * @param {object} [json] - The response body to be sent back to the client.
   * response. Defaults to 400.
   */
  respondToClient: (res, err, expectedStatus, json) => {
    if (err && typeof err === 'object'){ // If there is an error...
      console.error(err.toString());
      return res.status(err.status || 500).json({message: retrieveErrorMessage(err)});
    }

    return res.status(expectedStatus).json(json);
  },

  /**
   * Display an error page on the web client with a description of the error.
   * @param {object} req - The request information from the client.
   * @param {object} res - The response context of the service
   * @param {Error} err - The object containing information about the error.
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
 * @param {Error} err - The object containing information about the error
 */
retrieveErrorMessage = (err) => {
  if (err.errno === 1062){
    if (err.toString().includes("email")){ // If duplicate entry in MySQL
      return "This email address already exists.";
    } else if (err.toString().includes("username")){
      return "The username you have chosen already exists.";
    }
  }

  return err.message; 
}
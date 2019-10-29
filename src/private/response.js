
module.exports = {
  resToClient: (res, err, json) => {
    if (err && err !== true){
      console.error(err.toString());
      res.status(400).send({message: getErrMsg(err)});
    } else {
      json ? res.json(json) : res.status(200).send({ message: 'ok'});
    }
  },
  renderErrPage: (req, res, err, server) => {
    if (err) console.error(err.toString());
    return server.render(req, res, '/error', { message: err ? getErrMsg(err) : '' });
  }
}

getErrMsg = (err) => {
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
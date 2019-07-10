const bcrypt = require("bcrypt");
const saltRounds = 10;
const logger = require("./../libs/loggerLib");

let comparePassword = (oldPassword, hashPassword, callback) => {
  bcrypt.compare(oldPassword, hashPassword, (err, res) => {
    if (err) {
      logger.error(err.message, "Password did not matched.", 5);
      callback(err, null);
    } else {
      callback(null, res);
    }
  });
};

let hashPassword = rowPassword => {
  let salt = bcrypt.genSaltSync(saltRounds);
  let hash = bcrypt.hashSync(rowPassword, salt);

  return hash;
};

module.exports = {
  comparePassword: comparePassword,
  hashPassword: hashPassword
};

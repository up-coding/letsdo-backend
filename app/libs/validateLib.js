/* Minimum 8 characters which contain only characters,numeric 
digits,underscore and first character must be a letter */
let checkPassword = password => {
  if (password.match(/^[A-Za-z0-9]\w{7,}$/)) {
    //passwrod regex

    return password;
  }
  return false;
};

let checkEmail = email => {
  let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(emailRegex)) {
    return email;
  }
  return false;
};

let checkUserName = userName => {
  if (userName.match(/^[a-zA-Z0-9\@\-\_]{8,}$/)) {
    //username regex
    return userName;
  }
  return false;
};

module.exports = {
  checkPassword: checkPassword,
  checkEmail: checkEmail,
  checkUserName: checkUserName
};

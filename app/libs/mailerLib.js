const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const appConfig = require("./../../config/appConfig");
const mailingId = "dummy.meeting.planner@gmail.com";

let sendActivationEmail = userDetails => {
  let userName = `${userDetails.firstName} ${userDetails.lastName}`;
  let subject = "Email varification.";
  let message = `Hello ${userName},<br><br>Your account has been created, 
                    Please click below link to activate your account:<br><br>
                    <a href="${appConfig.appUrl}/verify/${
    userDetails.userId
    }">Activate account.</a> `;
  sendEmail(userDetails.email, subject, message);
};

let sendPasswordUpdateEmail = userDetails => {
  let userName = `${userDetails.firstName} ${userDetails.lastName}`;
  let subject = "Password Changed.";
  let message = `Hello ${userName},<br><br>Your password has been changed successfully, 
                       Thanks from LetsDo team.`;
  sendEmail(userDetails.email, subject, message);
};

let sendPasswordResetEmail = (userDetails, resetToken) => {
  let fullName = `${userDetails.firstName} ${userDetails.lastName}`;
  let subject = "Password Reset.";
  let message = `Hello ${fullName},<br><br>This email is sent you to reset your 
                   account password.<br>
                   Please click on the following link to reset your password.<br>
                   <a href="${appConfig.appUrl}/reset-password/${resetToken}">Reset password</a>`;
  sendEmail(userDetails.email, subject, message);
};

let sendConfirmationEmail = userDetails => {
  let userName = `${userDetails.firstName} ${userDetails.lastName}`;
  let subject = "Account activation confirmation.";
  let message = `Hello ${userName},<br><br>Your account has been activated 
                   successfully.<br>Thanks for choosing LetsDo.`;

  sendEmail(userDetails.email, subject, message);
};

let sendEmail = (to, subject, message, cb) => {
  const authpass = jwt.decode(`${appConfig.key}`);

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: mailingId,
      pass: "stack.2019"
    }
  });
  let mailOptions = {
    from: mailingId,
    to: to,
    subject: subject,
    text: "Hello new user!",
    html: message
  };
  transporter.sendMail(mailOptions, cb);
};

module.exports = {
  sendActivationEmail: sendActivationEmail,
  sendPasswordUpdateEmail: sendPasswordUpdateEmail,
  sendPasswordResetEmail: sendPasswordResetEmail,
  sendConfirmationEmail: sendConfirmationEmail
};

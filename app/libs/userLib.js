const shortId = require("shortid");
const logger = require("./../libs/loggerLib");
const response = require("./../libs/responseLib");
const check = require("../libs/checkLib");
const passwordLib = require("./../libs/generatePasswordLib");
const time = require("./../libs/timeLib");
const token = require("./../libs/tokenLib");
const mailer = require("./../libs/mailerLib");
const User = require("./../models/User");
const Auth = require("./../models/Auth");

let createUser = (req, res) => {
  return new Promise((resolve, reject) => {
    User.findOne({
      $or: [{ email: req.body.email }, { userName: req.body.userName }]
    }).exec((err, retrievedUserDetails) => {
      if (err) {
        logger.error(err.message, "userController: signUp()/createUser()", 10);
        reject(
          handleError("Error while creating user.", 500, "createUser", err)
        );
      } else if (check.isEmpty(retrievedUserDetails)) {
        let newUser = new User({
          userId: shortId.generate(),
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email.toLowerCase(),
          userName: req.body.userName,
          mobile: req.body.mobile,
          country: req.body.countryName,
          password: passwordLib.hashPassword(req.body.password),
          userType: req.body.userName.endsWith("admin") ? "admin" : "normal",
          createdOn: time.now()
        });
        newUser.save((err, newUser) => {
          if (err) {
            logger.error(
              err.message,
              "userController: signUp()/createUser()",
              10
            );
            reject(
              response.generate(true, "Error while saving new user.", 500, null)
            );
          } else {
            setTimeout(() => mailer.sendActivationEmail(newUser), 2000);
          }
          resolve(newUser.toObject());
        });
      } else if (retrievedUserDetails.email === req.body.email) {
        logger.info(
          "Email already exists.",
          "userController: signUp()/createUser()",
          7
        );
        reject(response.generate(true, "Email already exist.", 500, null));
      } else if (retrievedUserDetails.userName === req.body.userName) {
        logger.info(
          "Username already exists.",
          "userController: signUp()/createUser()",
          7
        );
        reject(response.generate(true, "Username already exist.", 500, null));
      }
    });
  });
};

let verifyEmail = req => {
  return new Promise((resolve, reject) => {
    User.findOne({ userId: req.body.userId }).exec(
      (err, retrievedUserDetails) => {
        if (err) {
          logger.error(
            err.message,
            "userController: verifyUserEmail()/verifyEmail()",
            10
          );
          reject(
            response.generate(true, "Error while finding user.", 500, null)
          );
        } else if (check.isEmpty(retrievedUserDetails)) {
          logger.info(
            "User not found.",
            "userController: verifyUserEmail()/verifyEmail()",
            7
          );
          reject(response.generate(true, "User not found.", 400, null));
        } else if (retrievedUserDetails.isVerified) {
          logger.info(
            "User is already verified.",
            "userController: verifyUserEmail()/verifyEmail()",
            7
          );
          reject(
            response.generate(true, "Account is already verified.", 400, null)
          );
        } else {
          retrievedUserDetails.isVerified = true;
          retrievedUserDetails.save((err, result) => {
            if (err) {
              logger.error(
                err.message,
                "userController: verifyUserEmail()/verifyEmail()",
                10
              );
              reject(
                response.generate(
                  true,
                  "Failed to verifying user email.",
                  500,
                  null
                )
              );
            } else {
              setTimeout(() => mailer.sendConfirmationEmail(result), 2000);
              resolve(result.toObject());
            }
          });
        }
      }
    );
  });
};

let findUserByUserName = req => {
  return new Promise((resolve, reject) => {
    req.body.email
      ? (userName = { email: req.body.email })
      : (userName = { userName: req.body.userName });
    User.findOne(userName)
      .select("-_id -__v")
      .exec((err, retrievedUserDetails) => {
        if (err) {
          logger.error(
            err.message,
            "userController: login()/findUserByUserName()",
            10
          );
          reject(
            response.generate(true, "Error while finding user.", 500, null)
          );
        } else if (check.isEmpty(retrievedUserDetails)) {
          logger.info(
            "User not found.",
            "userController:login()/findUserByUserName()",
            7
          );
          reject(
            response.generate(
              true,
              "No User registered with this email.",
              404,
              null
            )
          );
        } else if (
          !check.isEmpty(retrievedUserDetails) &&
          !retrievedUserDetails.isVerified
        ) {
          logger.info(
            "User not verified.",
            "userController:login()/findUserByUserName()",
            7
          );
          reject(response.generate(true, "User not verified.", 400, null));
        } else {
          retrievedUserDetails.resetToken = '';
          resolve(retrievedUserDetails);
        }
      });
  });
};

let findUserById = userId => {
  return new Promise((resolve, reject) => {
    User.findOne({ userId: userId })
      .select("-_id -__v")
      .exec((err, retrievedUserDetails) => {
        if (err) {
          logger.error(
            err.message,
            "userController: updatePassword()/findUserById()",
            10
          );
          reject(
            response.generate(true, "Error while finding user.", 500, null)
          );
        } else if (check.isEmpty(retrievedUserDetails)) {
          logger.info(
            "User not found.",
            "userController:updatePassword()/findUserById()",
            7
          );
          reject(response.generate(true, "User not found.", 400, null));
        } else if (
          !check.isEmpty(retrievedUserDetails) &&
          !retrievedUserDetails.isVerified
        ) {
          logger.info(
            "User not verified.",
            "userController: updatePassword()/findUserById()",
            7
          );
          reject(response.generate(true, "User not verified.", 400, null));
        } else {
          resolve(retrievedUserDetails);
        }
      });
  });
};

let findUserByToken = req => {
  return new Promise((resolve, reject) => {
    User.findOne({ resetToken: req.body.resetToken })
      .select("-_id -__v")
      .exec((err, retrievedUserDetails) => {
        if (err) {
          logger.error(
            err.message,
            "userController: updatePassword()/findUserById()",
            10
          );
          reject(
            response.generate(true, "Error while finding user.", 500, null)
          );
        } else if (check.isEmpty(retrievedUserDetails)) {
          logger.info(
            "User not found.",
            "userController:updatePassword()/findUserById()",
            7
          );
          reject(
            response.generate(true, "Password Reset Link expired.", 404, null)
          );
        } else if (
          !check.isEmpty(retrievedUserDetails) &&
          !retrievedUserDetails.isVerified
        ) {
          logger.info(
            "User not verified.",
            "userController: updatePassword()/findUserById()",
            7
          );
          reject(response.generate(true, "User not verified.", 400, null));
        } else {
          resolve(retrievedUserDetails);
        }
      });
  });
};

let validatePassword = (req, userDetails) => {
  return new Promise((resolve, reject) => {
    passwordLib.comparePassword(
      req.body.password,
      userDetails.password,
      (err, isMatched) => {
        if (err) {
          logger.error(
            err.message,
            "userController: logIn()/validatePassword()",
            10
          );
          reject(
            response.generate(true, "Failed to compare password.", 500, null)
          );
        } else if (isMatched) {
          let userDetailsObj = userDetails.toObject();
          delete userDetailsObj.password;
          delete userDetailsObj.createdOn;
          delete userDetailsObj.modifiedOn;
          delete userDetailsObj.resetToken;
          delete userDetailsObj.resetTokenExpires;
          resolve(userDetailsObj);
        } else {
          logger.info(
            "Wrong password.",
            "userController: logIn()/validatePassword()",
            7
          );
          reject(response.generate(true, "Wrong password.", 400, null));
        }
      }
    );
  });
};

let generateToken = userDetails => {
  return new Promise((resolve, reject) => {
    token.generateToken(userDetails, (err, tokenDetails) => {
      if (err) {
        logger.error(err.message, "userController: generateToken()", 10);
        reject(
          response.generate(true, "Error while generate token.", 500, null)
        );
      } else {
        tokenDetails.userId = userDetails.userId;
        tokenDetails.userDetails = userDetails;
        resolve(tokenDetails);
      }
    });
  });
};

let saveToken = tokenDetails => {
  return new Promise((resolve, reject) => {
    Auth.findOne({ userId: tokenDetails.userId })
      .exec()
      .then(retrievedTokenDetails => {
        if (check.isEmpty(retrievedTokenDetails)) {
          let newAuthToken = new Auth({
            userId: tokenDetails.userId,
            authToken: tokenDetails.token,
            tokenSecret: tokenDetails.tokenSecret,
            tokenGenerationTime: time.now()
          });
          newAuthToken.save((err, newTokenDetails) => {
            if (err) {
              logger.error(err.message, "userController: saveToken()", 10);
              reject(
                response.generate(true, "Failed to save token.", 500, null)
              );
            } else {
              let responseBody = {
                authToken: newTokenDetails.authToken,
                userDetails: tokenDetails.userDetails
              };
              resolve(responseBody);
            }
          });
        } else {
          retrievedTokenDetails.authToken = tokenDetails.token;
          retrievedTokenDetails.tokenSecret = tokenDetails.tokenSecret;
          retrievedTokenDetails.tokenGenerationTime = time.now();
          retrievedTokenDetails.save((err, newTokenDetails) => {
            if (err) {
              logger.error(err.message, "userController: saveToken()", 10);
              reject(
                response.generate(true, "Failed to save token.", 404, null)
              );
            } else {
              let responseBody = {
                authToken: newTokenDetails.authToken,
                userDetails: tokenDetails.userDetails
              };
              resolve(responseBody);
            }
          });
        }
      })
      .catch(err => {
        reject(handleError("Error while saving token.", 500, "saveToken", err));
      });
  });
};

let deleteToken = (req, res) => {
  return new Promise((resolve, reject) => {
    Auth.remove({ userId: req.user.userId }).exec((err, result) => {
      if (err) {
        logger.error(err.message, "userController: deleteToken()", 10);
        reject(response.generate(true, "Logout failed.", 500, null));
      } else if (check.isEmpty(result)) {
        logger.info(
          "User already logged out.",
          "userController:  deleteToken()",
          7
        );
        reject(response.generate(true, "User already logged out.", 404, null));
      } else {
        resolve(result);
      }
    });
  });
};

let getAll = (skip = 1) => {
  return new Promise((resolve, reject) => {
    User.find({ isVerified: true })
      .select("-_id -__v -password")
      .skip(parseInt(skip - 1) * 10)
      .limit(10)
      .lean()
      .exec((err, usersDetails) => {
        if (err) {
          logger.error(err.message, "userController: getAll()", 10);
          reject(
            response.generate(true, "Failed to find all users.", 500, null)
          );
        } else if (check.isEmpty(usersDetails)) {
          logger.info(
            "Users details not found.",
            "userController:  getAll()",
            7
          );
          reject(
            response.generate(true, "User already logged out.", 404, null)
          );
        } else {
          resolve(usersDetails);
        }
      });
  });
};

let getUser = req => {
  return new Promise((resolve, reject) => {
    User.findOne({
      $and: [{ userId: req.params.userId }, { isVerified: true }]
    })
      .select("-password -_id -__v")
      .lean()
      .exec((err, retrievedUserDetails) => {
        if (err) {
          logger.error(err.message, "userController: getUser()", 10);
          reject(response.generate(true, "Failed to find User.", 500, null));
        } else if (check.isEmpty(retrievedUserDetails)) {
          logger.info("User not found.", "userController:  getUser()", 7);
          reject(response.generate(true, "User not found.", 404, null));
        } else {
          resolve(retrievedUserDetails);
        }
      });
  });
};

/**Funtion to change user password. */
let changePassword = (req, userDetails) => {
  return new Promise((resolve, reject) => {
    let updateQuery = {
      password: passwordLib.hashPassword(req.body.newPassword)
    };

    User.updateOne({ userId: userDetails.userId }, updateQuery).exec(
      (err, result) => {
        if (err) {
          logger.error(err.message, "userLib: changePassword()", 10);
          reject(
            response.generate(true, "Failed to change password.", 500, null)
          );
        } else if (check.isEmpty(result)) {
          logger.info(
            "Failed to change password.",
            "userLib: changePassword()",
            7
          );
          reject(
            response.generate(true, "Failed to change password.", 404, null)
          );
        } else {
          setTimeout(() => mailer.sendPasswordUpdateEmail(userDetails), 2000);
          resolve(result);
        }
      }
    );
  });
};

// let updateResetToken = (userDetails) => {
//   return new Promise((resolve, reject) => {
//     let updateQuery = {
//       resetToken: null,
//       resetTokenExpires: null
//     };

//     User.updateOne({ userId: userDetails.userId }, updateQuery).exec(
//       (err, result) => {
//         if (err) {
//           logger.error(err.message, "userLib: updateResetToken()", 10);
//           reject(
//             response.generate(true, "Failed to update resetToken.", 500, null)
//           );
//         } else if (check.isEmpty(result)) {
//           logger.info(
//             "Failed to update resetToken.",
//             "userLib: updateResetToken()",
//             7
//           );
//           reject(
//             response.generate(true, "Failed to update resetToken.", 404, null)
//           );
//         } else {
//           console.log('reset token');
//           resolve(result);
//         }
//       }
//     );
//   });
// };

/**Funtion to update user password. */
let updatePassword = (req, userDetails) => {
  return new Promise((resolve, reject) => {
    if (req.body.password === req.body.confirm) {
      let updateQuery = {
        password: passwordLib.hashPassword(req.body.password),
        resetToken: undefined,
        resetTokenExpires: undefined
      };

      User.updateOne({ userId: userDetails.userId }, updateQuery).exec(
        (err, result) => {
          if (err) {
            logger.error(err.message, "userController: updatePassword()", 10);
            reject(
              response.generate(true, "Failed to update password.", 500, null)
            );
          } else if (check.isEmpty(result)) {
            logger.info(
              "Failed to update password.",
              "userController: updatePassword()",
              7
            );
            reject(
              response.generate(true, "Failed to update password.", 404, null)
            );
          } else {
            setTimeout(() => mailer.sendPasswordUpdateEmail(userDetails), 2000);
            resolve(result);
          }
        }
      );
    } else {
      logger.info(
        "Password does not matches.",
        "userController: updatePassword()",
        7
      );
      reject(response.generate(true, "Password does not matches.", 404, null));
    }
  });
};

let resetPassword = (req, tokenDetails) => {
  return new Promise((resolve, reject) => {
    let updateQuery = {
      resetToken: tokenDetails.token,
      resetTokenExpires: Date.now() + 1800000 // 30 minutes
    };
    User.updateOne({ email: req.body.email }, updateQuery).exec(
      (err, result) => {
        if (err) {
          logger.error(err.message, "userController: resetPassword()", 10);
          reject(
            response.generate(true, "Failed to reset user password.", 500, null)
          );
        } else if (check.isEmpty(result)) {
          logger.info(
            "Failed to reset user password.",
            "userController: resetPassword()",
            7
          );
          reject(
            response.generate(true, "Failed to reset user password.", 404, null)
          );
        } else {
          setTimeout(() => {
            mailer.sendPasswordResetEmail(
              tokenDetails.userDetails,
              updateQuery.resetToken
            );
          }, 2000);
          resolve(result);
        }
      }
    );
  });
};

let edit = req => {
  return new Promise((resolve, reject) => {
    let updateQuery = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      mobile: req.body.mobile
    };
    User.update({ userId: req.params.userId }, updateQuery).exec(
      (err, result) => {
        if (err) {
          logger.error(err.message, "userController: edit()", 10);
          reject(
            response.generate(true, "Failed to update user details.", 500, null)
          );
        } else if (check.isEmpty(result)) {
          logger.info("User not found.", "userController: edit()", 7);
          reject(response.generate(true, "User not found.", 404, null));
        } else {
          resolve(result);
        }
      }
    );
  });
};

let remove = req => {
  return new Promise((resolve, reject) => {
    User.remove({ userId: req.params.userId }).exec((err, result) => {
      if (err) {
        logger.error(err.message, "userController: remove()", 10);
        reject(response.generate(true, "Failed to delete user .", 500, null));
      } else if (check.isEmpty(result)) {
        logger.info("User not found.", "userController: remove()", 7);
        reject(response.generate(true, "User not found.", 404, null));
      } else {
        resolve(result);
      }
    });
  });
};

module.exports = {
  generateToken: generateToken,
  createUser: createUser,
  updatePassword: updatePassword,
  findUserByUserName: findUserByUserName,
  findUserById: findUserById,
  findUserByToken: findUserByToken,
  verifyEmail: verifyEmail,
  saveToken: saveToken,
  deleteToken: deleteToken,
  getAll: getAll,
  getUser: getUser,
  resetPassword: resetPassword,
  validatePassword: validatePassword,
  edit: edit,
  remove: remove,
  changePassword: changePassword,
  // updateResetToken: updateResetToken
};

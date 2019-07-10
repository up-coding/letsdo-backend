const response = require("./../libs/responseLib");
const userLib = require("./../libs/userLib");
const validate = require("./../libs/validateLib");
const check = require("./../libs/checkLib");

/**User SignUp Function */
let signUp = (req, res) => {
  let validateParams = (req, res) => {
    return new Promise((resolve, reject) => {
      if (
        check.isEmpty(req.body.firstName) ||
        check.isEmpty(req.body.lastName) ||
        check.isEmpty(req.body.email) ||
        check.isEmpty(req.body.userName) ||
        check.isEmpty(req.body.mobile) ||
        check.isEmpty(req.body.countryName) ||
        check.isEmpty(req.body.password)
      ) {
        reject(
          response.generate(
            true,
            "One or more parameter(s) is missing.",
            400,
            null
          )
        );
      }
      if (!validate.checkEmail(req.body.email)) {
        reject(response.generate(true, "Invalid email.", 400, null));
      } else if (!validate.checkPassword(req.body.password)) {
        reject(
          response.generate(true, "Password length required 8.", 400, null)
        );
      } else if (!validate.checkUserName(req.body.userName)) {
        reject(
          response.generate(true, "Username length required 6.", 400, null)
        );
      } else {
        resolve(req);
      }
    });
  };

  validateParams(req, res)
    .then(userLib.createUser)
    .then(result => {
      delete result.password;
      delete result._id;
      delete result.__v;
      delete result.createdOn;
      delete result.modifiedOn;
      delete result.resetToken;
      delete result.resetTokenExpires;
      res.send(
        response.generate(false, "User created successfully.", 200, result)
      );
    })
    .catch(err => {
      res.send(err);
    });
};

/**User verify Function. */
let verifyUserEmail = (req, res) => {
  let validateParams = () => {
    return new Promise((resolve, reject) => {
      if (check.isEmpty(req.body.userId)) {
        reject(response.generate(true, "Parameter(s) missing.", 400, null));
      } else {
        resolve(req);
      }
    });
  };
  validateParams(req, res)
    .then(userLib.verifyEmail)
    .then(result => {
      delete result.password;
      delete result._id;
      delete result.__v;
      delete result.createdOn;
      delete result.modifiedOn;
      res.send(
        response.generate(false, "User verfied successfully.", 200, result)
      );
    })
    .catch(err => {
      res.send(err);
    });
};

/**User login function. */
let logIn = (req, res) => {
  let validateParams = () => {
    return new Promise((resolve, reject) => {
      req.body.email
        ? (loginType = "email")
        : req.body.userName
          ? (loginType = "userName")
          : (loginType = "invalid");
      switch (loginType) {
        case "email":
          if (
            check.isEmpty(req.body.email) ||
            check.isEmpty(req.body.password)
          ) {
            reject(
              response.generate(
                true,
                "One or more parameter(s) is missing.",
                400,
                null
              )
            );
          } else if (
            !validate.checkEmail(req.body.email) ||
            !validate.checkPassword(req.body.password)
          ) {
            reject(
              response.generate(true, "Invalid email or password.", 400, null)
            );
          } else {
            resolve(req);
          }
          break;

        case "userName":
          if (
            check.isEmpty(req.body.userName) ||
            check.isEmpty(req.body.password)
          ) {
            reject(
              response.generate(
                true,
                "One or more parameter(s) is missing.",
                400,
                null
              )
            );
          } else if (
            !validate.checkUserName(req.body.userName) ||
            !validate.checkPassword(req.body.password)
          ) {
            reject(
              response.generate(
                true,
                "Invalid username or password.",
                400,
                null
              )
            );
          } else {
            resolve(req);
          }
          break;
        default:
          reject(
            response.generate(
              true,
              "One or more parameter(s) is missing.",
              400,
              null
            )
          );
          break;
      }
    });
  };
  validateParams(req, res)
    .then(userLib.findUserByUserName)
    .then(resolve => userLib.validatePassword(req, resolve))
    .then(userLib.generateToken)
    .then(userLib.saveToken)
    .then(result => {
      res.send(response.generate(false, "Login successfull.", 200, result));
    })
    .catch(err => {
      res.send(err);
    });
};

let logOut = (req, res) => {
  userLib
    .deleteToken(req, res)
    .then(result => {
      res.send(response.generate(false, "Logged out successfully.", 200, null));
    })
    .catch(err => {
      res.send(err);
    });
};

let getAllUsers = (req, res) => {
  userLib
    .getAll(req.query.skip)
    .then(result => {
      res.send(
        response.generate(false, "All users details found.", 200, result)
      );
    })
    .catch(err => {
      res.send(err);
    });
};

let getSingleUser = (req, res) => {
  userLib
    .getUser(req)
    .then(result => {
      res.send(response.generate(false, "User details found.", 200, result));
    })
    .catch(err => {
      res.send(err);
    });
};

let changeUserPassword = (req, res) => {
  let validateParams = () => {
    return new Promise((resolve, reject) => {
      if (
        check.isEmpty(req.user.userId) ||
        check.isEmpty(req.body.password) ||
        check.isEmpty(req.body.newPassword)
      ) {
        reject(
          response.generate(
            true,
            "One or more parameter(s) is missing.",
            400,
            null
          )
        );
      } else {
        resolve(req);
      }
    });
  };
  validateParams(req, res)
    .then(resolve => userLib.findUserById(resolve.user.userId))
    .then(resolve => userLib.validatePassword(req, resolve))
    .then(userDetails => userLib.changePassword(req, userDetails))
    .then(result => {
      res.send(
        response.generate(false, "Passwrod changed successfully.", 200, null)
      );
    })
    .catch(err => {
      res.send(err);
    });
};

/**
 * function to update user password.
 * body:resetToken,newPassword.
 */
let updateUserPassword = (req, res) => {
  let validateParams = () => {
    return new Promise((resolve, reject) => {
      if (
        check.isEmpty(req.body.resetToken) ||
        check.isEmpty(req.body.password) ||
        check.isEmpty(req.body.confirm)
      ) {
        reject(
          response.generate(
            true,
            "One or more parameter(s) is missing.",
            400,
            null
          )
        );
      } else {
        resolve(req);
      }
    });
  };
  validateParams(req, res)
    .then(userLib.findUserByToken)
    .then(userDetails => userLib.updatePassword(req, userDetails))
    .then(result => {
      res.send(
        response.generate(false, "Password updated successfully.", 200, null)
      );
    })
    .catch(err => {
      res.send(err);
    });
};

/**
 * function to reset user password.
 * body:email
 */
let resetUserPassword = (req, res) => {
  let validateParams = () => {
    return new Promise((resolve, reject) => {
      if (check.isEmpty(req.body.email)) {
        reject(
          response.generate(
            true,
            "One or more parameter(s) is missing.",
            400,
            null
          )
        );
      } else {
        resolve(req);
      }
    });
  };
  validateParams(req, res)
    .then(userLib.findUserByUserName)
    .then(userDetails => userLib.generateToken(userDetails))
    .then(tokenDetails => userLib.resetPassword(req, tokenDetails))
    .then(result => {
      res.send(
        response.generate(
          false,
          "Password reset email sent successfully.",
          200,
          null
        )
      );
    })
    .catch(err => {
      res.send(err);
    });
};

/**
 * function to edit user details.
 * params:userId,
 * body:firstName,lastName,mobile
 */
let editUserDetails = (req, res) => {
  let validateParams = () => {
    return new Promise((resolve, reject) => {
      if (
        check.isEmpty(req.body.firstName) ||
        check.isEmpty(req.body.lastName) ||
        check.isEmpty(req.body.mobile) ||
        check.isEmpty(req.user.userId)
      ) {
        reject(
          response.generate(
            true,
            "One or more parameter(s) is missing.",
            400,
            null
          )
        );
      }
      {
        resolve(req);
      }
    });
  };
  validateParams(req, res)
    .then(userLib.edit)
    .then(result => {
      res.send(
        response.generate(
          false,
          "User details updated successfully.",
          200,
          null
        )
      );
    })
    .catch(err => {
      res.send(err);
    });
};

/**
 * function to delete user.
 * params:userId
 */
let deleteUser = (req, res) => {
  let validateParams = () => {
    return new Promise((resolve, reject) => {
      if (check.isEmpty(req.params.userId)) {
        reject(response.generate(true, "Parameter is missing.", 400, null));
      } else {
        resolve(req);
      }
    });
  };
  validateParams(req, res)
    .then(userLib.remove)
    .then(result => {
      res.send(
        response.generate(false, "User deleted successfully.", 200, null)
      );
    })
    .catch(err => {
      res.send(err);
    });
};

module.exports = {
  signUp: signUp,
  logIn: logIn,
  logOut: logOut,
  verifyUserEmail: verifyUserEmail,
  getSingleUser: getSingleUser,
  getAllUsers: getAllUsers,
  updateUserPassword: updateUserPassword,
  resetUserPassword: resetUserPassword,
  changeUserPassword: changeUserPassword,
  editUserDetails: editUserDetails,
  deleteUser: deleteUser
};

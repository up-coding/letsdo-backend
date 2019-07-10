/**Libraries */
const listLib = require("./../libs/listLib");
const response = require("./../libs/responseLib");
const check = require("./../libs/checkLib");
const userLib = require("./../libs/userLib");
const logger = require("./../libs/loggerLib");

/**Models */
const User = require("./../models/User");

/**
 * This function returns all friend request.
 */
let getAllSentRequest = (req, res) => {
  let findUser = () => {
    return new Promise((resolve, reject) => {
      User.find({ userId: req.params.userId })
        .select("friendRequestSent")
        .lean()
        .exec((err, allSentRequests) => {
          if (err) {
            logger.error(err.message, "multiUserController: findUser()", 10);
            reject(response.generate(true, "Failed to find user.", 500, null));
          } else if (check.isEmpty(allSentRequests)) {
            logger.info(
              "User not found.",
              "multiUserController: findUser()",
              7
            );
            reject(response.generate(true, "User not found.", 404, null));
          } else {
            resolve(allSentRequests);
          }
        });
    });
  };

  findUser(req, res)
    .then(result => {
      res.send(
        response.generate(false, "All sent requests found.", 200, result)
      );
    })
    .catch(err => {
      res.send(err);
    });
};

/**
 * This function returns all friend request.
 */
let getAllReceivedRequest = (req, res) => {
  let findUser = () => {
    return new Promise((resolve, reject) => {
      User.find({ userId: req.params.userId })
        .select("friendRequestRecieved")
        .lean()
        .exec((err, allReceivedRequests) => {
          if (err) {
            logger.error(err.message, "multiUserController: findUser()", 10);
            reject(
              response.generate(
                true,
                "Failed to find received requests.",
                500,
                null
              )
            );
          } else if (check.isEmpty(allReceivedRequests)) {
            logger.info(
              "Received requests not found.",
              "multiUserController: findUser()",
              7
            );
            reject(
              response.generate(true, "Received requests not found.", 404, null)
            );
          } else {
            resolve(allReceivedRequests);
          }
        });
    });
  };

  findUser(req, res)
    .then(result => {
      res.send(
        response.generate(false, "All received requests found.", 200, result)
      );
    })
    .catch(err => {
      res.send(err);
    });
};

let sendFriendRequest = (req, res) => {
  let validateUserInput = () => {
    return new Promise((resolve, reject) => {
      if (
        check.isEmpty(req.body.senderId) ||
        check.isEmpty(req.body.senderName) ||
        check.isEmpty(req.body.receiverId) ||
        check.isEmpty(req.body.receiverName)
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

  let checkRequest = userDetails => {
    return new Promise((resolve, reject) => {
      userDetails.friendRequestSent.forEach(obj => {
        if (obj.friendId === req.body.receiverId) {
          reject(response.generate(true, "Request already sent.", 404, null));
        }
      });
      resolve(req);
    });
  };

  let updateSender = () => {
    return new Promise((resolve, reject) => {
      let subOptions = {
        friendId: req.body.receiverId,
        friendName: req.body.receiverName
      };

      let options = {
        $push: {
          friendRequestSent: { $each: [subOptions] }
        }
      };
      User.updateOne({ userId: req.body.senderId }, options).exec(
        (err, result) => {
          if (err) {
            logger.error(
              err.message,
              "multiUserController: sendFriendRequest()/updateSender()",
              10
            );
            reject(
              response.generate(true, "Failed to update sender.", 500, null)
            );
          } else if (check.isEmpty(result)) {
            logger.info(
              "Sender not found.",
              "multiUserController: sendFriendRequest()/updateSender()",
              7
            );
            reject(response.generate(true, "Sender not found.", 404, null));
          } else {
            resolve(result);
          }
        }
      );
    });
  };

  let updateReceiver = () => {
    return new Promise((resolve, reject) => {
      let subOptions = {
        friendId: req.body.senderId,
        friendName: req.body.senderName
      };

      let options = {
        $push: {
          friendRequestRecieved: { $each: [subOptions] }
        }
      };
      User.updateOne({ userId: req.body.receiverId }, options).exec(
        (err, result) => {
          if (err) {
            logger.error(
              err.message,
              "multiUserController: sendFriendRequest()/updateReceiver()",
              10
            );
            reject(
              response.generate(true, "Failed to update receiver.", 500, null)
            );
          } else if (check.isEmpty(result)) {
            logger.info(
              "Receiver not found.",
              "multiUserController: sendFriendRequest()/updateSender()",
              7
            );
            reject(response.generate(true, "Receiver not found.", 404, null));
          } else {
            resolve(result);
          }
        }
      );
    });
  };

  validateUserInput(req, res)
    .then(resolve => userLib.findUserById(resolve.body.senderId))
    .then(resolve => checkRequest(resolve))
    .then(updateSender)
    .then(updateReceiver)
    .then(result => {
      res.send(response.generate(false, "Friend request sent.", 200, null));
    })
    .catch(err => {
      res.send(err);
    });
};

let acceptFriendRequest = (req, res) => {
  let validateUserInput = () => {
    return new Promise((resolve, reject) => {
      if (
        check.isEmpty(req.body.senderId) ||
        check.isEmpty(req.body.senderName) ||
        check.isEmpty(req.body.receiverId) ||
        check.isEmpty(req.body.receiverName)
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

  let updateSenderFriendList = () => {
    return new Promise((resolve, reject) => {
      let subOptions = {
        friendId: req.body.receiverId,
        friendName: req.body.receiverName
      };

      let options = {
        $push: {
          friends: { $each: [subOptions] }
        }
      };
      User.updateOne({ userId: req.body.senderId }, options).exec(
        (err, result) => {
          if (err) {
            logger.error(
              err.message,
              "multiUserController: acceptFriendRequest()/updateSenderFriendList()",
              10
            );
            reject(
              response.generate(
                true,
                "Failed to update sender friends list.",
                500,
                null
              )
            );
          } else if (check.isEmpty(result)) {
            logger.info(
              "Sender not found.",
              "multiUserController: acceptFriendRequest()/updateSenderFriendList()",
              7
            );
            reject(response.generate(true, "Sender not found.", 404, null));
          } else {
            resolve(result);
          }
        }
      );
    });
  };

  let updateReceiverFriendList = () => {
    return new Promise((resolve, reject) => {
      let subOptions = {
        friendId: req.body.senderId,
        friendName: req.body.senderName
      };

      let options = {
        $push: {
          friends: { $each: [subOptions] }
        }
      };
      User.updateOne({ userId: req.body.receiverId }, options).exec(
        (err, result) => {
          if (err) {
            logger.error(
              err.message,
              "multiUserController: acceptFriendRequest()/updateReceiverFriendList()",
              10
            );
            reject(
              response.generate(
                true,
                "Failed to update receiver friends list.",
                500,
                null
              )
            );
          } else if (check.isEmpty(result)) {
            logger.info(
              "Receiver not found.",
              "multiUserController: acceptFriendRequest()/updateReceiverFriendList()",
              7
            );
            reject(response.generate(true, "Receiver not found.", 404, null));
          } else {
            resolve(result);
          }
        }
      );
    });
  };

  let updateSenderSentRequests = () => {
    return new Promise((resolve, reject) => {
      let options = {
        $pull: {
          friendRequestSent: { friendId: req.body.receiverId }
        }
      };
      User.updateOne({ userId: req.body.senderId }, options).exec(
        (err, result) => {
          if (err) {
            logger.error(
              err.message,
              "multiUserController: acceptFriendRequest()/updateSenderSentRequests()",
              10
            );
            reject(
              response.generate(
                true,
                "Failed to update sender send request.",
                500,
                null
              )
            );
          } else if (check.isEmpty(result)) {
            logger.info(
              "Sender not found.",
              "multiUserController: acceptFriendRequest()/updateSenderSentRequests()",
              7
            );
            reject(response.generate(true, "Sender not found.", 404, null));
          } else {
            resolve(result);
          }
        }
      );
    });
  };

  let updateReceiverReceivedRequests = () => {
    return new Promise((resolve, reject) => {
      let options = {
        $pull: {
          friendRequestReceived: { friendId: req.body.senderId }
        }
      };
      User.updateOne({ userId: req.body.receiverId }, options).exec(
        (err, result) => {
          if (err) {
            logger.error(
              err.message,
              "multiUserController: acceptFriendRequest()/updateReceiverReceivedRequests()",
              10
            );
            reject(
              response.generate(
                true,
                "Failed to update receiver received request.",
                500,
                null
              )
            );
          } else if (check.isEmpty(result)) {
            logger.info(
              "Receiver not found.",
              "multiUserController: acceptFriendRequest()/updateReceiverReceivedRequests()",
              7
            );
            reject(response.generate(true, "Receiver not found.", 404, null));
          } else {
            resolve(result);
          }
        }
      );
    });
  };

  validateUserInput(req, res)
    .then(updateSenderFriendList)
    .then(updateReceiverFriendList)
    .then(updateSenderSentRequests)
    .then(updateReceiverReceivedRequests)
    .then(result => {
      res.send(response.generate(true, "Friend request accepted.", 200, null));
    })
    .catch(err => {
      res.send(err);
    });
};

let rejectFriendRequest = (req, res) => {
  let validateUserInput = () => {
    return new Promise((resolve, reject) => {
      if (
        check.isEmpty(req.body.senderId) ||
        check.isEmpty(req.body.senderName) ||
        check.isEmpty(req.body.receiverId) ||
        check.isEmpty(req.body.receiverName)
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

  let updateSenderSentRequests = () => {
    return new Promise((resolve, reject) => {
      let options = {
        $pull: {
          friendRequestSent: { friendId: req.body.receiverId }
        }
      };
      User.updateOne({ userId: req.body.senderId }, options).exec(
        (err, result) => {
          if (err) {
            logger.error(
              err.message,
              "multiUserController: acceptFriendRequest()/updateSenderSentRequests()",
              10
            );
            reject(
              response.generate(
                true,
                "Failed to update sender send request.",
                500,
                null
              )
            );
          } else if (check.isEmpty(result)) {
            logger.info(
              "Sender not found.",
              "multiUserController: acceptFriendRequest()/updateSenderSentRequests()",
              7
            );
            reject(response.generate(true, "Sender not found.", 404, null));
          } else {
            resolve(result);
          }
        }
      );
    });
  };

  let updateReceiverReceivedRequests = () => {
    return new Promise((resolve, reject) => {
      let options = {
        $pull: {
          friendRequestRecieved: { friendId: req.body.senderId }
        }
      };

      User.updateOne({ userId: req.body.receiverId }, options).exec(
        (err, result) => {
          if (err) {
            logger.error(
              err.message,
              "multiUserController: acceptFriendRequest()/updateReceiverReceivedRequests()",
              10
            );
            reject(
              response.generate(
                true,
                "Failed to update receiver received request.",
                500,
                null
              )
            );
          } else if (check.isEmpty(result)) {
            logger.info(
              "Receiver not found.",
              "multiUserController: acceptFriendRequest()/updateReceiverReceivedRequests()",
              7
            );
            reject(response.generate(true, "Receiver not found.", 404, null));
          } else {
            resolve(result);
          }
        }
      );
    });
  };

  validateUserInput(req, res)
    .then(updateSenderSentRequests)
    .then(updateReceiverReceivedRequests)
    .then(result => {
      res.send(response.generate(true, "Friend request rejected.", 200, null));
    })
    .catch(err => {
      res.send(err);
    });
};

let cancelFriendRequest = (req, res) => {
  let validateUserInput = () => {
    return new Promise((resolve, reject) => {
      if (
        check.isEmpty(req.body.senderId) ||
        check.isEmpty(req.body.senderName) ||
        check.isEmpty(req.body.receiverId) ||
        check.isEmpty(req.body.receiverName)
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

  let updateSender = () => {
    return new Promise((resolve, reject) => {
      let subOptions = {
        friendId: req.body.receiverId,
        friendName: req.body.receiverName
      };

      let options = {
        $pull: {
          friendRequestSent: { subOptions }
        }
      };
      User.updateOne({ userId: req.body.senderId }, options).exec(
        (err, result) => {
          if (err) {
            logger.error(
              err.message,
              "multiUserController: sendFriendRequest()/updateSender()",
              10
            );
            reject(
              response.generate(true, "Failed to update sender.", 500, null)
            );
          } else if (check.isEmpty(result)) {
            logger.info(
              "Sender not found.",
              "multiUserController: sendFriendRequest()/updateSender()",
              7
            );
            reject(response.generate(true, "Sender not found.", 404, null));
          } else {
            resolve(result);
          }
        }
      );
    });
  };

  let updateReceiver = () => {
    return new Promise((resolve, reject) => {
      let subOptions = {
        friendId: req.body.senderId,
        friendName: req.body.senderName
      };

      let options = {
        $pull: {
          friendRequestReceived: { subOptions }
        }
      };
      User.updateOne({ userId: req.body.receiverId }, options).exec(
        (err, result) => {
          if (err) {
            logger.error(
              err.message,
              "multiUserController: sendFriendRequest()/updateReceiver()",
              10
            );
            reject(
              response.generate(true, "Failed to update receiver.", 500, null)
            );
          } else if (check.isEmpty(result)) {
            logger.info(
              "Receiver not found.",
              "multiUserController: sendFriendRequest()/updateSender()",
              7
            );
            reject(response.generate(true, "Receiver not found.", 404, null));
          } else {
            resolve(result);
          }
        }
      );
    });
  };

  validateUserInput(req, res)
    .then(updateSender)
    .then(updateReceiver)
    .then(result => {
      res.send(response.generate(false, "Friend request canceled.", 200, null));
    })
    .catch(err => {
      res.send(err);
    });
};

let unfriend = (req, res) => {
  let validateUserInput = () => {
    return new Promise((resolve, reject) => {
      if (
        check.isEmpty(req.body.senderId) ||
        check.isEmpty(req.body.senderName) ||
        check.isEmpty(req.body.receiverId) ||
        check.isEmpty(req.body.receiverName)
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

  let updateSenderFriendList = () => {
    return new Promise((resolve, reject) => {
      let subOptions = {
        friendId: req.body.receiverId,
        friendName: req.body.receiverName
      };

      let options = {
        $pull: {
          friends: { subOptions }
        }
      };
      User.updateOne({ userId: req.body.senderId }, options).exec(
        (err, result) => {
          if (err) {
            logger.error(
              err.message,
              "multiUserController: acceptFriendRequest()/updateSenderFriendList()",
              10
            );
            reject(
              response.generate(
                true,
                "Failed to update sender friends list.",
                500,
                null
              )
            );
          } else if (check.isEmpty(result)) {
            logger.info(
              "Sender not found.",
              "multiUserController: acceptFriendRequest()/updateSenderFriendList()",
              7
            );
            reject(response.generate(true, "Sender not found.", 404, null));
          } else {
            resolve(result);
          }
        }
      );
    });
  };

  let updateReceiverFriendList = () => {
    return new Promise((resolve, reject) => {
      let subOptions = {
        friendId: req.body.senderId,
        friendName: req.body.senderName
      };

      let options = {
        $pull: {
          friends: { subOptions }
        }
      };
      User.updateOne({ userId: req.body.receiverId }, options).exec(
        (err, result) => {
          if (err) {
            logger.error(
              err.message,
              "multiUserController: acceptFriendRequest()/updateReceiverFriendList()",
              10
            );
            reject(
              response.generate(
                true,
                "Failed to update receiver friends list.",
                500,
                null
              )
            );
          } else if (check.isEmpty(result)) {
            logger.info(
              "Receiver not found.",
              "multiUserController: acceptFriendRequest()/updateReceiverFriendList()",
              7
            );
            reject(response.generate(true, "Receiver not found.", 404, null));
          } else {
            resolve(result);
          }
        }
      );
    });
  };

  validateUserInput(req, res)
    .then(updateSenderFriendList)
    .then(updateReceiverFriendList)
    .then(result => {
      res.send(response.generate(false, "User unfriend.", 200, null));
    })
    .catch(err => {
      res.send(err);
    });
};

module.exports = {
  getAllSentRequest: getAllSentRequest,
  getAllReceivedRequest: getAllReceivedRequest,
  sendFriendRequest: sendFriendRequest,
  acceptFriendRequest: acceptFriendRequest,
  rejectFriendRequest: rejectFriendRequest,
  cancelFriendRequest: cancelFriendRequest,
  unfriend: unfriend
};

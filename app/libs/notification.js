const Notification = require("../models/Notification");
const event = require("./eventsLib");
const logger = require("./loggerLib");
const shortId = require("shortid");
const response = require("./responseLib");

const createNotification = obj => {
  return new Promise((resolve, reject) => {
    let newNotification = new Notification({
      notificationId: shortId.generate(),
      userId: obj.userId,
      userName: obj.userName,
      creatorId: obj.creatorId,
      creatorName: obj.creatorName,
      createdOn: Date.now(),
      data: obj.data,
      type: obj.type
    });

    newNotification.save((err, result) => {
      if (err) {
        logger.error(err.message, "notification.js: createNotification()", 10);
        reject(
          response.generate(
            true,
            "Error while creating notification.",
            500,
            null
          )
        );
      } else {
        event.emit(newNotification.type, result);
        resolve(result.toObject());
      }
    });
  }).catch(err => {
    logger.error(err.message);
  });
};

module.exports = {
  createNotification: createNotification
};

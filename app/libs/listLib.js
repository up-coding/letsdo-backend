/**Libraries */
const logger = require("./loggerLib");
const response = require("./responseLib");
const check = require("./checkLib");
const time = require("./timeLib");
const shortId = require("shortid");
/**Models */
const List = require("./../models/List");
const Notification = require("./../models/Notification");

let findLists = userDetails => {
  return new Promise((resolve, reject) => {
    List.find({ creatorId: userDetails.userId })
      .select("-_id -__v")
      .sort("-createdOn")
      .lean()
      .exec((err, listDetails) => {
        if (err) {
          logger.error(err.message, "listLib: findLists()", 10);
          reject(response.generate(true, "Failed to find lists.", 500, null));
        } else if (check.isEmpty(listDetails)) {
          logger.info("list not found.", "listLib: findLists()", 7);
          reject(response.generate(true, "list not found.", 404, null));
        } else {
          resolve(listDetails);
        }
      });
  });
};

let findPrivateLists = userDetails => {
  return new Promise((resolve, reject) => {
    List.find({ creatorId: userDetails.userId, mode: "private" })
      .select("-_id -__v")
      .sort("-createdOn")
      .lean()
      .exec((err, listDetails) => {
        if (err) {
          logger.error(err.message, "listLib: findLists()", 10);
          reject(response.generate(true, "Failed to find lists.", 500, null));
        } else if (check.isEmpty(listDetails)) {
          logger.info("list not found.", "listLib: findLists()", 7);
          reject(response.generate(true, "list not found.", 404, null));
        } else {
          resolve(listDetails);
        }
      });
  });
};

let findPublicLists = userDetails => {
  return new Promise((resolve, reject) => {
    List.find({ creatorId: userDetails.userId, mode: "public" })
      .select()
      .lean()
      .exec((err, listDetails) => {
        if (err) {
          logger.error(err.message, "listLib: findPublicLists()", 10);
          reject(response.generate(true, "Failed to find lists.", 500, null));
        } else if (check.isEmpty(listDetails)) {
          logger.info("list not found.", "listLib: findPublicLists()", 7);
          reject(response.generate(true, "list not found.", 404, null));
        } else {
          resolve(listDetails);
        }
      });
  });
};

let update = (req, listDetails) => {
  return new Promise((resolve, reject) => {
    let options = req.body;
    options.modifiedOn = time.now();
    List.update({ listId: listDetails.listId }, options).exec(
      (err, listDetails) => {
        if (err) {
          logger.error(err.message, "listLib: findPublicLists()", 10);
          reject(response.generate(true, "Failed to find lists.", 500, null));
        } else if (check.isEmpty(listDetails)) {
          logger.info("list not found.", "listLib: findPublicLists()", 7);
          reject(response.generate(true, "list not found.", 404, null));
        } else {
          resolve(listDetails);
        }
      }
    );
  });
};

let findSingleList = listId => {
  return new Promise((resolve, reject) => {
    List.findOne({ listId: listId }).exec((err, listDetails) => {
      if (err) {
        logger.error(err.message, "listController: getList()", 10);
        reject(response.generate(true, "Failed to find lists.", 500, null));
      } else if (check.isEmpty(listDetails)) {
        logger.info("list not found.", "listController: getList()", 7);
        reject(response.generate(true, "list not found.", 404, null));
      } else {
        delete listDetails._id;
        delete listDetails.__v;

        resolve(listDetails);
      }
    });
  });
};

let create = req => {
  return new Promise((resolve, reject) => {
    let newList = new List({
      listId: shortId.generate(),
      listName: req.body.listName,
      creatorId: req.body.creatorId,
      creatorName: req.body.creatorName,
      modifierId: req.body.modifierId,
      modifierName: req.body.modifierName,
      mode: req.body.mode,
      createdOn: time.now(),
      modifiedOn: time.now()
    });

    newList.save((err, result) => {
      if (err) {
        logger.error(err.message, "listLib: create()", 10);
        reject(response.generate(true, "Failed to create list.", 500, null));
      } else {
        resolve(newList.toObject());
      }
    });
  });
};

let findNotifications = userDetails => {
  return new Promise((resolve, reject) => {
    Notification.find({ userId: userDetails.userId })
      .select("-_id -__v -type")
      .sort("-createdOn")
      .lean()
      .exec((err, notifications) => {
        if (err) {
          logger.error(err.message, "listLib: findNotifications()", 10);
          reject(
            response.generate(true, "Failed to find notifications.", 500, null)
          );
        } else if (check.isEmpty(notifications)) {
          logger.info(
            "Notifications not found.",
            "listLib: findNotifications()",
            7
          );
          reject(
            response.generate(true, "Notifications not found.", 404, null)
          );
        } else {
          resolve(notifications);
        }
      });
  });
};

module.exports = {
  findLists: findLists,
  findSingleList: findSingleList,
  findPublicLists: findPublicLists,
  findPrivateLists: findPrivateLists,
  update: update,
  create: create,
  findNotifications: findNotifications
};

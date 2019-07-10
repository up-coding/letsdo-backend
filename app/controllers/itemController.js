const listLib = require("./../libs/listLib");
const response = require("./../libs/responseLib");
const check = require("./../libs/checkLib");
const itemLib = require("./../libs/itemLib");
const time = require("./../libs/timeLib");
const logger = require("./../libs/loggerLib");
const notification = require("./../libs/notification");
const shortId = require("shortid");

/**Models */
const Item = require("./../models/Item");

let getAllItems = (req, res) => {
  listLib
    .findSingleList(req.params.listId)
    .then(itemLib.findItems)
    .then(result => {
      res.send(response.generate(false, "All items found.", 200, result));
    })
    .catch(err => {
      res.send(err);
    });
};

let getSingleItem = (req, res) => {
  itemLib
    .findItem(req.params.itemId)
    .then(result => {
      res.send(response.generate(false, "Item found.", 200, result));
    })
    .catch(err => {
      res.send(err);
    });
};

let deleteItem = (req, res) => {
  return new Promise((resolve, reject) => {
    Item.findOneAndRemove({ itemId: req.params.itemId }).exec((err, result) => {
      if (err) {
        logger.error(err.message, "itemController: deleteItem()", 10);
        res.send(response.generate(true, "Failed to find item.", 500, null));
      } else if (check.isEmpty(result)) {
        logger.info("Item not found.", "itemController: deleteItem()", 7);
        res.send(response.generate(true, "Item not found.", 404, null));
      } else {
        res.send(response.generate(false, "Item deleted.", 200, null));
      }
    });
  });
};

let updateItem = (req, res) => {
  itemLib
    .update(req)
    .then(result => {
      let obj = {
        userId: req.body.friendId,
        userName: req.body.friendName,
        creatorId: req.body.itemModifierId,
        creatorName: req.body.itemModifierName,
        data: `Task "${req.body.itemName}" is updated by "${
          req.body.itemModifierName
        }"`,
        type: "Update-user"
      };
      notification.createNotification(obj);
      res.send(response.generate(false, "Item updated.", 200, null));
    })
    .catch(err => {
      res.send(err);
    });
};

let createItem = (req, res) => {
  let validateUserInput = () => {
    return new Promise((resolve, reject) => {
      if (
        check.isEmpty(req.body.listId) ||
        check.isEmpty(req.body.itemName) ||
        check.isEmpty(req.body.itemCreatorId) ||
        check.isEmpty(req.body.itemCreatorName) ||
        check.isEmpty(req.body.itemModifierId) ||
        check.isEmpty(req.body.itemModifierName)
      ) {
        reject(
          response.generate(true, "One or more field(s) is empty.", 400, null)
        );
      } else {
        resolve(req);
      }
    });
  };

  validateUserInput(req, res)
    .then(resolve => listLib.findSingleList(resolve.body.listId))
    .then(resolve => itemLib.create(req, resolve))
    .then(result => {
      delete result._id;
      delete result.__v;
      res.send(response.generate(false, "Item created.", 200, result));
    })
    .catch(err => {
      res.send(err);
    });
};

/**
 * This function returns the subItem details.
 */
let getSubItem = (req, res) => {
  itemLib
    .findItem(req)
    .then(itemLib.findSubItem(req.body.subItemId))
    .then(result => {
      res.send(response.generate(false, "Sub item found.", 200, result));
    })
    .catch(err => {
      res.send(err);
    });
};

/**
 * This function creates new subItem.
 */
let createSubItem = (req, res) => {
  let updateItem = (req, itemDetails) => {
    return new Promise((resolve, reject) => {
      let subOptions = {
        subItemId: shortId.generate(),
        subItemName: req.body.subItemName,
        subItemCreatorId: req.body.subItemCreatorId,
        subItemCreatorName: req.body.subItemCreatorName,
        subItemModifierId: req.body.subItemModifierId,
        subItemModifierName: req.body.subItemModifierName,
        subItemCreatedOn: time.now(),
        subItemModifiedOn: time.now()
      };

      let options = {
        $push: {
          subItems: {
            $each: [subOptions]
          }
        }
      };
      options.itemModifiedOn = time.now();
      options.itemModifierId = req.body.subItemmodifierId;
      options.itemModifierName = req.body.subItemmodifierName;
      Item.update({ itemId: itemDetails.itemId }, options).exec(
        (err, result) => {
          if (err) {
            logger.error(err.message, "itemController: createSubItem()", 10);
            reject(
              response.generate(true, "Failed to create sub item.", 500, null)
            );
          } else if (check.isEmpty(result)) {
            logger.info(
              "sub item not found.",
              "itemController: createSubItem()",
              7
            );
            reject(response.generate(true, "Sub item not found.", 404, null));
          } else {
            resolve(result);
          }
        }
      );
    });
  };

  itemLib
    .findItem(req.body.itemId)
    .then(resolve => updateItem(req, resolve))
    .then(result => {
      res.send(response.generate(false, "Sub item created.", 200, null));
    })
    .catch(err => {
      res.send(err);
    });
};

let deleteSubItem = (req, res) => {
  let updateItem = () => {
    return new Promise((resolve, reject) => {
      let options = {
        $pull: {
          subItems: {
            subItemId: req.body.subItemId
          }
        }
      };
      options.itemModifiedOn = time.now();
      options.itemModifierId = req.body.subItemModifierId;
      options.itemModifierName = req.body.subItemModifierName;

      Item.update({ itemId: req.params.itemId }, options).exec(
        (err, result) => {
          if (err) {
            logger.error(err.message, "itemController: deleteSubItem()", 10);
            reject(
              response.generate(true, "Failed to delete sub item.", 500, null)
            );
          } else if (check.isEmpty(result)) {
            logger.info(
              "sub item not found.",
              "itemController: deleteSubItem()",
              7
            );
            reject(response.generate(true, "Sub item not found.", 404, null));
          } else {
            resolve(result);
          }
        }
      );
    });
  };

  itemLib
    .findItem(req.params.itemId)
    .then(updateItem)
    .then(result => {
      res.send(response.generate(false, "Sub item deleted.", 200, null));
    })
    .catch(err => {
      res.send(err);
    });
};

let updateSubItem = (req, res) => {
  let updateItem = () => {
    return new Promise((resolve, reject) => {
      let options = {
        $set: {
          "subItems.$.subItemName": req.body.subItemName,
          "subItems.$.subItemModifierId": req.body.subItemModifierId,
          "subItems.$.subItemModifierName": req.body.subItemModifierName,
          "subItems.$.subItemDone": req.body.subItemDone,
          "subItems.$.subItemModifiedOn": time.now()
        }
      };

      options.itemModifiedOn = time.now();
      options.itemModifierId = req.body.subItemModifierId;
      options.itemModifierName = req.body.subItemModifierName;

      Item.update(
        { itemId: req.params.itemId, "subItems.subItemId": req.body.subItemId },
        options
      ).exec((err, result) => {
        if (err) {
          logger.error(err.message, "itemController: updateSubItem()", 10);
          reject(
            response.generate(true, "Failed to update sub item.", 500, null)
          );
        } else if (check.isEmpty(result)) {
          logger.info(
            "sub item not found.",
            "itemController: updateSubItem()",
            7
          );
          reject(response.generate(true, "Sub item not found.", 404, null));
        } else {
          resolve(result);
        }
      });
    });
  };

  itemLib
    .findItem(req.params.itemId)
    .then(updateItem)
    .then(result => {
      let obj = {
        userId: req.body.friendId,
        userName: req.body.friendName,
        creatorId: req.body.modifierId,
        creatorName: req.body.modifierName,
        data: `Subtask "${req.body.subItemName}" is updated by "${
          req.body.subItemModifierName
        }"`,
        type: "Update-user"
      };
      notification.createNotification(obj);
      res.send(response.generate(false, "Sub item updated.", 200, null));
    })
    .catch(err => {
      res.send(err);
    });
};
module.exports = {
  getAllItems: getAllItems,
  getSingleItem: getSingleItem,
  deleteItem: deleteItem,
  updateItem: updateItem,
  createItem: createItem,
  getSubItem: getSubItem,
  createSubItem: createSubItem,
  updateSubItem: updateSubItem,
  deleteSubItem: deleteSubItem
};

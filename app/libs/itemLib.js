/**Libraries */
const logger = require("./loggerLib");
const response = require("./responseLib");
const check = require("./checkLib");
const time = require("./timeLib");
const shortId = require("shortid");
/**Models */
const Item = require("./../models/Item");

let findItems = listDetails => {
  return new Promise((resolve, reject) => {
    Item.find({ listId: listDetails.listId })
      .select("-_id -__v")
      .lean()
      .exec((err, itemsDetails) => {
        if (err) {
          logger.error(err.message, "itemLib: findItems()", 10);
          reject(response.generate(true, "Failed to find items.", 500, null));
        } else if (check.isEmpty(itemsDetails)) {
          logger.info("Items not found.", "itemLib: findItems()", 7);
          reject(response.generate(true, "Items not found.", 404, null));
        } else {
          resolve(itemsDetails);
        }
      });
  });
};

let findItem = itemId => {
  return new Promise((resolve, reject) => {
    Item.findOne({ itemId: itemId })
      .select("-_id -__v")
      .lean()
      .exec((err, itemDetails) => {
        if (err) {
          logger.error(err.message, "itemLib: findItem()", 10);
          reject(response.generate(true, "Failed to find item.", 500, null));
        } else if (check.isEmpty(itemDetails)) {
          logger.info("Item not found.", "itemLib: findItem()", 7);
          reject(response.generate(true, "Item not found.", 404, null));
        } else {
          resolve(itemDetails);
        }
      });
  });
};

let update = req => {
  return new Promise((resolve, reject) => {
    let options = req.body;
    options.modifiedOn = time.now();
    Item.update({ itemId: req.params.itemId }, options).exec((err, result) => {
      if (err) {
        logger.error(err.message, "itemLib: update()", 10);
        reject(response.generate(true, "Failed to update item.", 500, null));
      } else if (check.isEmpty(result)) {
        logger.info("Item not found.", "itemLib: update()", 7);
        reject(response.generate(true, "Item not found.", 404, null));
      } else {
        resolve(result);
      }
    });
  });
};

let create = (req, listDetails) => {
  return new Promise((resolve, reject) => {
    let newItem = new Item({
      itemId: shortId.generate(),
      listId: listDetails.listId,
      itemName: req.body.itemName,
      itemCreatorId: req.body.itemCreatorId,
      itemCreatorName: req.body.itemCreatorName,
      itemModifierId: req.body.itemModifierId,
      itemModifierName: req.body.itemModifierName,
      itemCreatedOn: time.now(),
      itemModifiedOn: time.now()
    });

    newItem.save((err, newItem) => {
      if (err) {
        logger.error(err.message, "itemLib: create()", 10);
        reject(response.generate(true, "Failed to create item.", 500, null));
      } else {
        resolve(newItem.toObject());
      }
    });
  });
};

let findSubItem = subItemId => {
  return new Promise((resolve, reject) => {
    Item.findOne({ subItems: { $elemMatch: subItemId } }).exec(
      (err, subItemDetails) => {
        if (err) {
          logger.error(err.message, "itemLib: findSubItem()", 10);
          reject(
            response.generate(true, "Failed to find sub item.", 500, null)
          );
        } else if (check.isEmpty(subItemDetails)) {
          logger.info("Sub item not found.", "itemLib: findSubItem()", 7);
          reject(response.generate(true, "Sub item not found.", 404, null));
        } else {
          resolve(subItemDetails);
        }
      }
    );
  });
};
module.exports = {
  findItems: findItems,
  findItem: findItem,
  update: update,
  create: create,
  findSubItem: findSubItem
};

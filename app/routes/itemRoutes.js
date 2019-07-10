const express = require("express");
const router = express.Router();
const itemController = require("./../controllers/itemController");
const appConfig = require("./../../config/appConfig");
const auth = require("./../middlewares/auth");

module.exports.setRouter = app => {
  let baseUrl = `${appConfig.apiVersion}/items`;

  app.post(
    `${baseUrl}/create-item`,
    auth.isAuthorized,
    itemController.createItem
  );
  app.post(
    `${baseUrl}/delete-item/:itemId`,
    auth.isAuthorized,
    itemController.deleteItem
  );
  app.post(
    `${baseUrl}/view/all/public/list`,
    auth.isAuthorized,
    itemController.getAllItems
  );

  app.put(
    `${baseUrl}/update-item/:itemId`,
    auth.isAuthorized,
    itemController.updateItem
  );
  app.put(
    `${baseUrl}/create-sub-item`,
    auth.isAuthorized,
    itemController.createSubItem
  );

  app.put(
    `${baseUrl}/update-sub-item/:itemId`,
    auth.isAuthorized,
    itemController.updateSubItem
  );

  app.put(
    `${baseUrl}/delete-sub-item/:itemId`,
    auth.isAuthorized,
    itemController.deleteSubItem
  );
  app.get(
    `${baseUrl}/view/all/:listId`,
    auth.isAuthorized,
    itemController.getAllItems
  );

  app.get(
    `${baseUrl}/view/all/sub-items/:itemId`,
    auth.isAuthorized,
    itemController.getSubItem
  );
  app.get(
    `${baseUrl}/details/:itemId`,
    auth.isAuthorized,
    itemController.getSingleItem
  );
};

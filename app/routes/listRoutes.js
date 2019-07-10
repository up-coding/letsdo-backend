const express = require("express");
const router = express.Router();
const listController = require("./../controllers/listController");
const appConfig = require("./../../config/appConfig");
const auth = require("./../middlewares/auth");

module.exports.setRouter = app => {
  let baseUrl = `${appConfig.apiVersion}/lists`;

  app.post(`${baseUrl}/create`, auth.isAuthorized, listController.createList);
  app.post(
    `${baseUrl}/delete/:listId`,
    auth.isAuthorized,
    listController.deleteList
  );
  app.post(
    `${baseUrl}/view/all/public/list`,
    auth.isAuthorized,
    listController.getAllPublicLists
  );

  app.put(
    `${baseUrl}/update/:listId`,
    auth.isAuthorized,
    listController.updateList
  );

  app.get(
    `${baseUrl}/view/all/:userId`,
    auth.isAuthorized,
    listController.getAllLists
  );

  app.get(
    `${baseUrl}/view/all/public/:userId`,
    auth.isAuthorized,
    listController.getAllPublicLists
  );
  app.get(
    `${baseUrl}/view/all/private/:userId`,
    auth.isAuthorized,
    listController.getAllPrivateLists
  );
  app.get(
    `${baseUrl}/details/:listId`,
    auth.isAuthorized,
    listController.getList
  );

  app.get(
    `${baseUrl}/view/all/notifications/:userId`,
    auth.isAuthorized,
    listController.getAllNotifications
  );

  app.post(
    `${baseUrl}/delete/notification/:notificationId`,
    auth.isAuthorized,
    listController.deleteNotification
  );
};

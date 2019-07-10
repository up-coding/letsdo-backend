const express = require("express");
const router = express.Router();
const appConfig = require("../../config/appConfig");
const multiUserController = require("./../controllers/multiUserController");
const auth = require("./../middlewares/auth");

module.exports.setRouter = app => {
  let baseUrl = `${appConfig.apiVersion}/multi-users`;

  app.post(
    `${baseUrl}/send/friend-request`,
    auth.isAuthorized,
    multiUserController.sendFriendRequest
  );
  app.post(
    `${baseUrl}/accept/friend-request`,
    multiUserController.acceptFriendRequest
  );
  app.post(
    `${baseUrl}/reject/friend-request`,
    auth.isAuthorized,
    multiUserController.rejectFriendRequest
  );
  app.post(
    `${baseUrl}/cancel/friend-request`,
    auth.isAuthorized,
    multiUserController.cancelFriendRequest
  );

  app.post(
    `${baseUrl}/unfriend`,
    auth.isAuthorized,
    multiUserController.unfriend
  );

  app.get(
    `${baseUrl}/view/all/sent-requests/:userId`,
    auth.isAuthorized,
    multiUserController.getAllSentRequest
  );
  app.get(
    `${baseUrl}/view/all/received-requests/:userId`,
    auth.isAuthorized,
    multiUserController.getAllReceivedRequest
  );
};

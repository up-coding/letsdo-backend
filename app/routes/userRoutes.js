const express = require('express');
const router = express.Router();
const appConfig = require('../../config/appConfig');
const userController = require('./../controllers/userController');
const auth = require('./../middlewares/auth');

module.exports.setRouter = (app)=>{
   let baseUrl = `${appConfig.apiVersion}/users`;
  
   app.post(`${baseUrl}/signup`,userController.signUp);
   app.post(`${baseUrl}/login`,userController.logIn);
   app.post(`${baseUrl}/logout`,auth.isAuthorized, userController.logOut);
   app.post(`${baseUrl}/change`,auth.isAuthorized, userController.changeUserPassword);
   app.post(`${baseUrl}/reset-password`, userController.resetUserPassword);
   app.post(`${baseUrl}/delete/:userId`,auth.isAuthorized, userController.deleteUser);
   
   app.put(`${baseUrl}/update-password`, userController.updateUserPassword);
   app.put(`${baseUrl}/verify`,userController.verifyUserEmail);
   app.put(`${baseUrl}/edit/:userId`,auth.isAuthorized,userController.editUserDetails);

   app.get(`${baseUrl}/view/all`, auth.isAuthorized, userController.getAllUsers);
   app.get(`${baseUrl}/details/:userId`, auth.isAuthorized, userController.getSingleUser);
    
};
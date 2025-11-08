const { Router } = require("express");
const { Response } = require("../../libs/response_config");
const {
  AuthController,
  ApiAppController,
} = require("../../controller/apiAppController");
const { isAuthApp } = require("../../middlewares/isAuth");

const { uploadImageFile } = require("../../config/upload");
const svRouter = new Router();

svRouter.get("/refresh-token", AuthController.getRefreshToken);

svRouter.post("/login", Response(AuthController.loginController));

svRouter.post("/register", Response(AuthController.registerController));

svRouter.post("/very-otp", Response(AuthController.veryOTP));

svRouter.post("/retry-otp", Response(AuthController.retryOTP));

svRouter.post("/logout", isAuthApp, Response(AuthController.logoutController));

svRouter.get("/get-user", isAuthApp, Response(AuthController.getUser));

svRouter.post(
  "/upload-file",
  isAuthApp,
  uploadImageFile.any(),
  Response(ApiAppController.ApiUpLoadFile)
);

svRouter.get("/load-data", Response(ApiAppController.loadData));

svRouter.get("/get-trending", Response(ApiAppController.getTrending));

svRouter.get("/get-top", Response(ApiAppController.getTop));

svRouter.get("/get-detail", Response(ApiAppController.getDetails));

svRouter.get("/get-search", Response(ApiAppController.getSearch));

svRouter.get("/get-chapter", Response(ApiAppController.getChapter));

svRouter.get(
  "/get-filter-categories",
  Response(ApiAppController.getFilterCategories)
);

svRouter.get("/get-site-map", Response(ApiAppController.getSiteMap));

svRouter.post("/unlock", Response(ApiAppController.unLock));

module.exports = svRouter;

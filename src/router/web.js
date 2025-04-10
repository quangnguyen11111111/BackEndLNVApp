import express from "express";
import userController from "../controllers/userController"
let router = express.Router();

let initWebRoutes = (app) => {
  router.post("/api/createNewUser",userController.handleCreateUser)//Tạo mới người dùng
  router.post("/api/login",userController.handleLogin)//Đăng nhập
  router.post("/api/refreshToken", userController.handleRefreshToken)//refreshToken
  router.post("/api/loginWithGoogle",userController.handleLoginWithGoogle)
  return app.use("/", router)
};

module.exports = initWebRoutes;

import express from "express";
import authMiddleware from "../middlewares/jwtAuthorization.js";

import {
  registerValidator,
  loginValidator,
  updateCurrentUserValidator,
  currentUserPasswordUpdateValidator,
  deleteCurrentUserValidator,
  blockUserValidator,
  unblockUserValidator,
} from "../Validators/users.js";

import {
  registerReqBody,
  updatedCurrentUserReq,
  updateUserCurrentPasswordReq,
} from "../RequestBodyFilter/users.js";

import {
  register,
  login,
  getCurrentUser,
  updateCurrentUser,
  updateCurrentUserPassword,
  deleteCurrentUser,
  getUsersBloked,
  blockUser,
  unblockUser,
} from "../controllers/users.js";

const router = express.Router();

router.route("/").get().delete();

router.post("/register", registerValidator, registerReqBody, register);

router.post("/login", loginValidator, login);

router
  .route("/current")

  .get(authMiddleware, getCurrentUser) //Get Current User

  .put(
    authMiddleware,
    updatedCurrentUserReq,
    updateCurrentUserValidator,
    updateCurrentUser
  ) // Update Current User

  .delete(authMiddleware, deleteCurrentUserValidator, deleteCurrentUser); //Delete Current User

router
  .route("/current/password/change-password")
  .put(
    authMiddleware,
    currentUserPasswordUpdateValidator,
    updateUserCurrentPasswordReq,
    updateCurrentUserPassword
  );

router.get("/current/blocked", authMiddleware, getUsersBloked);

router.post(
  "/current/user/:userId/block",
  authMiddleware,
  blockUserValidator,
  blockUser
);

router.delete(
  "/current/user/:userId/unblock",
  authMiddleware,
  unblockUserValidator,
  unblockUser
);

router.route("/:userId").get().delete();

router.delete("/:userId/ban");

router.post("/:userID/unban");

export default router;

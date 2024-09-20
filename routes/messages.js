import express from "express";
import authMiddleware from "../middlewares/jwtAuthorization.js";

import { sendMessageValidator } from "../Validators/message.js";

import {
  getMessages,
  getMessage,
  createMessage,
  updateMessage,
  softDeleteMessage,
  deleteMessagePermanently,
  softDeleteMessages,
  deleteMessagesPermanently,
} from "../controllers/message.js";

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(authMiddleware, getMessages)
  .post(authMiddleware, sendMessageValidator, createMessage);

router
  .route("/:id")
  .get(authMiddleware, getMessage)
  .put(authMiddleware, updateMessage);

router.delete(
  "/hard-delete/:messageId",
  authMiddleware,
  deleteMessagePermanently
);

router.delete(
  "/soft-delete/:messageId",
  authMiddleware,
  deleteMessagePermanently
);
export default router;

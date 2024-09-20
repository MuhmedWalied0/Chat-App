import express from "express";
import authMiddleware from "../middlewares/jwtAuthorization.js";
import {
  getChats,
  getChat,
  createChat,
  deleteChatPermanently,
  softDeleteChatForUser,
} from "../controllers/privateChats.js";

import { createChatValidator,getChatValidator } from "../Validators/pirvateChat.js";

import Message from "../routes/messages.js";

const router = express.Router();

router.route("/").get(authMiddleware, getChats);

router.get("/:id", authMiddleware,getChatValidator, getChat);

router.get("/user/:id", authMiddleware, createChatValidator, createChat);

router.use("/:chatId/send-message", Message);

router.use("/:chatId/messages", Message);

router.delete("/:chatId/soft-delete");
router.delete("/:chatId/hard-delete");

router
  .route("/:id")
  .get(authMiddleware, getChat)
  .delete(authMiddleware, deleteChatPermanently);

router.delete("/soft-delete", authMiddleware, softDeleteChatForUser);

export default router;

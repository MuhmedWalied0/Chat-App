import { param, body } from "express-validator";
import mongoose from "mongoose";
import { isValidChat } from "../utils/checkPrivateChat.js";
import { isValidGroup } from "../utils/checkGroupChat.js";
import validator from "../middlewares/validator.js";

const sendMessageValidator = [
  param("chatId")
    .optional()
    .custom(async (value, { req }) => {
      if (!value) {
        return;
      }
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("Invalid chat id");
      }
      const chat = await isValidChat(value, req.user.id);
      req.Chat = chat;
      req.chatType = "PrivateChat";
      return true;
    }),
  param("groupId")
    .optional()
    .custom(async (value, { req }) => {
      if (!value) {
        return;
      }
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("Invalid group id");
      }
      const group = await isValidGroup(value, req.user.id);
      req.Chat = group;
      req.chatType = "GroupChat";
      return true;
    }),
  body("content").trim().notEmpty(),
  validator,
];

export { sendMessageValidator };

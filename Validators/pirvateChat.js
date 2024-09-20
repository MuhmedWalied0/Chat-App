import { param, body } from "express-validator";
import mongoose from "mongoose";
import validator from "../middlewares/validator.js";
import User from "../Models/users.js";
import { isValidUser } from "../utils/checkUser.js";
import {
  isValidChat,
  isChatFoundByQuery,
  fromatLastmessage,
  getChatWithFormat,
} from "../utils/checkPrivateChat.js";

const getChatValidator = [
  param("id")
    .notEmpty()
    .withMessage("chat id is required")
    .custom(async (value, { req }) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("Invalid chat id");
      }
      await isValidChat(value,req.user.id);
      return true;
    }),
  validator,
];

const createChatValidator = [
  param("id")
    .notEmpty()
    .withMessage("user id is required")
    .custom(async (value, { req }) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("Invalid user id");
      }
      if (req.user.id === value) {
        throw new Error("Cannot create a chat with yourself");
      }

      const user = await isValidUser(value);
      const currentUser = await isValidUser(req.user.id);

      const participants = [req.user.id, value];
      const query = {
        participants: { $all: participants },
      };
      const chatExists = await getChatWithFormat(
        query,
        user["username"],
        req.user.id
      );
      if (chatExists) {
        req.Chat = chatExists;
      }
      req.User = user;
      req.currentUser = currentUser;
      req.participants = participants;
      return true;
    }),
  validator,
];

export { createChatValidator, getChatValidator };

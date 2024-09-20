import { param, body } from "express-validator";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

import {
  isValidUser,
  isUserFoundById,
  isUserFoundByQuery,
  isUserNotFoundByQuery,
  isTargetUserBlocked,
  isTargetUserNotBlocked,
} from "../utils/checkUser.js";

import userRoles from "../utils/userRoles.js";
import validator from "../middlewares/validator.js";

export const registerValidator = [
  body("firstName")
    .trim()
    .isString()
    .withMessage("First name must be a string")
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters")
    .isLength({ max: 20 })
    .withMessage("First name must be at most 20 characters"),
  body("lastName")
    .trim()
    .isString()
    .withMessage("Last name must be a string")
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters")
    .isLength({ max: 20 })
    .withMessage("Last name must be at most 20 characters"),
  body("username")
    .trim()
    .isString()
    .withMessage("Username must be a string")
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 4 })
    .withMessage("Username must be at least 4 characters")
    .custom(async (value) => {
      return await isUserNotFoundByQuery(
        { username: value },
        "Username already exists"
      );
    }),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Not valid Email")
    .notEmpty()
    .withMessage("Email is required")
    .custom(async (value, { req }) => {
      return await isUserNotFoundByQuery(
        { email: value },
        "Email already exists"
      );
    }),
  body("password")
    .notEmpty()
    .withMessage("Password must be required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  body("bio")
    .optional()
    .isLength({ max: 100 })
    .withMessage("bio must be at most 100 characters"),
  body("secretKey")
    .optional()
    .custom(async (value, { req }) => {
      if (value === process.env.ADMIN_KEY) {
        req.role = userRoles.admin;
      } else if (value === process.env.OWNER_KEY) {
        req.role = userRoles.owner;
      } else if (value === process.env.SUPER_ADMIN_KEY) {
        req.role = userRoles.superAdmin;
      } else {
        req.role = userRoles.user;
      }
      return true;
    }),
  validator,
];

export const loginValidator = [
  body("identifier")
    .notEmpty()
    .withMessage("Username or Email is required")
    .custom(async (value, { req }) => {
      const query = {
        $or: [{ username: value }, { email: value }],
      };
      const messageError = "Username or email is not correct";
      const user = await isUserFoundByQuery(query, messageError);
      req.User = user;
      return true;
    }),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .custom(async (value, { req }) => {
      if (!req.User || req.User.accountStatus === "banned") return;
      const isMatch = await bcrypt.compare(value, req.User.password);
      if (!isMatch) {
        throw new Error("Password is not correct");
      }
      return true;
    }),
  validator,
];

export const updateCurrentUserValidator = [
  body("firstName")
    .optional()
    .isString()
    .withMessage("First name must be a string")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters")
    .isLength({ max: 20 })
    .withMessage("First name must be at most 20 characters"),
  body("lastName")
    .optional()
    .isString()
    .withMessage("Last name must be a string")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters")
    .isLength({ max: 20 })
    .withMessage("Last name must be at most 20 characters"),
  body("username")
    .optional()
    .isString()
    .withMessage("Username must be a string")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 5 })
    .withMessage("Username must be at least 5 characters")
    .custom(async (value) => {
      return await isUserNotFoundByQuery(
        { username: value },
        "Username already exists"
      );
    }),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Not valid Email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .custom(async (value) => {
      return await isUserNotFoundByQuery(
        { email: value },
        "Email already exists"
      );
    }),
  body("password")
    .optional()
    .notEmpty()
    .withMessage("Password must be required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  body("bio")
    .optional()
    .isLength({ max: 100 })
    .withMessage("bio must be at most 100 characters"),
  validator,
];

export const currentUserPasswordUpdateValidator = [
  body("oldPassword")
    .notEmpty()
    .withMessage("Current password is required")
    .custom(async (value, { req }) => {
      const user = await isValidUser(req.user.id);
      const isMatch = await bcrypt.compare(value, user.password);
      if (!isMatch) {
        throw new Error("Password is incorrect");
      }
      return true;
    }),
  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters long")
    .custom(async (value, { req }) => {
      if (value === req.body.oldPassword) {
        throw new Error("New password must be different from current password");
      }
      return true;
    }),
  validator,
];

export const deleteCurrentUserValidator = [
  body("password")
    .notEmpty()
    .withMessage("Current password is required")
    .custom(async (value, { req }) => {
      const user = await isValidUser(req.user.id);
      const isMatch = await bcrypt.compare(value, user.password);
      if (!isMatch) {
        throw new Error("Password is incorrect");
      }
      return true;
    }),
  validator,
];

export const blockUserValidator = [
  param("userId").custom(async (value, { req }) => {
    if (req.user.id === value) {
      throw new Error("You cannot block yourself");
    }
    const currentUser = await isValidUser(req.user.id);
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error("Invalid user id");
    }
    await isTargetUserNotBlocked(currentUser, value, "User is already blocked");

    const targetUser = await isUserFoundById(value, "User Not Found");

    req.currentUser = currentUser;
    req.targetUser = targetUser;
    return true;
  }),
  validator,
];

export const unblockUserValidator = [
  param("userId").custom(async (value, { req }) => {
    const currentUser = await isValidUser(req.user.id);

    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error("Invalid user ID");
    }

    await isTargetUserBlocked(currentUser, value, "User is not blocked");

    const user = await isUserFoundById(value);

    req.currentUser = currentUser;
    req.targetUser = user;

    return true;
  }),
  validator,
];

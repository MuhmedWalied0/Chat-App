import privateChat from "../Models/privateChats.js";

import { formatObject } from "./formatObjects.js";

import formatTime from "./timeFormat.js";

const isValidChat = async (chatId, userId) => {
  const chat = await privateChat.findById(chatId);
  if (!chat) {
    throw new Error("Chat not found");
  }
  if (!chat.participants.includes(userId)) {
    throw new Error("User is not a participant in this chat");
  }
  return chat;
};

const isChatFoundByQuery = async (query) => {
  const chat = await privateChat.findOne(query);
  if (!chat) {
    if (messageError) {
      throw new Error(messageError);
    }
    return false;
  }
  return chat;
};

const getChatWithFormat = async (query, chatName, userId) => {
  const chat = await privateChat
    .findOne(query)
    .populate("lastMessage", "sender content status createdAt");
  if (!chat) {
    return false;
  }
  if (!chat.participants.includes(userId)) {
    return false;
  }
  chatName =
    chatName || chat.participants.filter((p) => p.toString() !== userId)[0];
  let data = {
    id: chat._id.toString(),
    chatName,
  };
  if (chat.lastMessage) {
    data["lastMessage"] = fromatLastmessage(chat.lastMessage, userId);
  }
  return data;
};

const fromatLastmessage = (lastMessage, currentUserId) => {
  let data = {};
  data["lastMessage"] = formatObject(lastMessage, [
    "id",
    "sender",
    "content",
    "status",
    "createdAt",
  ]);
  data["lastMessage"]["sender"] =
    data["lastMessage"]["sender"].toString() === currentUserId
      ? "me"
      : data["chatName"];
  data["lastMessage"]["createdAt"] = formatTime(data["lastMessage"]["createdAt"]);
  return data["lastMessage"];
};

export {
  isValidChat,
  isChatFoundByQuery,
  fromatLastmessage,
  getChatWithFormat,
};

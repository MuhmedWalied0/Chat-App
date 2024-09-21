import Message from "../Models/messages.js";
import mongoose from "mongoose";
import moment from "moment";

import { isValidChat } from "../utils/checkPrivateChat.js";

const chatMessage = (socket, io) => {
  socket.on("chatMessage", async (msg) => {
    const { content, chatType, chatId } = msg;

    if (chatType === "PrivateChat") {
      if (!mongoose.Types.ObjectId.isValid(chatId)) {
        return socket.emit("error", "Invalid chat id");
      }

      const chat = await isValidChat(chatId, socket.userId);
      if (!chat) {
        return socket.emit("error", "Chat not found or not accessible");
      }

      const messageInfo = {
        chat: chatId,
        chatType,
        sender: socket.userId,
        content,
      };

      const message = await Message.create(messageInfo);

      chat.lastMessage = message._id;
      await chat.save();

      io.to(chatId).emit("receiveMessage", {
        sender: socket.id,
        content: message.content,
        time: moment(message.createdAt).format("h:mm A"),
        chatId,
      });

      // const unreadMessagesCount = await Message.countDocuments({
      //   chat: chatId,
      //   status: { $ne: "seen" },
      //   sender: socket.userId,
      // });
    }
  });
};

export default chatMessage;

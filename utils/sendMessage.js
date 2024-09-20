import Message from "../Models/messages.js";

const sendMessage = async (chatType, chat, messageInfo) => {
  if (chatType === "PrivateChat") {
    const sender = messageInfo.sender;
    const chatId = chat._id;
    const content = messageInfo.content;
    const messageInfo = new Message({
      chat: chatId,
      sender,
      content,
      chatType: chatType,
    });
    const message = await Message.create(messageInfo);
    chat.lastMessage = message._id;
    await chat.save();
    return true;
  } else if (chatType === "GroupChat") {
  } else {
    throw new Error("Invalid chat type");
  }
};
export default sendMessage;

import privateChat from "../Models/privateChats.js";
import Message from "../Models/messages.js";
import formatTime from "../utils/timeFormat.js";
import { getChatWithFormat } from "../utils/checkPrivateChat.js";

export const getChats = async (req, res, next) => {
  const userId = req.user.id;
  let chats = await privateChat
    .find({
      participants: { $in: userId },
      deletedFor: { $nin: [userId] },
      lastMessage: { $exists: true, $ne: null },
    })
    .populate("lastMessage", "sender content status createdAt")
    .populate("participants", "username isOnline");
  chats = chats.sort((a, b) => {
    const aDate = new Date(a.lastMessage.createdAt);
    const bDate = new Date(b.lastMessage.createdAt);
    return bDate - aDate;
  });
  const data = await Promise.all(
    chats.map(async (chat) => {
      const participant = chat.participants.filter(
        (participant) => participant._id.toString() !== userId
      )[0];

      const messagesNotReadCount = await Message.countDocuments({
        chat: chat._id,
        status: { $ne: "seen" },
        sender: { $ne: userId },
      });
      return {
        id: chat._id.toString(),
        name: participant?.username,
        fiend: participant?._id,
        status: participant?.isOnline,
        lastMessage: {
          sender: chat.lastMessage.sender.toString(),
          content: chat.lastMessage.content,
          status: chat.lastMessage.status,
          time: formatTime(chat.lastMessage.createdAt),
        },
        unreadMessagesCount: messagesNotReadCount,
      };
    })
  );

  res.json({ chats: data });
};

export const getChat = async (req, res, next) => {
  const query = { _id: req.params.id };
  const chat = await getChatWithFormat(query, null, req.user.id);

  res.json({ chat });
};

export const createChat = async (req, res, next) => {
  const participants = req.participants;

  let chat = req.Chat ? req.Chat : await privateChat.create({ participants });
  if (req.Chat) {
    return res.json({ chat: req.Chat });
  }
  let data = {
    id: chat._id.toString(),
    chatName: req.User["username"],
  };
  res.json({ chat: data });
};

export const softDeleteChatForUser = async (req, res, next) => {
  const chatId = req.params.chatId;
  const userId = req.user.id;
  const chat = await privateChat.findByIdAndUpdate(
    chatId,
    { $addToSet: { deletedFor: userId } },
    { new: true }
  );
  const allParticipantsDeleted = chat.participants.every((participant) =>
    chat.deletedFor.includes(participant.toString())
  );
  if (allParticipantsDeleted) {
    await privateChat.findByIdAndDelete(chatId);
  }
  res.status(204).send();
};

export const deleteChatPermanently = async (req, res, next) => {
  const chatId = req.params.chatId;
  const userId = req.user.id;

  const chat = await privateChat.findById(chatId);

  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }

  if (!chat.participants.includes(userId)) {
    return res
      .status(403)
      .json({ message: "User is not a participant in this chat" });
  }

  // حذف الشات نهائيًا
  await privateChat.findByIdAndDelete(chatId);

  res.status(204).send();
};

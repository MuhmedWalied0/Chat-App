import groupChat from "../Models/groupChats.js";

const isValidGroup = async (groupId, userId) => {
  const group = await groupChat.findById(groupId);
  if (!group) {
    throw new Error("Group not found");
  }
  if (!group.participants.includes(userId)) {
    throw new Error("User is not a participant in this chat");
  }
  return group;
};

export { isValidGroup };

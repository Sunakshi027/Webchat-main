import api from "./axois";


// ==========================================
// GET MESSAGES
// ==========================================

export const getMessages = async (userId) => {
  const res = await api.get(`/messages/${userId}`);

  return res.data;
};


// ==========================================
// SEND MESSAGE
// ==========================================

export const sendMessage = async (
  receiverId,
  text,
  image = null
) => {
  const formData = new FormData();

  formData.append("receiverId", receiverId);

  if (text) {
    formData.append("text", text);
  }

  if (image) {
    formData.append("image", image);
  }

  const res = await api.post("/messages", formData);

  return res.data;
};


// ==========================================
// MARK MESSAGES AS SEEN
// ==========================================

export const markMessagesSeen = async (userId) => {
  const res = await api.put(`/messages/seen/${userId}`);

  return res.data;
};


// ==========================================
// GET UNREAD COUNT
// ==========================================

export const getUnreadCount = async (userId) => {
  const res = await api.get(
    `/messages/unread/${userId}`
  );

  return res.data;
};


// ==========================================
// FAVOURITE / UNFAVOURITE
// ==========================================

export const toggleFavourite = async (messageId) => {
  const res = await api.put(
    `/messages/favourite/${messageId}`
  );

  return res.data;
};


// ==========================================
// GET FAVOURITE MESSAGES
// ==========================================

export const getFavouriteMessages = async () => {
  const res = await api.get(
    "/messages/favourite/all"
  );

  return res.data;
};


// ==========================================
// DELETE MESSAGE
// ==========================================

export const deleteMessage = async (messageId) => {
  const res = await api.delete(
    `/messages/${messageId}`
  );

  return res.data;
};


// ==========================================
// UPDATE MESSAGE
// ==========================================

export const updateMessage = async (
  messageId,
  text
) => {
  const res = await api.put(
    `/messages/${messageId}`,
    {
      text,
    }
  );

  return res.data;
};
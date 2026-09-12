import api from "./axois";


// ==========================================
// GET MY CONTACTS
// ==========================================
export const getUsers = async () => {
  const res = await api.get("/users/");
  return res.data;
};


// ==========================================
// GET CURRENT USER
// ==========================================
export const getCurrentUser = async () => {
  const res = await api.get("/users/profile");
  return res.data;
};


// ==========================================
// UPDATE PROFILE
// ==========================================
export const updateProfile = async (formData) => {
  const res = await api.put("/users/profile", formData);
  return res.data;
};


// ==========================================
// SEARCH USER
// ==========================================
export const searchUser = async (name) => {
  const res = await api.get(
    `/users/search?name=${encodeURIComponent(name)}`
  );

  return res.data;
};


// ==========================================
// ADD USER BY EMAIL
// ==========================================
export const addContact = async (email) => {
  const res = await api.post("/users/add-contact", {
    email,
  });

  return res.data;
};
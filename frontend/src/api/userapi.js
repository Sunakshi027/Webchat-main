import api from "./axois";

export const getUsers = async () => {
  const res = await api.get("/users/");
  return res.data;
};

export const getCurrentUser = async () => {
  const res = await api.get("/users/profile");
  return res.data;
};

export const updateProfile = async (formData) => {
  const res = await api.put("/users/profile", formData);
  return res.data;
};

export const searchUser = async (name) => {
  const res = await api.get(`/users/search?name=${name}`);
  return res.data;
};
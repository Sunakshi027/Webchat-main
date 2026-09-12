import api from "../api/axois";

export const authCheck = () => {
  return api.get("/users/profile");
};
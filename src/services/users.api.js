import api from "./api"; // ton axios mobile (api.js)

export const getUsers = async () => {
  const res = await api.get("/admin/users");
  return res.data.users;
};

export const createUser = async (data) => {
  return api.post("/admin/users", data);
};

export const updateUser = async (id, data) => {
  return api.put(`/admin/users/${id}`, data);
};

export const deleteUser = async (id) => {
  return api.delete(`/admin/users/${id}`);
};
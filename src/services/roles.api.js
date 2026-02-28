import api from "./api"; // ton axios mobile (api.js)

export const getRoles = async () => {
  const res = await api.get("/admin/role");
  return res.data.data;
};

export const createRole = async (data) => {
  return api.post("/admin/role", data);
};

export const updateRole = async (id, data) => {
  return api.put(`/admin/role/${id}`, data);
};

export const deleteRole = async (id) => {
  return api.delete(`/admin/role/${id}`);
};

export const getPermissions = async () => {
  const res = await api.get("/admin/permissions");
  return res.data.data.map((p) => p.name);
};
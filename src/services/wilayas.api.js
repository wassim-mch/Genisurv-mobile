import api from "./api"; // ton axios mobile (api.js)

export const getWilayas = async () => {
  const res = await api.get("/admin/wilaya");
  return res.data.wilayas;
};

export const createWilaya = async (data) => {
  return api.post("/admin/wilaya", data);
};

export const updateWilaya = async (id, data) => {
  return api.put(`/admin/wilaya/${id}`, data);
};

export const deleteWilaya = async (id) => {
  return api.delete(`/admin/wilaya/${id}`);
};
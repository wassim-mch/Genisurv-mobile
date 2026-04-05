import api from "./api";

// ✅ GET AVEC caisseId
export const getEncaissements = async (caisseId) => {
  const res = await api.get(`/encaissement/${caisseId}`);
  return res.data.encaissements;
};

export const createEncaissement = async (data) => {
  const res = await api.post("/encaissement", data);
  return res.data.encaissement;
};

export const updateEncaissement = async (id, data) => {
  const res = await api.put(`/encaissement/${id}`, data);
  return res.data.encaissement;
};

export const deleteEncaissement = async (id) => {
  return api.delete(`/encaissement/${id}`);
};
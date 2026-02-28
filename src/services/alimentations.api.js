import api from "./api"; // ton axios mobile (api.js)

// Récupérer toutes les alimentations
export const getAlimentations = async () => {
  const res = await api.get("/admin/alimentation");
  return res.data.alimentations;
};

// Créer une alimentation
export const createAlimentation = async (payload) => {
  const res = await api.post("/admin/alimentation", payload);
  return res.data.alimentation;
};

// Mettre à jour une alimentation
export const updateAlimentation = async (id, payload) => {
  const res = await api.put(`/admin/alimentation/${id}`, payload);
  return res.data.alimentation;
};
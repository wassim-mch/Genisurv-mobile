import api from "./api"; // ton axios mobile (api.js)

export const getEncaissements = async () => {
  const res = await api.get("/admin/encaissement");
  return res.data.encaissements;
};

export const getDecaissements = async () => {
  const res = await api.get("/admin/decaissement");
  return res.data.decaissements;
};

export const updateEtatJustificatif = async (id, etat) => {
  const res = await api.put(`/justificatif/${id}/etat`, {
    etat_justif: etat,
  });
  return res.data;
};
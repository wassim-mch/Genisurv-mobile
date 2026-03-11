import api from "./api"; // ton axios mobile (api.js)


export const getDecaissements = async (isAdmin) => {
  const url = isAdmin
    ? "/admin/decaissement"
    : "/decaissement";

  const res = await api.get(url);
  return res.data.decaissements;
};

export const createDecaissement = async (data) => {
  return api.post("/decaissement", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updateDecaissement = async (id, data) => {
  return api.post(`/decaissement/${id}?_method=PUT`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteDecaissement = async (id) => {
  return api.delete(`/decaissement/${id}`);
};
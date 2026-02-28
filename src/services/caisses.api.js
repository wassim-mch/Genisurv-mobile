import api from "./api"; // ton axios mobile (api.js)

export const getCaisses = async () => {
  const res = await api.get("/admin/caisses");
  return res.data.data;
};

export const getMyCaisse = async () => {
  const res = await api.get("/caisse");
  return res.data.data;
};
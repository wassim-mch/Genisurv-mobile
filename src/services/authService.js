import api from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const login = async (email, password) => {
  const response = await api.post("/login", { email, password });

  const token = response.data.token;

  await AsyncStorage.setItem("token", token);

  // récupérer utilisateur connecté
  const me = await api.get("/user"); // ⚠️ adapte si c'est /me

  await AsyncStorage.setItem("user", JSON.stringify(me.data.user));

  return me.data.user;
};

export const getCurrentUser = async () => {
  const response = await api.get("/user"); // ⚠️ adapte
  return response.data.user;
};

export const logout = async () => {
  await api.post("/logout");
  await AsyncStorage.removeItem("token");
  await AsyncStorage.removeItem("user");
};
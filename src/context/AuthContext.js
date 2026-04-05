import { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ================= LOGIN =================
  const login = async (email, password) => {
    const res = await API.post("/login", { email, password });

    const token = res.data.token;
    if (!token) throw new Error("Token manquant");

    await AsyncStorage.setItem("token", token);

    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    const me = await API.get("/me");
    const userData = me.data.user;

    await AsyncStorage.setItem("user", JSON.stringify(userData));

    setUser(userData); // 🔥 TRIGGER NAVIGATION
  };

  // ================= LOGOUT =================
  const logout = async () => {
    try {
      await API.post("/logout");
    } catch (err) {}

    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");

    delete API.defaults.headers.common["Authorization"];

    setUser(null);
  };

  // ================= CHECK USER =================
  const checkUser = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      API.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const res = await API.get("/me");
      const userData = res.data.user;

      setUser(userData);
    } catch (err) {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
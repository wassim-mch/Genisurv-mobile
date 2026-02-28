import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function usePermissions() {
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    const loadPermissions = async () => {
      const userStr = await AsyncStorage.getItem("user");

      if (!userStr) {
        setPermissions([]);
        return;
      }

      const user = JSON.parse(userStr);

      setPermissions(Array.isArray(user.permissions) ? user.permissions : []);
    };

    loadPermissions();
  }, []);

  return permissions;
}
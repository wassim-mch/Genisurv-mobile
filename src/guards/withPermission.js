import React, { useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import { AuthContext } from "../context/AuthContext";

export default function withPermission(Component, requiredPermission = null) {
  return function ProtectedComponent(props) {
    const { user } = useContext(AuthContext);
    const permissions = user?.permissions || [];
    const role = user?.role?.name || "";
    // 🔹 Si rôle superadmin → toujours autorisé
    if (role === "superadmin") return <Component {...props} />;

    // 🔹 Si aucune permission requise → autorisé
    if (!requiredPermission) return <Component {...props} />;

    // 🔹 Vérification classique
    const hasPermission = Array.isArray(requiredPermission)
      ? requiredPermission.some((p) => permissions.includes(p))
      : permissions.includes(requiredPermission);

    if (!hasPermission) {
      return (
        <View style={styles.container}>
          <Text style={styles.text}>⛔ Accès refusé</Text>
        </View>
      );
    }

    return <Component {...props} />;
  };
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 18, fontWeight: "bold", color: "red" },
});
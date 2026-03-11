import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../context/AuthContext";
import { useNavigation } from "@react-navigation/native";

export default function AccountScreen() {
  const { user, updateEmail } = useContext(AuthContext);
  const navigation = useNavigation();
  const [editingEmail, setEditingEmail] = useState(false);
  const [email, setEmail] = useState(user?.email || "");
  const verified = user?.email_verified_at;

  // Animation pour email vérifié
  const fadeAnim = useState(new Animated.Value(0))[0];
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [verified]);

  const handleEmailSave = () => {
    updateEmail(email);
    setEditingEmail(false);
  };

  const handleCancel = () => {
    setEmail(user?.email);
    setEditingEmail(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ alignItems: "center", paddingBottom: 30 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{user?.nom || "Nom non disponible"}</Text>
        {!editingEmail ? (
          <Text style={styles.email}>{email}</Text>
        ) : (
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleEmailSave}
              activeOpacity={0.7}
            >
              <Ionicons name="checkmark-outline" size={18} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              activeOpacity={0.7}
            >
              <Ionicons name="close-outline" size={18} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Info Card */}
      <View style={styles.card}>
        {/* Nom */}
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={22} color="#0c4d8b" />
          <View style={styles.infoText}>
            <Text style={styles.label}>Nom</Text>
            <Text style={styles.value}>{user?.nom || "Non disponible"}</Text>
          </View>
        </View>

        {/* Rôle */}
        <View style={styles.infoRow}>
          <Ionicons name="shield-checkmark-outline" size={22} color="#0c4d8b" />
          <View style={styles.infoText}>
            <Text style={styles.label}>Rôle</Text>
            <Text style={styles.value}>{user?.role || "Non disponible"}</Text>
          </View>
        </View>

        {/* Email Vérifié */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.infoRow}>
            <Ionicons
              name={verified ? "checkmark-circle" : "close-circle"}
              size={22}
              color={verified ? "#16a34a" : "#dc2626"}
            />
            <View style={styles.infoText}>
              <Text style={styles.label}>Email vérifié</Text>
              <Text
                style={[
                  styles.value,
                  { color: verified ? "#16a34a" : "#dc2626" },
                ]}
              >
                {verified ? "Vérifié" : "Non vérifié"}
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {!editingEmail && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => setEditingEmail(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="mail-outline" size={18} color="white" />
            <Text style={styles.buttonText}>Modifier Email</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.buttonOutline}
          onPress={() => navigation.navigate("ForgotPasswordScreen")}
          activeOpacity={0.7}
        >
          <Ionicons name="lock-closed-outline" size={18} color="#0c4d8b" />
          <Text style={styles.buttonOutlineText}>Forgot Password</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },

  header: {
    width: "100%",
    backgroundColor: "#0c4d8b",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: "center",
    paddingVertical: 40,
    marginBottom: 30,
  },

  name: {
    fontSize: 24,
    color: "white",
    fontWeight: "700",
    fontFamily: "System",
    marginBottom: 8,
  },

  email: {
    fontSize: 16,
    color: "#d1d5db",
    fontFamily: "System",
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "85%",
    marginTop: 10,
  },

  input: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    fontFamily: "System",
  },

  saveButton: {
    marginLeft: 8,
    backgroundColor: "#16a34a",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  cancelButton: {
    marginLeft: 8,
    backgroundColor: "#dc2626",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 20,
    elevation: 5,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  infoText: {
    marginLeft: 12,
  },

  label: {
    fontSize: 12,
    color: "#6b7280",
    fontFamily: "System",
  },

  value: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "System",
  },

  actions: {
    width: "90%",
  },

  button: {
    flexDirection: "row",
    backgroundColor: "#0c4d8b",
    padding: 14,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  buttonText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 8,
    fontFamily: "System",
  },

  buttonOutline: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#0c4d8b",
    padding: 14,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  buttonOutlineText: {
    color: "#0c4d8b",
    fontWeight: "600",
    marginLeft: 8,
    fontFamily: "System",
  },
});
import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import API from "../../services/api";
import { AuthContext } from "../../context/AuthContext";

export default function VerifyEmailScreen() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const sendVerification = async () => {
    try {
      setLoading(true);

      await API.post("/email/verification-notification");

      Alert.alert(
        "Succès",
        "Un email de vérification a été envoyé."
      );
    } catch (err) {
      Alert.alert(
        "Erreur",
        err.response?.data?.message || "Erreur serveur"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vérification Email</Text>

      <Text style={styles.text}>
        Votre email n&apos;est pas encore vérifié.
      </Text>

      <Text style={styles.email}>{user?.email}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={sendVerification}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>
            Envoyer Email de Vérification
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 25,
    backgroundColor: "#f3f4f6",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
  },

  text: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 10,
  },

  email: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 30,
  },

  button: {
    backgroundColor: "#0c4d8b",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});
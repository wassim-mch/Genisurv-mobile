import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import { getCaisses, getMyCaisse } from "../../services/caisses.api";
import { AuthContext } from "../../context/AuthContext";

export default function CaissesScreen() {
  const { user } = useContext(AuthContext);

  const [caisses, setCaisses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCaisses();
  }, []);

  const fetchCaisses = async () => {
    try {
      setLoading(true);

      if (user?.role === "Gestionnaire") {
        const data = await getMyCaisse();
        setCaisses([data]); // transforme en array
      } else {
        const data = await getCaisses();
        setCaisses(data);
      }
    } catch {
      Alert.alert("Erreur", "Impossible de charger les caisses");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestion des Caisses</Text>

      <FlatList
        data={caisses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.name}>{item.name}</Text>

              <Text style={styles.info}>
                Wilaya : {item.wilaya?.name || "-"}
              </Text>

              <Text style={styles.info}>
                Solde actuel : {item.balance ?? 0} DA
              </Text>

              <Text
                style={[
                  styles.status,
                  {
                    color:
                      item.status === "active" ? "green" : "red",
                  },
                ]}
              >
                {item.status}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() =>
                Alert.alert("Détails", `Caisse: ${item.name}`)
              }
            >
              <Text style={{ color: "#fff" }}>Voir</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
  },

  name: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },

  info: {
    fontSize: 13,
    color: "#555",
  },

  status: {
    marginTop: 5,
    fontWeight: "bold",
  },

  detailsButton: {
    marginTop: 10,
    backgroundColor: "#2e86de",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
  },
});
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";

import {
  getEncaissements,
  getDecaissements,
} from "../../services/operations.api";

export default function OperationsScreen() {
  const [type, setType] = useState("encaissement");
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOperations();
  }, [type]);

  const fetchOperations = async () => {
    try {
      setLoading(true);

      if (type === "encaissement") {
        const data = await getEncaissements();
        setOperations(data);
      } else {
        const data = await getDecaissements();
        setOperations(data);
      }
    } catch {
      Alert.alert("Erreur", "Impossible de charger les opérations");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Opérations financières</Text>

      {/* Toggle Buttons */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            type === "encaissement" && styles.activeEncaissement,
          ]}
          onPress={() => setType("encaissement")}
        >
          <Text style={styles.toggleText}>Encaissements</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleBtn,
            type === "decaissement" && styles.activeDecaissement,
          ]}
          onPress={() => setType("decaissement")}
        >
          <Text style={styles.toggleText}>Décaissements</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={operations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text
              style={[
                styles.amount,
                {
                  color:
                    type === "encaissement" ? "green" : "red",
                },
              ]}
            >
              {type === "encaissement" ? "+" : "-"} {item.amount} DA
            </Text>

            <Text>Caisse : {item.caisse?.name}</Text>
            <Text>Date : {item.created_at}</Text>
            <Text>Motif : {item.note}</Text>
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

  toggleContainer: {
    flexDirection: "row",
    marginBottom: 15,
  },

  toggleBtn: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    borderRadius: 8,
    marginHorizontal: 5,
    backgroundColor: "#ddd",
  },

  activeEncaissement: {
    backgroundColor: "#2ecc71",
  },

  activeDecaissement: {
    backgroundColor: "#e74c3c",
  },

  toggleText: {
    fontWeight: "bold",
    color: "#fff",
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
  },

  amount: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
});
import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
        setCaisses([data]);
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

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Header Tableau */}
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { width: 150 }]}>Nom</Text>
            <Text style={[styles.headerCell, { width: 120 }]}>Wilaya</Text>
            <Text style={[styles.headerCell, { width: 120 }]}>Solde</Text>
            <Text style={[styles.headerCell, { width: 100 }]}>Statut</Text>
            <Text style={[styles.headerCell, { width: 80 }]}>Action</Text>
          </View>

          <FlatList
            data={caisses}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.tableRow}>
                <Text style={[styles.cell, { width: 150 }]}>
                  {item.name}
                </Text>

                <Text style={[styles.cell, { width: 120 }]}>
                  {item.wilaya?.nom || "-"}
                </Text>

                <Text style={[styles.cell, { width: 120 }]}>
                  {item.balance ?? 0} DA
                </Text>

                <Text
                  style={[
                    styles.cell,
                    {
                      width: 100,
                      color:
                        item.status === "active"
                          ? "green"
                          : "red",
                      fontWeight: "bold",
                    },
                  ]}
                >
                  {item.status}
                </Text>

                <View
                  style={[
                    styles.cell,
                    { width: 80, flexDirection: "row" },
                  ]}
                >
                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert(
                        "Détails",
                        `Caisse : ${item.name}`
                      )
                    }
                  >
                    <Ionicons
                      name="eye-outline"
                      size={20}
                      color="#2e86de"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f8fb",
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },

  /* TABLE */
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#2e86de",
    paddingVertical: 12,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },

  headerCell: {
    color: "#fff",
    fontWeight: "bold",
    paddingHorizontal: 10,
  },

  tableRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  cell: {
    paddingHorizontal: 10,
  },
});
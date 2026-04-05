import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Animated,
  TextInput,
  Modal,
} from "react-native";
import * as Linking from "expo-linking";
import { Ionicons } from "@expo/vector-icons";
import {
  getEncaissements,
  getDecaissements,
  updateEtatJustificatif,
} from "../../services/operations.api";

export default function OperationsScreen({ navigation }) {
  const [type, setType] = useState("encaissement");
  const [operations, setOperations] = useState([]);
  const [filteredOps, setFilteredOps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("");

  // ✅ MODAL ETAT
  const [etatModal, setEtatModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const openJustificatif = (url) => {
  if (!url) return Alert.alert("Aucun justificatif");

  navigation.navigate("Preview", {
    url,
    type: url?.includes(".pdf") ? "pdf" : "image",
  });
};


  const updateEtat = async (etat) => {
    try {
      await updateEtatJustificatif(selectedId, etat);

      Alert.alert("Succès", "État mis à jour");

      setEtatModal(false);
      setSelectedId(null);

      fetchOperations();
    } catch (e) {
      console.log("ERROR:", e?.response?.data || e.message);
      Alert.alert("Erreur", "Update impossible");
    }
  };

  // ================= FETCH =================
  useEffect(() => {
    fetchOperations();
  }, [type]);

  const fetchOperations = async () => {
    try {
      setLoading(true);
      const data =
        type === "encaissement"
          ? await getEncaissements()
          : await getDecaissements();

      setOperations(data);
      setFilteredOps(data);
    } catch (err) {
      console.log(err);
      Alert.alert("Erreur", "Impossible de charger les opérations");
    } finally {
      setLoading(false);
    }
  };

  // ================= FILTER =================
  useEffect(() => {
    let ops = [...operations];
    if (dateFilter) {
      ops = ops.filter((op) =>
        op.date_creation?.startsWith(dateFilter)
      );
    }
    setFilteredOps(ops);
  }, [dateFilter, operations]);

  // ================= LOADER =================
  if (loading) {
    return (
      <View style={styles.loader}>
        <Animated.Image
          source={require("../../../assets/images/logo.png")}
          style={[styles.loaderLogo, { opacity: fadeAnim }]}
        />
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 20 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Opérations financières</Text>

      {/* ================= TOGGLE ================= */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            type === "encaissement" && styles.activeEncaissement,
          ]}
          onPress={() => setType("encaissement")}
        >
          <Ionicons name="arrow-up-circle" size={18} color="#fff" />
          <Text style={styles.toggleText}> Encaissements</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleBtn,
            type === "decaissement" && styles.activeDecaissement,
          ]}
          onPress={() => setType("decaissement")}
        >
          <Ionicons name="arrow-down-circle" size={18} color="#fff" />
          <Text style={styles.toggleText}> Décaissements</Text>
        </TouchableOpacity>
      </View>

      {/* ================= FILTER ================= */}
      <View style={styles.filterContainer}>
        <TextInput
          placeholder="Filtrer par date (YYYY-MM-DD)"
          style={styles.input}
          value={dateFilter}
          onChangeText={setDateFilter}
        />
      </View>

      {/* ================= TABLE ================= */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.tableContainer}>
          {/* HEADER */}
          <View style={styles.tableHeader}>
            <View style={styles.th}>
              <Text style={styles.thText}>Wilaya</Text>
            </View>
            <View style={styles.th}>
              <Text style={styles.thText}>Montant</Text>
            </View>

            {type === "encaissement" ? (
              <View style={styles.th}>
                <Text style={styles.thText}>Par</Text>
              </View>
            ) : (
              <>
                <View style={styles.th}>
                  <Text style={styles.thText}>Désignation</Text>
                </View>
                <View style={styles.th}>
                  <Text style={styles.thText}>Obs</Text>
                </View>
                <View style={styles.th}>
                  <Text style={styles.thText}>Justif</Text>
                </View>
                <View style={styles.th}>
                  <Text style={styles.thText}>État</Text>
                </View>
                
              </>
            )}

            <View style={styles.th}>
              <Text style={styles.thText}>Date</Text>
            </View>
          </View>

          {/* ROWS */}
          {filteredOps.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={styles.td}>{item.wilaya || "-"}</Text>
              <Text style={styles.td}>{item.montant} DA</Text>

              {type === "encaissement" ? (
                <Text style={styles.td}>{item.par || "-"}</Text>
              ) : (
                <>
                  <Text style={styles.td}>{item.designation || "-"}</Text>
                  <Text style={styles.td}>{item.observation || "-"}</Text>

                  <TouchableOpacity
                  style={styles.td}
                  onPress={() => openJustificatif(item.lien_justificatif)}
                >
                  <Text style={{ color: "#2563eb" }}>Voir</Text>
                </TouchableOpacity>

                  <Text
                    style={[
                      styles.td,
                      {
                        color:
                          item.etat_justificatif === "justifie"
                            ? "green"
                            : item.etat_justificatif === "refuse"
                            ? "red"
                            : "orange",
                      },
                    ]}
                  >
                    {item.etat_justificatif || "-"}
                  </Text>

                  
                </>
              )}

              <Text style={styles.td}>{item.date_creation}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* ================= MODAL DROPDOWN ================= */}
      <Modal visible={etatModal} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "#00000055",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              padding: 20,
              borderRadius: 10,
              width: 250,
            }}
          >
            <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
              Changer état
            </Text>

            <TouchableOpacity onPress={() => updateEtat("justifie")}>
              <Text style={{ padding: 10, color: "green" }}>Justifié</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => updateEtat("refuse")}>
              <Text style={{ padding: 10, color: "red" }}>Refusé</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => updateEtat("attente")}>
              <Text style={{ padding: 10, color: "orange" }}>Attente</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setEtatModal(false)}>
              <Text
                style={{
                  marginTop: 10,
                  textAlign: "center",
                  color: "#2563eb",
                }}
              >
                Fermer
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f1f5f9" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#3b82f6",
  },
  toggleContainer: { flexDirection: "row", marginBottom: 15 },
  toggleBtn: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 5,
    backgroundColor: "#94a3b8",
  },
  activeEncaissement: { backgroundColor: "#27ae60" },
  activeDecaissement: { backgroundColor: "#e74c3c" },
  toggleText: { fontWeight: "bold", color: "#fff" },
  filterContainer: { marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
  },
  tableContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    elevation: 3,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#eaf1ff",
    borderRadius: 8,
    paddingVertical: 10,
  },
  th: { minWidth: 120, paddingHorizontal: 10 },
  thText: { fontWeight: "bold", color: "#2563eb" },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#f1f5f9",
    paddingVertical: 12,
  },
  td: { minWidth: 120, paddingHorizontal: 10, fontSize: 13 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  loaderLogo: { width: 180, height: 180 },
});
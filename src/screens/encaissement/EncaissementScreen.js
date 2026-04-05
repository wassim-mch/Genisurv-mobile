import React, { useEffect, useState, useContext, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  Modal,
  StyleSheet,
  Animated,
  Pressable, // لإغلاق المودال بالضغط خارج المحتوى
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AuthContext } from "../../context/AuthContext";
import {
  getEncaissements,
  createEncaissement,
  updateEncaissement,
  deleteEncaissement,
} from "../../services/encaissements.api";

// ===== LOADER =====
function Loader({ loading }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(fadeAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [loading, fadeAnim]);

  if (!loading) return null;

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

// ===== SCREEN =====
export default function EncaissementScreen() {
  const { user } = useContext(AuthContext);

  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [encaissements, setEncaissements] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [montant, setMontant] = useState("");
  const [rapport, setRapport] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getEncaissements(user.caisse_id);
      setEncaissements(data);
      setFilteredData(data);
    } catch (error) {
      console.log(error);
      Alert.alert("Erreur", "Chargement impossible");
    } finally {
      setLoading(false);
    }
  };

  // 🔍 SEARCH
  const handleSearch = (text) => {
    setSearch(text);
    const filtered = encaissements.filter((e) =>
      (e.rapport?.toLowerCase() || "").includes(text.toLowerCase()) ||
      (e.par?.toLowerCase() || "").includes(text.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const resetForm = () => {
    setMontant("");
    setRapport("");
    setSelectedId(null);
    setEditMode(false);
  };

  const handleCreate = async () => {
    if (!montant || !rapport) {
      return Alert.alert("Erreur", "Tous les champs sont obligatoires");
    }

    try {
      const data = {
        caisse_id: user.caisse_id,
        user_id: user.id,
        montant: parseFloat(montant),
        rapport: rapport.trim(),
      };

      await createEncaissement(data);

      resetForm();
      setModalVisible(false);
      fetchData();
    } catch (error) {
      console.log("ERREUR CREATE:", error.response?.data);
      Alert.alert("Erreur", JSON.stringify(error.response?.data) || "Erreur lors de la création");
    }
  };

  const handleEdit = (item) => {
    setEditMode(true);
    setSelectedId(item.id);
    setMontant(String(item.montant));
    setRapport(item.rapport || "");
    setModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!montant || !rapport) {
      return Alert.alert("Erreur", "Tous les champs sont obligatoires");
    }

    try {
      const data = {
        montant: parseFloat(montant),
        rapport: rapport.trim(),
      };

      await updateEncaissement(selectedId, data);

      resetForm();
      setModalVisible(false);
      fetchData();
    } catch (error) {
      console.log("UPDATE ERROR:", error.response?.data);
      Alert.alert("Erreur", "Modification impossible");
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Confirmation",
      "Voulez-vous vraiment supprimer cet encaissement ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteEncaissement(id);
              fetchData();
            } catch (error) {
              console.log("DELETE ERROR:", error);
              Alert.alert("Erreur", "Suppression impossible");
            }
          },
        },
      ]
    );
  };

  // إغلاق المودال وإعادة تعيين النموذج
  const closeModal = () => {
    resetForm();
    setModalVisible(false);
  };

  if (loading) return <Loader loading={loading} />;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Mes Encaissements</Text>
      </View>

      {/* SEARCH */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#2e86de" />
        <TextInput
          style={styles.search}
          placeholder="Rechercher par rapport ou nom..."
          value={search}
          onChangeText={handleSearch}
        />
      </View>

      {/* TABLE */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.tableContainer}>
          {/* TABLE HEADER */}
          <View style={styles.tableHeader}>
            {[
              { label: "Montant", icon: "cash-outline" },
              { label: "Rapport", icon: "document-text-outline" },
              { label: "Date", icon: "calendar-outline" },
              { label: "Par", icon: "person-outline" },
              { label: "Action", icon: "settings-outline" },
            ].map((h, i) => (
              <View key={i} style={styles.th}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                  <Ionicons name={h.icon} size={16} color="#2e86de" />
                  <Text style={styles.thText}>{h.label}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* TABLE ROWS */}
          {filteredData.length === 0 ? (
            <View style={{ padding: 20, alignItems: "center" }}>
              <Text>Aucun encaissement trouvé</Text>
            </View>
          ) : (
            filteredData.map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={styles.td}>{item.montant} DA</Text>
                <Text style={styles.td}>{item.rapport}</Text>
                <Text style={styles.td}>
                  {item.date_creation ? item.date_creation.split("T")[0] : "-"}
                </Text>
                <Text style={styles.td}>{item.par || "—"}</Text>

                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => handleEdit(item)}>
                    <Ionicons name="pencil-outline" size={20} color="orange" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item.id)}>
                    <Ionicons name="trash-outline" size={20} color="red" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* FAB - Ajouter */}
      <TouchableOpacity style={styles.fab} onPress={() => {
        resetForm();
        setModalVisible(true);
      }}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* MODAL */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editMode ? "Modifier l'Encaissement" : "Nouvel Encaissement"}
            </Text>

            <TextInput
              placeholder="Montant (DA)"
              value={montant}
              onChangeText={setMontant}
              keyboardType="numeric"
              style={styles.input}
            />

            <TextInput
              placeholder="Rapport / Description"
              value={rapport}
              onChangeText={setRapport}
              multiline
              numberOfLines={3}
              style={[styles.input, { height: 80, textAlignVertical: "top" }]}
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={editMode ? handleUpdate : handleCreate}
            >
              <Text style={styles.saveText}>
                {editMode ? "Mettre à jour" : "Enregistrer"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

// ===== STYLES =====
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f4f8fb" },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loaderLogo: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    gap: 10,
  },

  title: {
    fontSize: 22,
    fontFamily: "Poppins-Bold",
    color: "#2e86de",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d6e6f9",
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
  },

  search: {
    marginLeft: 10,
    flex: 1,
    fontFamily: "Poppins-Regular",
  },

  tableContainer: {
    borderWidth: 1,
    borderColor: "#d6e6f9",
    borderRadius: 10,
    backgroundColor: "#fff",
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#d6e6f9",
    padding: 12,
  },

  th: { width: 130, paddingHorizontal: 5 },

  thText: {
    fontFamily: "Poppins-Bold",
    color: "#2e86de",
    fontSize: 14,
  },

  tableRow: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  td: {
    width: 130,
    fontFamily: "Poppins-Regular",
    color: "#000",
    paddingHorizontal: 5,
  },

  actions: {
    flexDirection: "row",
    gap: 20,
    width: 80,
    justifyContent: "flex-start",
  },

  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "#0c4d8b",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    elevation: 10,
  },

  modalTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#2e86de",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    fontFamily: "Poppins-Regular",
  },

  saveButton: {
    backgroundColor: "#22c55e",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  saveText: {
    color: "#fff",
    fontFamily: "Poppins-Bold",
    fontSize: 16,
  },

  cancelButton: {
    backgroundColor: "#ef4444",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  cancelText: {
    color: "#fff",
    fontFamily: "Poppins-Bold",
    fontSize: 16,
  },
});
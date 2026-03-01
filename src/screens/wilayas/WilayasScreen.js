import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import {
  getWilayas,
  createWilaya,
  updateWilaya,
  deleteWilaya,
} from "../../services/wilayas.api";

export default function WilayasScreen() {
  const [wilayas, setWilayas] = useState([]);
  const [filteredWilayas, setFilteredWilayas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [editingWilaya, setEditingWilaya] = useState(null);
  const [name, setName] = useState("");

  useEffect(() => {
    fetchWilayas();
  }, []);

  const fetchWilayas = async () => {
    try {
      setLoading(true);
      const data = await getWilayas();
      setWilayas(data);
      setFilteredWilayas(data);
    } catch {
      Alert.alert("Erreur", "Impossible de charger les wilayas");
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Recherche
  const handleSearch = (text) => {
    setSearch(text);
    const filtered = wilayas.filter((w) =>
      w.nom.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredWilayas(filtered);
  };

  // ➕ Ajouter
  const openAddModal = () => {
    setEditingWilaya(null);
    setName("");
    setModalVisible(true);
  };

  // ✏️ Modifier
  const openEditModal = (wilaya) => {
    setEditingWilaya(wilaya);
    setName(wilaya.nom);
    setModalVisible(true);
  };

  // 💾 Sauvegarder
  const handleSave = async () => {
    if (!name) {
      Alert.alert("Validation", "Nom obligatoire");
      return;
    }

    try {
      setLoading(true);

      if (editingWilaya) {
        await updateWilaya(editingWilaya.id, { nom: name });
        Alert.alert("Succès", "Wilaya modifiée");
      } else {
        await createWilaya({ nom: name });
        Alert.alert("Succès", "Wilaya créée");
      }

      setModalVisible(false);
      fetchWilayas();
    } catch {
      Alert.alert("Erreur", "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  // ❌ Supprimer
  const handleDelete = (id) => {
    Alert.alert("Confirmation", "Supprimer cette wilaya ?", [
      { text: "Annuler" },
      {
        text: "Supprimer",
        onPress: async () => {
          try {
            setLoading(true);
            await deleteWilaya(id);
            fetchWilayas();
          } catch {
            Alert.alert("Erreur", "Erreur suppression");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestion des wilayas</Text>

      {/* Recherche */}
      <TextInput
        style={styles.search}
        placeholder="Rechercher..."
        value={search}
        onChangeText={handleSearch}
      />

      {/* Ajouter */}
      <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
        <Text style={styles.addButtonText}>+ Ajouter wilaya</Text>
      </TouchableOpacity>

      {/* Liste */}
      <FlatList
        data={filteredWilayas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.nom}</Text>

            <View style={styles.actions}>
              <TouchableOpacity onPress={() => openEditModal(item)}>
                <Ionicons name="pencil" size={22} color="#2e86de" />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Ionicons name="trash" size={22} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <ScrollView contentContainerStyle={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            {editingWilaya ? "Modifier wilaya" : "Ajouter wilaya"}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Nom de la wilaya"
            value={name}
            onChangeText={setName}
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Enregistrer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setModalVisible(false)}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f4f8fb" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },

  search: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },

  addButton: {
    backgroundColor: "#2e86de",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  addButtonText: { color: "#fff", fontWeight: "bold" },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },

  name: { fontWeight: "bold", fontSize: 16 },

  actions: { flexDirection: "row", gap: 15 },

  modalContainer: { padding: 20 },

  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },

  saveButton: {
    backgroundColor: "green",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: { color: "#fff", fontWeight: "bold" },

  cancelButton: {
    backgroundColor: "#e74c3c",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  cancelButtonText: { color: "#fff", fontWeight: "bold" },
});
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
  StyleSheet,
} from "react-native";

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
      w.name.toLowerCase().includes(text.toLowerCase())
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
    setName(wilaya.name);
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
        await updateWilaya(editingWilaya.id, { name });
        Alert.alert("Succès", "Wilaya modifiée");
      } else {
        await createWilaya({ name });
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
        <Text style={styles.addButtonText}>+ Ajouter</Text>
      </TouchableOpacity>

      {/* Liste */}
      <FlatList
        data={filteredWilayas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>

            <View style={styles.actions}>
              <TouchableOpacity onPress={() => openEditModal(item)}>
                <Text style={styles.edit}>✏️</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={styles.delete}>❌</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.title}>
            {editingWilaya ? "Modifier wilaya" : "Ajouter wilaya"}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Nom de la wilaya"
            value={name}
            onChangeText={setName}
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={{ color: "#fff" }}>Enregistrer</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setModalVisible(false)}>
            <Text style={{ marginTop: 20 }}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },

  search: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },

  addButton: {
    backgroundColor: "#2e86de",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },

  addButtonText: { color: "#fff", fontWeight: "bold" },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    elevation: 3,
  },

  name: { fontWeight: "bold", fontSize: 16 },

  actions: { flexDirection: "row", gap: 15 },

  edit: { fontSize: 18 },
  delete: { fontSize: 18, color: "red" },

  modalContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },

  saveButton: {
    backgroundColor: "green",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
});
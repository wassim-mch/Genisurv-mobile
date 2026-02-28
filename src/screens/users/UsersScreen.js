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
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../../services/users.api";

export default function UsersScreen() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Recherche
  const handleSearch = (text) => {
    setSearch(text);
    const filtered = users.filter((u) =>
      u.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  // ➕ Ouvrir modal
  const openAddModal = () => {
    setEditingUser(null);
    setForm({ name: "", email: "", password: "" });
    setModalVisible(true);
  };

  // ✏️ Modifier
  const openEditModal = (user) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
    });
    setModalVisible(true);
  };

  // 💾 Sauvegarder
  const handleSave = async () => {
    try {
      if (editingUser) {
        await updateUser(editingUser.id, form);
      } else {
        await createUser(form);
      }

      setModalVisible(false);
      fetchUsers();
    } catch (error) {
      Alert.alert("Erreur", "Erreur lors de l'enregistrement");
    }
  };

  // ❌ Supprimer
  const handleDelete = (id) => {
    Alert.alert("Confirmation", "Supprimer cet utilisateur ?", [
      { text: "Annuler" },
      {
        text: "Supprimer",
        onPress: async () => {
          await deleteUser(id);
          fetchUsers();
        },
      },
    ]);
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestion des utilisateurs</Text>

      {/* 🔍 Recherche */}
      <TextInput
        style={styles.search}
        placeholder="Rechercher..."
        value={search}
        onChangeText={handleSearch}
      />

      {/* ➕ Bouton Ajouter */}
      <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
        <Text style={styles.addButtonText}>+ Ajouter</Text>
      </TouchableOpacity>

      {/* 📋 Liste */}
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.name}>{item.name}</Text>
              <Text>{item.email}</Text>
            </View>

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

      {/* 🪟 Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.title}>
            {editingUser ? "Modifier utilisateur" : "Ajouter utilisateur"}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Nom"
            value={form.name}
            onChangeText={(text) => setForm({ ...form, name: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={form.email}
            onChangeText={(text) => setForm({ ...form, email: text })}
          />

          {!editingUser && (
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              secureTextEntry
              value={form.password}
              onChangeText={(text) => setForm({ ...form, password: text })}
            />
          )}

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
    backgroundColor: "#f2f2f2",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  name: { fontWeight: "bold" },

  actions: {
    flexDirection: "row",
    gap: 15,
  },

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
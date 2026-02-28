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
  ScrollView,
} from "react-native";

import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  getPermissions,
} from "../../services/roles.api";

export default function RolesScreen() {
  const [roles, setRoles] = useState([]);
  const [permissionsList, setPermissionsList] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [name, setName] = useState("");

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const data = await getRoles();
      setRoles(data);
    } catch {
      Alert.alert("Erreur", "Impossible de charger les rôles");
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const perms = await getPermissions();
      setPermissionsList(perms);
    } catch {
      Alert.alert("Erreur", "Impossible de charger les permissions");
    }
  };

  const openAddModal = () => {
    setEditingRole(null);
    setName("");
    setSelectedPermissions([]);
    setModalVisible(true);
  };

  const openEditModal = (role) => {
    setEditingRole(role);
    setName(role.name);
    setSelectedPermissions(role.permissions || []);
    setModalVisible(true);
  };

  const togglePermission = (perm) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm)
        ? prev.filter((p) => p !== perm)
        : [...prev, perm]
    );
  };

  const handleSave = async () => {
    if (!name) {
      Alert.alert("Validation", "Nom obligatoire");
      return;
    }

    try {
      setLoading(true);

      if (editingRole) {
        await updateRole(editingRole.id, {
          name,
          permissions: selectedPermissions,
        });
        Alert.alert("Succès", "Rôle modifié");
      } else {
        await createRole({
          name,
          permissions: selectedPermissions,
        });
        Alert.alert("Succès", "Rôle créé");
      }

      setModalVisible(false);
      fetchRoles();
    } catch (err) {
      Alert.alert("Erreur", "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Confirmation", "Supprimer ce rôle ?", [
      { text: "Annuler" },
      {
        text: "Supprimer",
        onPress: async () => {
          try {
            setLoading(true);
            await deleteRole(id);
            fetchRoles();
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
      <Text style={styles.title}>Gestion des rôles</Text>

      <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
        <Text style={styles.addButtonText}>+ Ajouter rôle</Text>
      </TouchableOpacity>

      <FlatList
        data={roles}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={{ fontSize: 12, color: "#666" }}>
                {item.permissions?.join(", ")}
              </Text>
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

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <ScrollView contentContainerStyle={styles.modalContainer}>
          <Text style={styles.title}>
            {editingRole ? "Modifier rôle" : "Ajouter rôle"}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Nom du rôle"
            value={name}
            onChangeText={setName}
          />

          <Text style={{ fontWeight: "bold", marginTop: 10 }}>
            Permissions
          </Text>

          {permissionsList.map((perm) => (
            <TouchableOpacity
              key={perm}
              style={styles.permissionItem}
              onPress={() => togglePermission(perm)}
            >
              <Text>
                {selectedPermissions.includes(perm) ? "☑️" : "⬜"} {perm}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={{ color: "#fff" }}>Enregistrer</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setModalVisible(false)}>
            <Text style={{ marginTop: 20 }}>Annuler</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },

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
    padding: 20,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },

  permissionItem: {
    paddingVertical: 6,
  },

  saveButton: {
    backgroundColor: "green",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
});
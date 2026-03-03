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
import { Ionicons } from "@expo/vector-icons";
import { usePermissions } from "../../hooks/usePermissions";

import { getRoles, createRole, updateRole, deleteRole } from "../../services/roles.api";

export default function RolesScreen() {
  const [roles, setRoles] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [name, setName] = useState("");

  const permissionsList = usePermissions();

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const data = await getRoles();
      setRoles(data);
    } catch (err) {
      Alert.alert("Erreur", "Impossible de charger les rôles");
    } finally {
      setLoading(false);
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
    setName(role.nom || role.name);
    setSelectedPermissions(role.permissions || []);
    setModalVisible(true);
  };

  const togglePermission = (perm) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSave = async () => {
    if (!name) {
      Alert.alert("Validation", "Nom du rôle obligatoire");
      return;
    }

    try {
      setLoading(true);
      if (editingRole) {
        await updateRole(editingRole.id, { name, permissions: selectedPermissions });
        Alert.alert("Succès", "Rôle modifié");
      } else {
        await createRole({ name, permissions: selectedPermissions });
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
            Alert.alert("Erreur", "Erreur lors de la suppression");
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
        <Ionicons name="add-circle-outline" size={20} color="#fff" />
        <Text style={styles.addButtonText}> Ajouter rôle</Text>
      </TouchableOpacity>

      <FlatList
        data={roles}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.nom || item.name}</Text>
              <Text style={styles.permissionsText}>
                {item.permissions?.join(", ")}
              </Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity onPress={() => openEditModal(item)}>
                <Ionicons name="pencil-outline" size={24} color="#2e86de" />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Ionicons name="trash-outline" size={24} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalBackground}>
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

            <Text style={styles.permissionsTitle}>Permissions</Text>

            {permissionsList.map((perm) => (
              <TouchableOpacity
                key={perm}
                style={styles.permissionItem}
                onPress={() => togglePermission(perm)}
              >
                <Text style={styles.permissionText}>
                  {selectedPermissions.includes(perm) ? "✅" : "⬜"} {perm}
                </Text>
              </TouchableOpacity>
            ))}

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
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f0f4f8" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 15 },

  addButton: {
    flexDirection: "row",
    backgroundColor: "#2e86de",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  addButtonText: { color: "#fff", fontWeight: "bold", marginLeft: 5 },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },

  name: { fontWeight: "bold", fontSize: 16, marginBottom: 4 },
  permissionsText: { fontSize: 12, color: "#666" },

  actions: { flexDirection: "row", gap: 15 },

  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },

  permissionsTitle: { fontWeight: "bold", marginBottom: 10 },
  permissionItem: { paddingVertical: 6 },
  permissionText: { fontSize: 14 },

  saveButton: {
    backgroundColor: "green",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
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
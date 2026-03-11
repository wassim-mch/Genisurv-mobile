import React, { useEffect, useState, useRef } from "react";
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
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../../services/users.api";
import { getRoles } from "../../services/roles.api";
import { getWilayas } from "../../services/wilayas.api";

// ================= LOADER PERSONNALISÉ =================
function Loader({ loading }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [loading]);

  if (!loading) return null;

  return (
    <View style={styles.loader}>
      <Animated.Image
        source={require("../../../assets/images/logo.png")}
        style={[styles.loaderLogo, { opacity: fadeAnim }]}
      />
      <ActivityIndicator
        size="large"
        color="#2563eb"
        style={{ marginTop: 20 }}
      />
    </View>
  );
}

// ================= USERS SCREEN =================
export default function UsersScreen() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [wilayas, setWilayas] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [form, setForm] = useState({
    nom: "",
    email: "",
    role_id: "",
    wilaya_id: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const usersData = await getUsers();
      const rolesData = await getRoles();
      const wilayasData = await getWilayas();

      setUsers(usersData);
      setFilteredUsers(usersData);
      setRoles(rolesData);
      setWilayas(wilayasData);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les données");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearch(text);
    const filtered = users.filter((u) =>
      u.nom?.toLowerCase().includes(text.toLowerCase()) ||
      u.email?.toLowerCase().includes(text.toLowerCase()) ||
      u.role?.toLowerCase().includes(text.toLowerCase()) ||
      (u.wilaya?.toLowerCase() || "").includes(text.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const openAddModal = () => {
    setEditingUser(null);
    setForm({
      nom: "",
      email: "",
      role_id: "",
      wilaya_id: "",
      password: "",
      confirmPassword: "",
    });
    setModalVisible(true);
  };

  const openEditModal = (user) => {
    const roleObj = roles.find((r) => r.nom === user.role);
    const wilayaObj = wilayas.find((w) => w.nom === user.wilaya);
    setEditingUser(user);
    setForm({
      nom: user.nom,
      email: user.email,
      role_id: roleObj ? roleObj.id : "",
      wilaya_id: wilayaObj ? wilayaObj.id : "",
      password: "",
      confirmPassword: "",
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.nom || !form.email || !form.role_id) {
      Alert.alert("Erreur", "Nom, email et rôle sont obligatoires");
      return;
    }
    if (!editingUser && form.password !== form.confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
      return;
    }

    try {
      const dataToSend = {
        name: form.nom,
        email: form.email,
        role_id: form.role_id,
        wilaya_id: form.wilaya_id || null,
        ...(form.password && { password: form.password }),
      };

      if (editingUser) {
        await updateUser(editingUser.id, dataToSend);
      } else {
        await createUser(dataToSend);
      }

      Alert.alert("Succès", "Utilisateur enregistré !");
      setModalVisible(false);
      fetchData();
    } catch (error) {
      console.log("ERREUR COMPLETE:", error.response?.data);
      Alert.alert(
        "Erreur",
        error.response?.data?.message ||
          JSON.stringify(error.response?.data?.errors)
      );
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Confirmation", "Supprimer cet utilisateur ?", [
      { text: "Annuler" },
      {
        text: "Supprimer",
        onPress: async () => {
          await deleteUser(id);
          fetchData();
        },
      },
    ]);
  };

  // ======== RENDER LOADER ========
  if (loading) {
    return <Loader loading={loading} />;
  }

  // ======== RENDER MAIN SCREEN ========
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="people-outline" size={24} color="#2e86de" />
        <Text style={styles.title}>Gestion des utilisateurs</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#2e86de" />
        <TextInput
          style={styles.search}
          placeholder="Rechercher par nom, email, role, wilaya..."
          value={search}
          onChangeText={handleSearch}
        />
      </View>

      <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
        <Ionicons name="add-circle-outline" size={20} color="#fff" />
        <Text style={styles.addButtonText}> Ajouter</Text>
      </TouchableOpacity>

      <ScrollView horizontal>
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            {[
              "ID",
              "Nom",
              "Email",
              "Status",
              "Mot de passe",
              "Role",
              "Wilaya",
              "Action",
            ].map((h, i) => (
              <View key={i} style={styles.th}>
                <Text style={styles.thText}>{h}</Text>
              </View>
            ))}
          </View>

          {filteredUsers.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={styles.td}>{item.id}</Text>
              <Text style={styles.td}>{item.nom}</Text>
              <Text style={styles.td}>{item.email}</Text>
              <Text
                style={[
                  styles.td,
                  { color: item.email_verification ? "green" : "red" },
                ]}
              >
                {item.email_verification ? "Vérifié" : "Non vérifié"}
              </Text>
              <Text style={styles.td}>********</Text>
              <Text style={styles.td}>{item.role}</Text>
              <Text style={styles.td}>{item.wilaya || "-"}</Text>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => openEditModal(item)}>
                  <Ionicons name="create-outline" size={20} color="#2e86de" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <Ionicons name="trash-outline" size={20} color="red" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide">
        <ScrollView style={{ padding: 20 }}>
          <Text style={styles.modalTitle}>
            {editingUser ? "Modifier utilisateur" : "Ajouter utilisateur"}
          </Text>

          {renderInput("person-outline", "Nom", "nom")}
          {renderInput("mail-outline", "Email", "email")}

          <View style={styles.inputContainer}>
            <Ionicons name="ribbon-outline" size={20} color="#2e86de" />
            <Picker
              selectedValue={form.role_id}
              style={styles.picker}
              onValueChange={(value) => setForm({ ...form, role_id: value })}
            >
              <Picker.Item label="Sélectionner un role" value="" />
              {roles.map((r) => (
                <Picker.Item key={r.id} label={r.nom} value={r.id} />
              ))}
            </Picker>
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="location-outline" size={20} color="#2e86de" />
            <Picker
              selectedValue={form.wilaya_id}
              style={styles.picker}
              onValueChange={(value) =>
                setForm({ ...form, wilaya_id: value })
              }
            >
              <Picker.Item label="Sélectionner une wilaya" value="" />
              {wilayas.map((w) => (
                <Picker.Item key={w.id} label={w.nom} value={w.id} />
              ))}
            </Picker>
          </View>

          {!editingUser && (
            <>
              {renderInput(
                "lock-closed-outline",
                "Mot de passe",
                "password",
                true
              )}
              {renderInput(
                "lock-closed-outline",
                "Confirmer mot de passe",
                "confirmPassword",
                true
              )}
            </>
          )}

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveText}>Enregistrer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.cancelText}>Annuler</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  );

  function renderInput(icon, placeholder, field, secure = false) {
    return (
      <View style={styles.inputContainer}>
        <Ionicons name={icon} size={20} color="#2e86de" />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          secureTextEntry={secure}
          value={form[field]}
          onChangeText={(text) => setForm({ ...form, [field]: text })}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f4f8fb" },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
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
  title: { fontSize: 22, fontFamily: "Poppins-Bold", color: "#2e86de" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d6e6f9",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  search: { marginLeft: 10, flex: 1, fontFamily: "Poppins-Regular" },

  addButton: {
    flexDirection: "row",
    backgroundColor: "#2e86de",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  addButtonText: { color: "#fff", fontFamily: "Poppins-Bold" },
  tableContainer: {
    borderWidth: 1,
    borderColor: "#d6e6f9",
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  tableHeader: { flexDirection: "row", backgroundColor: "#d6e6f9", padding: 10 },
  th: { width: 120 },
  thText: { fontFamily: "Poppins-Bold", color: "#2e86de" },
  tableRow: { flexDirection: "row", padding: 10, borderBottomWidth: 1, borderColor: "#eee" },
  td: { width: 120, fontFamily: "Poppins-Regular", color: "#000" },
  actions: { flexDirection: "row", gap: 15 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  input: { marginLeft: 10, flex: 1, fontFamily: "Poppins-Regular" },
  picker: { flex: 1 },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#2e86de",
  },
  saveButton: {
    backgroundColor: "green",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  saveText: { color: "#fff", fontFamily: "Poppins-Bold" },
  cancelButton: {
    backgroundColor: "red",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  cancelText: { color: "#fff", fontFamily: "Poppins-Bold" },
});
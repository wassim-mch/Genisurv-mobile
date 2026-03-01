import React, { useEffect, useState } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

import { getUsers, createUser, updateUser, deleteUser } from "../../services/users.api";
import { getRoles } from "../../services/roles.api";
import { getWilayas } from "../../services/wilayas.api";

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
    role: "",
    wilaya: "",
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

  // Recherche avancée
  const handleSearch = (text) => {
    setSearch(text);

    const filtered = users.filter((u) =>
      u.nom.toLowerCase().includes(text.toLowerCase()) ||
      u.email.toLowerCase().includes(text.toLowerCase()) ||
      (u.role || "").toLowerCase().includes(text.toLowerCase()) ||
      (u.wilaya || "").toLowerCase().includes(text.toLowerCase())
    );

    setFilteredUsers(filtered);
  };

  const openAddModal = () => {
    setEditingUser(null);
    setForm({
      nom: "",
      email: "",
      role: "",
      wilaya: "",
      password: "",
      confirmPassword: "",
    });
    setModalVisible(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setForm({
      nom: user.nom,
      email: user.email,
      role: user.role,
      wilaya: user.wilaya,
      password: "",
      confirmPassword: "",
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!editingUser && form.password !== form.confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
      return;
    }

    try {
      if (editingUser) {
        await updateUser(editingUser.id, form);
      } else {
        await createUser(form);
      }

      setModalVisible(false);
      fetchData();
    } catch (error) {
      Alert.alert("Erreur", "Erreur lors de l'enregistrement");
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

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  return (
    <View style={styles.container}>
      {/* TITRE CENTRÉ */}
      <View style={styles.header}>
        <Ionicons name="people-outline" size={24} color="#2e86de" />
        <Text style={styles.title}>Gestion des utilisateurs</Text>
      </View>

      {/* Recherche */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#2e86de" />
        <TextInput
          style={styles.search}
          placeholder="Rechercher par nom, email, role, wilaya..."
          value={search}
          onChangeText={handleSearch}
        />
      </View>

      {/* Ajouter */}
      <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
        <Ionicons name="add-circle-outline" size={20} color="#fff" />
        <Text style={styles.addButtonText}> Ajouter</Text>
      </TouchableOpacity>

      {/* TABLEAU */}
      <ScrollView horizontal>
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            {[
              {label:"ID", icon:"hash-outline"},
              {label:"Nom", icon:"person-outline"},
              {label:"Email", icon:"mail-outline"},
              {label:"Status", icon:"checkmark-circle-outline"},
              {label:"Mot de passe", icon:"lock-closed-outline"},
              {label:"Role", icon:"ribbon-outline"},
              {label:"Wilaya", icon:"location-outline"},
              {label:"Action", icon:"settings-outline"}
            ].map((h,i)=>(
              <View key={i} style={styles.th}>
                <Ionicons name={h.icon} size={16} color="#2e86de" />
                <Text style={styles.thText}>{h.label}</Text>
              </View>
            ))}
          </View>

          {filteredUsers.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={styles.td}>{item.id}</Text>
              <Text style={styles.td}>{item.nom}</Text>
              <Text style={styles.td}>{item.email}</Text>
              <Text style={[
                styles.td,
                { color: item.email_verification ? "green" : "red" }
              ]}>
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

      {/* MODAL */}
      <Modal visible={modalVisible} animationType="slide">
        <ScrollView style={{ padding: 20 }}>
          <Text style={styles.modalTitle}>
            {editingUser ? "Modifier utilisateur" : "Ajouter utilisateur"}
          </Text>

          {/* Nom */}
          {renderInput("person-outline","Nom","nom")}

          {/* Email */}
          {renderInput("mail-outline","Email","email")}

          {/* Role */}
          <View style={styles.inputContainer}>
            <Ionicons name="ribbon-outline" size={20} color="#2e86de" />
            <Picker
              selectedValue={form.role}
              style={styles.picker}
              onValueChange={(value) => setForm({ ...form, role: value })}
            >
              <Picker.Item label="Sélectionner un role" value="" />
              {roles.map((r) => (
                <Picker.Item key={r.id} label={r.nom} value={r.nom} />
              ))}
            </Picker>
          </View>

          {/* Wilaya */}
          <View style={styles.inputContainer}>
            <Ionicons name="location-outline" size={20} color="#2e86de" />
            <Picker
              selectedValue={form.wilaya}
              style={styles.picker}
              onValueChange={(value) => setForm({ ...form, wilaya: value })}
            >
              <Picker.Item label="Sélectionner une wilaya" value="" />
              {wilayas.map((w) => (
                <Picker.Item key={w.id} label={w.nom} value={w.nom} />
              ))}
            </Picker>
          </View>

          {!editingUser && (
            <>
              {renderInput("lock-closed-outline","Mot de passe","password",true)}
              {renderInput("lock-closed-outline","Confirmer mot de passe","confirmPassword",true)}
            </>
          )}

          {/* Boutons */}
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

  function renderInput(icon, placeholder, field, secure=false) {
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
  container:{flex:1,padding:20,backgroundColor:"#f4f8fb"},
  header:{flexDirection:"row",alignItems:"center",justifyContent:"center",marginBottom:15,gap:10},
  title:{fontSize:22,fontFamily:"Poppins-Bold",color:"#2e86de"},
  searchContainer:{flexDirection:"row",alignItems:"center",borderWidth:1,borderColor:"#d6e6f9",padding:10,borderRadius:10,marginBottom:10},
  search:{marginLeft:10,flex:1,fontFamily:"Poppins-Regular"},
  addButton:{flexDirection:"row",backgroundColor:"#2e86de",padding:12,borderRadius:10,alignItems:"center",justifyContent:"center",marginBottom:15},
  addButtonText:{color:"#fff",fontFamily:"Poppins-Bold"},
  tableContainer:{borderWidth:1,borderColor:"#d6e6f9",borderRadius:10,shadowColor:"#000",shadowOffset:{width:0,height:2},shadowOpacity:0.2,shadowRadius:4,elevation:5,backgroundColor:"#fff"},
  tableHeader:{flexDirection:"row",backgroundColor:"#d6e6f9",padding:10,borderTopLeftRadius:10,borderTopRightRadius:10},
  th:{width:120,flexDirection:"row",alignItems:"center",gap:5},
  thText:{fontFamily:"Poppins-Bold",color:"#2e86de"},
  tableRow:{flexDirection:"row",padding:10,borderBottomWidth:1,borderColor:"#eee",alignItems:"center"},
  td:{width:120,fontFamily:"Poppins-Regular",color:"#000"},
  actions:{flexDirection:"row",gap:15},
  inputContainer:{flexDirection:"row",alignItems:"center",borderWidth:1,borderColor:"#ccc",padding:10,borderRadius:10,marginBottom:10},
  input:{marginLeft:10,flex:1,fontFamily:"Poppins-Regular"},
  picker:{flex:1},
  modalTitle:{fontSize:20,fontFamily:"Poppins-Bold",marginBottom:15,textAlign:"center",color:"#2e86de"},
  saveButton:{backgroundColor:"green",padding:14,borderRadius:10,alignItems:"center",marginTop:10},
  saveText:{color:"#fff",fontFamily:"Poppins-Bold"},
  cancelButton:{backgroundColor:"red",padding:14,borderRadius:10,alignItems:"center",marginTop:10},
  cancelText:{color:"#fff",fontFamily:"Poppins-Bold"},
});
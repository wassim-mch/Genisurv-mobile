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
  Image,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { AuthContext } from "../../context/AuthContext";
import {
  getDecaissements,
  createDecaissement,
  updateDecaissement,
  deleteDecaissement,
} from "../../services/decaissements.api";

// ===== LOADER =====
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
        ]),
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

// ===== PDF VIEWER =====

const tableHeaders = [
  { label: "Montant", icon: "cash-outline" },
  { label: "Désignation", icon: "create-outline" },
  { label: "Observation", icon: "chatbox-outline" },
  { label: "Type Justificatif", icon: "document-text-outline" },
  { label: "Justificatif", icon: "folder-open-outline" },
  { label: "État", icon: "stats-chart-outline" },
  { label: "Date", icon: "calendar-outline" },
  { label: "Action", icon: "settings-outline" },
];

// ===== SCREEN =====
export default function DecaissementScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  const [decaissements, setDecaissements] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState(null);
  const [montant, setMontant] = useState("");
  const [designation, setDesignation] = useState("");
  const [observation, setObservation] = useState("");
  const [typeJustif, setTypeJustif] = useState("autre");
  const [justificatif, setJustificatif] = useState(null);
  const [selectedCaisse, setSelectedCaisse] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getDecaissements(user.caisse_id);
      setDecaissements(data);
      setFilteredData(data);
    } catch {
      Alert.alert("Erreur", "Chargement impossible");
    } finally {
      setLoading(false);
    }
  };

  // SEARCH
  const handleSearch = (text) => {
    setSearch(text);
    const filtered = decaissements.filter(
      (e) =>
        e.designation?.toLowerCase().includes(text.toLowerCase()) ||
        e.observation?.toLowerCase().includes(text.toLowerCase()) ||
        e.type_justificatif?.toLowerCase().includes(text.toLowerCase()) ||
        e.etat_justificatif?.toLowerCase().includes(text.toLowerCase()),
    );
    setFilteredData(filtered);
  };

  // PICK IMAGE / TAKE PHOTO
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 1,
    });
    if (!result.canceled) setJustificatif(result.assets[0]);
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 1,
    });
    if (!result.canceled) setJustificatif(result.assets[0]);
  };

  // CREATE / UPDATE
  const handleCreateOrUpdate = async () => {
    if (!montant || !designation || !observation) {
      return Alert.alert("Erreur", "Tous les champs sont obligatoires");
    }

    const montantNumber = parseFloat(montant);
    if (isNaN(montantNumber) || montantNumber <= 0) {
      return Alert.alert("Erreur", "Montant invalide");
    }

    const caisseId = selectedCaisse || user.caisse_id;
    if (!caisseId) {
      return Alert.alert("Erreur", "Aucune caisse sélectionnée");
    }

    const formData = new FormData();
    formData.append("caisse_id", caisseId);
    formData.append("montant", montantNumber.toString());
    formData.append("designation", designation);
    formData.append("observation", observation);
    formData.append("type_justif", typeJustif || "autre");

    if (justificatif) {
      if (Platform.OS === "web") {
        const response = await fetch(justificatif.uri);
        const blob = await response.blob();
        formData.append(
          "file_path",
          blob,
          `justif.${justificatif.uri.split(".").pop()}`,
        );
      } else {
        const uriParts = justificatif.uri.split(".");
        const fileType = uriParts[uriParts.length - 1].toLowerCase();
        formData.append("file_path", {
          uri: justificatif.uri,
          name: `justif.${fileType}`,
          type:
            fileType === "pdf"
              ? "application/pdf"
              : `image/${fileType === "jpg" ? "jpeg" : fileType}`,
        });
      }
    }

    try {
      if (editId) await updateDecaissement(editId, formData);
      else await createDecaissement(formData);

      Alert.alert(
        "Succès",
        editId ? "Décaissement modifié" : "Décaissement ajouté",
      );

      setMontant("");
      setDesignation("");
      setObservation("");
      setTypeJustif("autre");
      setJustificatif(null);
      setEditId(null);
      setModalVisible(false);
      fetchData();
    } catch (error) {
      console.log(error.response?.data || error);
      const message =
        error.response?.data?.message ||
        "Impossible d'enregistrer. Vérifiez les champs.";
      Alert.alert("Erreur", message);
    }
  };

  const handleDelete = (item) => {
    if (!item) return;

    // 🔒 Sécurité métier (optionnelle)
    if (item.etat_justificatif !== "attente") {
      return Alert.alert("Erreur", "Impossible de supprimer (déjà validé)");
    }

    Alert.alert("Confirmation", "Supprimer ?", [
      { text: "Annuler" },
      {
        text: "Supprimer",
        onPress: async () => {
          try {
            await deleteDecaissement(item.id);

            fetchData();
            Alert.alert("Succès", "Supprimé avec succès");
          } catch (error) {
            console.log("DELETE ERROR:", error);
            Alert.alert(
              "Erreur",
              error.response?.data?.message || "Erreur serveur",
            );
          }
        },
      },
    ]);
  };

  const handleEdit = (item) => {
    if (item.etat_justificatif !== "attente") return;
    setEditId(item.id);
    setMontant(item.montant.toString());
    setDesignation(item.designation);
    setObservation(item.observation);
    setTypeJustif(item.type_justificatif || "autre");
    setJustificatif(null);
    setModalVisible(true);
  };

  if (loading) return <Loader loading={loading} />;

  // Conversion pour le dropdown désignation
  const montantNumber = parseFloat(montant) || 0;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Mes Décaissements</Text>
      </View>

      {/* SEARCH */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#2e86de" />
        <TextInput
          style={styles.search}
          placeholder="Recherche..."
          value={search}
          onChangeText={handleSearch}
        />
      </View>

      {/* TABLE */}
      <ScrollView horizontal>
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            {tableHeaders.map((h, i) => (
              <View key={i} style={styles.th}>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
                >
                  <Ionicons name={h.icon} size={16} color="#2e86de" />
                  <Text style={styles.thText}>{h.label}</Text>
                </View>
              </View>
            ))}
          </View>

          {filteredData.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={[styles.td]}>{item.montant} DA</Text>
              <Text style={styles.td}>{item.designation}</Text>
              <Text style={styles.td}>{item.observation}</Text>
              <Text style={styles.td}>{item.type_justificatif}</Text>

              <TouchableOpacity
                style={styles.td}
                onPress={() => {
                  if (!item.lien_justificatif) {
                    return Alert.alert("Aucun justificatif disponible");
                  }

                  navigation.navigate("Preview", {
                    url: item.lien_justificatif,
                    type: item.lien_justificatif?.includes(".pdf")
                      ? "pdf"
                      : "image",
                  });
                }}
              >
                {item.lien_justificatif ? (
                  <Ionicons
                    name="document-text-outline"
                    size={20}
                    color="#2e86de"
                  />
                ) : (
                  <Text>-</Text>
                )}
              </TouchableOpacity>

              <Text
                style={[
                  styles.td,
                  {
                    color:
                      item.etat_justificatif === "justifié"
                        ? "green"
                        : item.etat_justificatif === "necessite une facture"
                          ? "red"
                          : "orange",
                  },
                ]}
              >
                {item.etat_justificatif}
              </Text>

              <Text style={styles.td}>{item.date_creation}</Text>

              <View style={styles.actions}>
                <TouchableOpacity onPress={() => handleEdit(item)}>
                  <Ionicons name="pencil-outline" size={20} color="orange" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item)}>
                  <Ionicons name="trash-outline" size={20} color="red" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* MODAL */}
      <Modal visible={modalVisible} animationType="slide">
        <ScrollView style={{ padding: 20 }}>
          <Text style={styles.modalTitle}>
            {editId ? "Modifier Décaissement" : "Nouveau Décaissement"}
          </Text>

          <TextInput
            placeholder="Montant"
            value={montant}
            onChangeText={setMontant}
            keyboardType="numeric"
            style={styles.input}
          />

          {/* Désignation */}
          <TextInput
            placeholder="Désignation (ex: Achat matériel, transport...)"
            value={designation}
            onChangeText={setDesignation}
            style={styles.input}
          />

          {/* Observation */}
          <TextInput
            placeholder="Observation"
            value={observation}
            onChangeText={setObservation}
            style={styles.input}
          />

          {/* Type Justificatif */}
          <Text style={{ marginBottom: 5 }}>Type de justificatif</Text>
          <View style={styles.dropdown}>
            {["facture", "reçu", "autre"].map((t) => (
              <TouchableOpacity key={t} onPress={() => setTypeJustif(t)}>
                <Text
                  style={[
                    styles.dropdownItem,
                    typeJustif === t && { fontWeight: "bold" },
                  ]}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* IMAGE PREVIEW */}
          {justificatif && (
            <View style={{ alignItems: "center", marginBottom: 10 }}>
              <Image
                source={{ uri: justificatif.uri }}
                style={{ width: 200, height: 200, resizeMode: "contain" }}
              />
            </View>
          )}

          <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
            <TouchableOpacity style={styles.justifButton} onPress={takePhoto}>
              <Text style={styles.justifText}>📷 Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.justifButton} onPress={pickImage}>
              <Text style={styles.justifText}>📁 Galerie</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleCreateOrUpdate}
          >
            <Text style={styles.saveText}>Enregistrer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              setModalVisible(false);
              setEditId(null);
              setJustificatif(null);
            }}
          >
            <Text style={styles.cancelText}>Annuler</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>

      {/* PDF VIEWER */}
    </View>
  );
}

// ===== STYLES =====
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f4f8fb" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  loaderLogo: { width: 200, height: 200, resizeMode: "contain" },
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
  tableContainer: {
    borderWidth: 1,
    borderColor: "#d6e6f9",
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#d6e6f9",
    padding: 10,
  },
  th: { width: 120 },
  thText: { fontFamily: "Poppins-Bold", color: "#2e86de", fontSize: 13 },
  tableRow: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  td: { width: 120, fontFamily: "Poppins-Regular", color: "#000" },
  actions: { flexDirection: "row", gap: 15 },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "#0c4d8b",
    width: 50,
    height: 50,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#2e86de",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
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
  dropdown: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
    flexWrap: "wrap",
  },
  dropdownItem: {
    padding: 5,
    borderWidth: 1,
    borderColor: "#d6e6f9",
    borderRadius: 5,
  },
  justifButton: {
    flex: 1,
    backgroundColor: "#2e86de",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  justifText: { color: "#fff", fontFamily: "Poppins-Bold" },
});

import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  StyleSheet,
  Animated,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";

import {
  getAlimentations,
  createAlimentation,
  updateAlimentation,
} from "../../services/alimentations.api";
import { getCaisses } from "../../services/caisses.api";

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

// ================= ALIMENTATION SCREEN =================
export default function AlimentationScreen() {
  const [caisses, setCaisses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ montant: "", note: "" });

  // Charger les polices
  const [fontsLoaded] = useFonts({
    Poppins_400Regular: require("../../../assets/fonts/Poppins-Regular.ttf"),
    Poppins_600SemiBold: require("../../../assets/fonts/Poppins-SemiBold.ttf"),
    Poppins_700Bold: require("../../../assets/fonts/Poppins-Bold.ttf"),
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const caisseData = await getCaisses();
      const alimData = await getAlimentations();

      // Fusionner alimentation la plus récente par caisse
      const merged = caisseData.map((caisse) => {
        const alim = alimData.find((a) => a.caisse?.id === caisse.id) || null;
        return {
          ...caisse,
          alim,
          wilaya_name: caisse.wilaya || caisse.wilaya_name || "-",
        };
      });

      setCaisses(merged);
      setLoading(false);
    } catch (err) {
      console.log(err);
      Alert.alert("Erreur", "Impossible de charger les données");
      setLoading(false);
    }
  };

  const openModal = (caisse) => {
    setEditingItem(caisse);
    setForm({ montant: caisse.alim?.montant || "", note: caisse.alim?.par || "" });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.montant) {
      Alert.alert("Validation", "Le montant est obligatoire");
      return;
    }

    try {
      setLoading(true);
      const payload = { montant: parseFloat(form.montant) };

      if (editingItem.alim) {
        await updateAlimentation(editingItem.alim.id, payload);
        Alert.alert("Succès", "Alimentation modifiée");
      } else {
        await createAlimentation({ ...payload, caisse_id: editingItem.id });
        Alert.alert("Succès", "Alimentation créée");
      }

      setModalVisible(false);
      fetchData();
    } catch (err) {
      console.log(err);
      Alert.alert("Erreur", "Impossible d'enregistrer l'alimentation");
    } finally {
      setLoading(false);
    }
  };

  // ======== RENDER LOADER ========
  if (loading) return <Loader loading={loading} />;

  // ======== RENDER MAIN SCREEN ========
  return (
    <View style={styles.container}>
      <Text style={styles.title}>💰 Gestion des Alimentations</Text>

      {/* TABLEAU */}
      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, { flex: 2 }]}>
          <Ionicons name="cash-outline" size={16} color="#fff" /> Caisse
        </Text>
        <Text style={[styles.headerCell, { flex: 2 }]}>
          <Ionicons name="wallet-outline" size={16} color="#fff" /> Montant
        </Text>
        <Text style={[styles.headerCell, { flex: 2 }]}>
          <Ionicons name="person-outline" size={16} color="#fff" /> Par
        </Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>
          <Ionicons name="add-circle-outline" size={16} color="#fff" /> Action
        </Text>
      </View>

      <FlatList
        data={caisses}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 50 }}
        renderItem={({ item }) => {
          let solde = item.solde_actuel ?? 0;
          if (item.alim?.montant != null) {
            solde =
              typeof item.alim.montant === "string"
                ? parseFloat(item.alim.montant.replace(/\s/g, "").replace(",", "."))
                : Number(item.alim.montant);
          }
          const isLow = solde <= 5000 && solde > 0;

          return (
            <View style={styles.row}>
              <Text style={[styles.cell, { flex: 2 }]}>{item.wilaya_name}</Text>
              <Text
                style={[
                  styles.cell,
                  { flex: 2, color: isLow ? "#e74c3c" : "#27ae60", fontWeight: "bold" },
                ]}
              >
                {solde} DA
              </Text>
              <Text style={[styles.cell, { flex: 2 }]}>{item.alim?.user?.roles || "superadmin"}</Text>
              <TouchableOpacity
                style={[styles.actionButton, { flex: 1 }]}
                onPress={() => openModal(item)}
              >
                <Ionicons name="add-circle-outline" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          );
        }}
      />

      {/* MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <ScrollView contentContainerStyle={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingItem?.alim ? "Modifier Alimentation" : "Nouvelle Alimentation"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Montant"
              keyboardType="numeric"
              value={form.montant.toString()}
              onChangeText={(text) => setForm({ ...form, montant: text })}
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Enregistrer</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f4f6f9" },
  title: { fontSize: 22, fontWeight: "700", color: "#2e86de", textAlign: "center", marginBottom: 15, fontFamily: "Poppins_700Bold" },

  loader: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f1f5f9" },
  loaderLogo: { width: 200, height: 200, resizeMode: "contain" },

  tableHeader: { flexDirection: "row", backgroundColor: "#3498db", paddingVertical: 12, borderRadius: 8 },
  headerCell: { color: "#fff", fontWeight: "600", textAlign: "center", fontSize: 13, fontFamily: "Poppins_600SemiBold" },

  row: { flexDirection: "row", backgroundColor: "#fff", paddingVertical: 12, marginTop: 6, borderRadius: 8, elevation: 2, alignItems: "center" },
  cell: { textAlign: "center", fontSize: 13, fontFamily: "Poppins_400Regular" },

  actionButton: { backgroundColor: "#38ada9", padding: 6, borderRadius: 6, alignItems: "center", justifyContent: "center" },

  modalContainer: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.3)", padding: 20 },
  modalContent: { backgroundColor: "#fff", borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15, fontFamily: "Poppins_700Bold", textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 10, padding: 12, marginBottom: 15, backgroundColor: "#fff", fontFamily: "Poppins_400Regular" },
  saveButton: { backgroundColor: "#2e86de", padding: 14, borderRadius: 10, alignItems: "center", marginTop: 10 },
  saveButtonText: { color: "#fff", fontWeight: "bold" },
  cancelButton: { backgroundColor: "#e74c3c", padding: 14, borderRadius: 10, alignItems: "center", marginTop: 10 },
  cancelButtonText: { color: "#fff", fontWeight: "bold" },
});
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
  getAlimentations,
  createAlimentation,
  updateAlimentation,
} from "../../services/alimentations.api";

import { getCaisses } from "../../services/caisses.api";

export default function AlimentationScreen() {
  const [alimentations, setAlimentations] = useState([]);
  const [caisses, setCaisses] = useState([]);

  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [form, setForm] = useState({
    amount: "",
    caisse_id: "",
    note: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getAlimentations();
      const caisseData = await getCaisses();

      setAlimentations(data);
      setCaisses(caisseData);
    } catch {
      Alert.alert("Erreur", "Impossible de charger les données");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setForm({ amount: "", caisse_id: "", note: "" });
    setModalVisible(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({
      amount: item.amount.toString(),
      caisse_id: item.caisse?.id,
      note: item.note || "",
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.amount || !form.caisse_id) {
      Alert.alert("Validation", "Montant et caisse obligatoires");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        amount: Number(form.amount),
        caisse_id: form.caisse_id,
        note: form.note,
      };

      if (editingItem) {
        await updateAlimentation(editingItem.id, payload);
        Alert.alert("Succès", "Alimentation modifiée");
      } else {
        await createAlimentation(payload);
        Alert.alert("Succès", "Alimentation créée");
      }

      setModalVisible(false);
      fetchData();
    } catch {
      Alert.alert("Erreur", "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestion des Alimentations</Text>

      <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
        <Text style={styles.addButtonText}>+ Ajouter</Text>
      </TouchableOpacity>

      <FlatList
        data={alimentations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.amount}>{item.amount} DA</Text>
            <Text>Caisse : {item.caisse?.name}</Text>
            <Text>Date : {item.created_at}</Text>
            <Text>Note : {item.note}</Text>

            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => openEditModal(item)}
            >
              <Text style={{ color: "#fff" }}>Modifier</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <ScrollView contentContainerStyle={styles.modalContainer}>
          <Text style={styles.title}>
            {editingItem ? "Modifier" : "Nouvelle"} Alimentation
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Montant"
            keyboardType="numeric"
            value={form.amount}
            onChangeText={(text) =>
              setForm({ ...form, amount: text })
            }
          />

          <Text style={{ fontWeight: "bold", marginTop: 10 }}>
            Sélectionner Caisse
          </Text>

          {caisses.map((c) => (
            <TouchableOpacity
              key={c.id}
              onPress={() =>
                setForm({ ...form, caisse_id: c.id })
              }
              style={styles.caisseItem}
            >
              <Text>
                {form.caisse_id === c.id ? "☑️" : "⬜"} {c.name}
              </Text>
            </TouchableOpacity>
          ))}

          <TextInput
            style={styles.input}
            placeholder="Observation"
            value={form.note}
            onChangeText={(text) =>
              setForm({ ...form, note: text })
            }
          />

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
          >
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
    elevation: 3,
  },

  amount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "green",
  },

  editBtn: {
    marginTop: 10,
    backgroundColor: "#f39c12",
    padding: 6,
    borderRadius: 6,
    alignItems: "center",
  },

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

  caisseItem: {
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
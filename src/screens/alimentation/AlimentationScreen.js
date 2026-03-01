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
  getAlimentations,
  createAlimentation,
  updateAlimentation,
  deleteAlimentation,
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

  const handleDelete = (id) => {
    Alert.alert("Confirmation", "Supprimer cette alimentation ?", [
      { text: "Annuler" },
      {
        text: "Supprimer",
        onPress: async () => {
          try {
            setLoading(true);
            await deleteAlimentation(id);
            fetchData();
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
      <Text style={styles.title}>Gestion des Alimentations</Text>

      <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
        <Text style={styles.addButtonText}>+ Ajouter</Text>
      </TouchableOpacity>

      {/* Tableau */}
      <View style={styles.tableHeader}>
        <Text style={[styles.cell, { flex: 2 }]}>Montant</Text>
        <Text style={[styles.cell, { flex: 2 }]}>Caisse</Text>
        <Text style={[styles.cell, { flex: 2 }]}>Date</Text>
        <Text style={[styles.cell, { flex: 3 }]}>Note</Text>
        <Text style={[styles.cell, { flex: 2 }]}>Actions</Text>
      </View>

      <FlatList
        data={alimentations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.tableRow}>
            <Text style={[styles.cell, { flex: 2, fontWeight: "bold", color: "green" }]}>
              {item.amount} DA
            </Text>
            <Text style={[styles.cell, { flex: 2 }]}>
              {item.caisse?.name || "-"}
            </Text>
            <Text style={[styles.cell, { flex: 2 }]}>
              {item.created_at}
            </Text>
            <Text style={[styles.cell, { flex: 3 }]}>
              {item.note || "-"}
            </Text>
            <View style={[styles.cell, { flex: 2, flexDirection: "row", gap: 10 }]}>
              <TouchableOpacity onPress={() => openEditModal(item)}>
                <Ionicons name="pencil" size={20} color="#2e86de" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Ionicons name="trash" size={20} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <ScrollView contentContainerStyle={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            {editingItem ? "Modifier" : "Nouvelle"} Alimentation
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Montant"
            keyboardType="numeric"
            value={form.amount}
            onChangeText={(text) => setForm({ ...form, amount: text })}
          />

          <Text style={{ fontWeight: "bold", marginBottom: 8 }}>Sélectionner Caisse</Text>
          {caisses.map((c) => (
            <TouchableOpacity
              key={c.id}
              onPress={() => setForm({ ...form, caisse_id: c.id })}
              style={styles.caisseItem}
            >
              <Text>{form.caisse_id === c.id ? "☑️" : "⬜"} {c.name}</Text>
            </TouchableOpacity>
          ))}

          <TextInput
            style={styles.input}
            placeholder="Observation"
            value={form.note}
            onChangeText={(text) => setForm({ ...form, note: text })}
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

  addButton: {
    backgroundColor: "#2e86de",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  addButtonText: { color: "#fff", fontWeight: "bold" },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#dcdde1",
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 8,
    marginBottom: 5,
  },
  tableRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 5,
    borderRadius: 8,
    marginBottom: 5,
    alignItems: "center",
    elevation: 2,
  },
  cell: { paddingHorizontal: 5, fontSize: 14 },

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

  caisseItem: { paddingVertical: 6 },

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
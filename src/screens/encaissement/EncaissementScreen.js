import React, { useEffect, useState, useRef, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Animated,
  ScrollView,
  Platform
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import * as Sharing from "expo-sharing";
import FileSystem from "expo-file-system";

import { AuthContext } from "../../context/AuthContext";
import {
  getEncaissements,
  createEncaissement,
  deleteEncaissement
} from "../../services/encaissements.api";

// Wrapper Victory pour mobile + web
let VictoryChart, VictoryBar, VictoryLine, VictoryPie, VictoryTheme;

if (Platform.OS === "web") {
  const victory = require("victory");
  VictoryChart = victory.VictoryChart;
  VictoryBar = victory.VictoryBar;
  VictoryLine = victory.VictoryLine;
  VictoryPie = victory.VictoryPie;
  VictoryTheme = victory.VictoryTheme;
} else {
  const victory = require("victory-native");
  VictoryChart = victory.VictoryChart;
  VictoryBar = victory.VictoryBar;
  VictoryLine = victory.VictoryLine;
  VictoryPie = victory.VictoryPie;
  VictoryTheme = victory.VictoryTheme;
}

export default function EncaissementScreen() {
  const { user } = useContext(AuthContext);

  const [encaissements, setEncaissements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("date_desc");

  const [modalVisible, setModalVisible] = useState(false);
  const [montant, setMontant] = useState("");
  const [rapport, setRapport] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Animation logo
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0, duration: 600, useNativeDriver: true })
      ])
    ).start();
  }, []);

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getEncaissements();
      let enc = Array.isArray(data) ? data : [];

      if (user.role === "gestionnaire") {
        enc = enc.filter(e => e.caisse?.wilaya_id === user.wilaya_id);
      }

      setEncaissements(enc);
    } catch (e) {
      Alert.alert("Erreur", "Chargement impossible");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!montant) return Alert.alert("Erreur", "Entrer un montant");

    try {
      await createEncaissement({ montant: parseFloat(montant), rapport });
      setMontant("");
      setRapport("");
      setModalVisible(false);
      fetchData();
    } catch {
      Alert.alert("Erreur création");
    }
  };

  const handleDelete = id => {
    Alert.alert("Confirmation", "Supprimer cet encaissement ?", [
      { text: "Annuler" },
      {
        text: "Supprimer",
        onPress: async () => {
          await deleteEncaissement(id);
          fetchData();
        }
      }
    ]);
  };

  const filteredData = encaissements
    .filter(item => {
      const text = search.toLowerCase();
      return item.rapport?.toLowerCase().includes(text) || item.caisse?.nom?.toLowerCase().includes(text);
    })
    .sort((a, b) => {
      if (sortType === "montant_desc") return b.montant - a.montant;
      if (sortType === "montant_asc") return a.montant - b.montant;
      if (sortType === "date_asc") return new Date(a.created_at) - new Date(b.created_at);
      return new Date(b.created_at) - new Date(a.created_at);
    });

  // Export CSV mobile + web
  const exportCSV = async () => {
    let csv = "Date,Caisse,Montant,Rapport\n";
    filteredData.forEach(e => {
      csv += `${e.created_at},${e.caisse?.nom},${e.montant},${e.rapport}\n`;
    });

    if (Platform.OS === "web") {
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "encaissements.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const path = FileSystem.cacheDirectory + "encaissements.csv";
      await FileSystem.writeAsStringAsync(path, csv);
      await Sharing.shareAsync(path);
    }
  };

  const chartData = filteredData.map(e => ({ x: new Date(e.created_at).toLocaleDateString(), y: e.montant }));

  if (loading) {
    return (
      <View style={styles.loader}>
        <Animated.Image source={require("../../../assets/images/logo.png")} style={[styles.logo, { opacity: fadeAnim }]} />
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Gestion Encaissements</Text>

        {/* Search */}
        <TextInput placeholder="Recherche caisse / rapport" style={styles.search} value={search} onChangeText={setSearch} />

        {/* Sort */}
        <View style={styles.sortRow}>
          <TouchableOpacity onPress={() => setSortType("montant_desc")}>
            <Text style={styles.sortBtn}>Montant ↓</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSortType("montant_asc")}>
            <Text style={styles.sortBtn}>Montant ↑</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSortType("date_desc")}>
            <Text style={styles.sortBtn}>Date ↓</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSortType("date_asc")}>
            <Text style={styles.sortBtn}>Date ↑</Text>
          </TouchableOpacity>
        </View>

        {/* Charts */}
        <Text style={styles.chartTitle}>Statistiques</Text>

        <VictoryChart theme={VictoryTheme ? VictoryTheme.material : undefined}>
          <VictoryBar data={chartData} />
        </VictoryChart>

        <VictoryChart theme={VictoryTheme ? VictoryTheme.material : undefined}>
          <VictoryLine data={chartData} />
        </VictoryChart>

        <VictoryPie data={chartData.slice(0, 5)} />

        {/* Export */}
        <TouchableOpacity style={styles.exportBtn} onPress={exportCSV}>
          <Ionicons name="download" size={18} color="#fff" />
          <Text style={styles.exportText}>Exporter CSV</Text>
        </TouchableOpacity>

        {/* Table */}
        <View style={styles.tableHeader}>
          <Text style={styles.col1}>Date</Text>
          <Text style={styles.col2}>Caisse</Text>
          <Text style={styles.col3}>Montant</Text>
          <Text style={styles.col4}>Actions</Text>
        </View>

        <FlatList
          data={filteredData}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.col1}>{new Date(item.created_at).toLocaleDateString()}</Text>
              <Text style={styles.col2}>{item.caisse?.nom}</Text>
              <Text style={styles.col3}>{item.montant} DA</Text>
              <View style={styles.col4}>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <Ionicons name="trash" size={20} color="red" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Nouvel Encaissement</Text>
          <TextInput
            placeholder="Montant DA"
            keyboardType="numeric"
            value={montant}
            onChangeText={setMontant}
            style={styles.input}
          />
          <TextInput placeholder="Rapport" value={rapport} onChangeText={setRapport} style={styles.input} />

          <TouchableOpacity style={styles.save} onPress={handleCreate}>
            <Text style={styles.saveText}>Enregistrer</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setModalVisible(false)}>
            <Text style={styles.cancel}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9", padding: 15 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  search: { backgroundColor: "#fff", padding: 10, borderRadius: 8, marginBottom: 10 },
  sortRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  sortBtn: { color: "#2563eb", fontWeight: "bold" },
  chartTitle: { fontWeight: "bold", marginTop: 20, marginBottom: 10 },
  exportBtn: { backgroundColor: "#2563eb", flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 10, borderRadius: 8, marginVertical: 10 },
  exportText: { color: "#fff", marginLeft: 5 },
  tableHeader: { flexDirection: "row", backgroundColor: "#2563eb", padding: 10, borderRadius: 8 },
  row: { flexDirection: "row", backgroundColor: "#fff", padding: 10, borderBottomWidth: 1, borderColor: "#eee" },
  col1: { flex: 2, color: "#333" },
  col2: { flex: 2 },
  col3: { flex: 2, fontWeight: "bold" },
  col4: { flex: 1, alignItems: "center" },
  fab: { position: "absolute", bottom: 25, right: 25, backgroundColor: "#2563eb", width: 60, height: 60, borderRadius: 30, justifyContent: "center", alignItems: "center", elevation: 4 },
  modal: { flex: 1, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  input: { borderWidth: 1, borderColor: "#ddd", padding: 10, borderRadius: 8, marginBottom: 10 },
  save: { backgroundColor: "#2563eb", padding: 15, borderRadius: 8, alignItems: "center" },
  saveText: { color: "#fff", fontWeight: "bold" },
  cancel: { textAlign: "center", marginTop: 10 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  logo: { width: 180, height: 180, marginBottom: 20, resizeMode: "contain" }
});
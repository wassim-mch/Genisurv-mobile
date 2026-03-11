import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Animated,
  Easing,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { getWilayas } from "../../services/wilayas.api";
import { getEncaissements, getDecaissements } from "../../services/operations.api";

export default function OperationsScreen() {
  const [type, setType] = useState("encaissement");
  const [operations, setOperations] = useState([]);
  const [filteredOps, setFilteredOps] = useState([]);
  const [loading, setLoading] = useState(true);

  const [wilayas, setWilayas] = useState([]);
  const [selectedWilaya, setSelectedWilaya] = useState(null);
  const [dateFilter, setDateFilter] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // ================= ANIMATION LOGO =================
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0, duration: 600, easing: Easing.linear, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // ================= FETCH DATA =================
  useEffect(() => {
    fetchOperations();
    fetchWilayas();
  }, [type]);

  const fetchOperations = async () => {
    try {
      setLoading(true);
      let data = type === "encaissement" ? await getEncaissements() : await getDecaissements();
      setOperations(data);
      setFilteredOps(data);
    } catch (err) {
      console.log(err);
      Alert.alert("Erreur", "Impossible de charger les opérations");
    } finally {
      setLoading(false);
    }
  };

  const fetchWilayas = async () => {
    try {
      const data = await getWilayas();
      setWilayas(Array.isArray(data) ? data : data.data);
    } catch (err) {
      console.log(err);
    }
  };

  // ================= TROUVER NOM WILAYA =================
  const getWilayaName = (wilayaId) => {
    if (!wilayaId) return "-";
    const wilaya = wilayas.find((w) => Number(w.id) === Number(wilayaId));
    return wilaya ? wilaya.nom || wilaya.name : "-";
  };

  // ================= FILTRAGE =================
  useEffect(() => {
    let ops = [...operations];

    if (selectedWilaya) {
      ops = ops.filter((op) => op.caisse?.wilaya_id === selectedWilaya);
    }

    if (dateFilter) {
      ops = ops.filter((op) => op.created_at?.startsWith(dateFilter));
    }

    setFilteredOps(ops);
  }, [selectedWilaya, dateFilter, operations]);

  // ================= FORMAT DATE =================
  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("fr-FR");
  };

  // ================= LOADER =================
  if (loading) {
    return (
      <View style={styles.loader}>
        <Animated.Image
          source={require("../../../assets/images/logo.png")}
          style={[styles.loaderLogo, { opacity: fadeAnim }]}
        />
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 20 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Opérations financières</Text>

      {/* ================= TOGGLE ================= */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleBtn, type === "encaissement" && styles.activeEncaissement]}
          onPress={() => setType("encaissement")}
        >
          <Ionicons name="arrow-up-circle" size={18} color="#fff" />
          <Text style={styles.toggleText}> Encaissements</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleBtn, type === "decaissement" && styles.activeDecaissement]}
          onPress={() => setType("decaissement")}
        >
          <Ionicons name="arrow-down-circle" size={18} color="#fff" />
          <Text style={styles.toggleText}> Décaissements</Text>
        </TouchableOpacity>
      </View>

      {/* ================= FILTRES ================= */}
      <View style={styles.filterContainer}>
        <TextInput
          placeholder="Filtrer par date (YYYY-MM-DD)"
          style={styles.input}
          value={dateFilter}
          onChangeText={setDateFilter}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
          {wilayas.map((w) => (
            <TouchableOpacity
              key={w.id}
              style={[
                styles.caisseBtn,
                selectedWilaya === w.id && styles.selectedCaisseBtn,
              ]}
              onPress={() => setSelectedWilaya(selectedWilaya === w.id ? null : w.id)}
            >
              <Text style={selectedWilaya === w.id ? styles.selectedCaisseText : styles.caisseText}>
                {w.nom || w.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ================= TABLE ================= */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 15 }}>
        <View style={styles.tableContainer}>
          {/* HEADER */}
          <View style={styles.tableHeader}>
            
            <View style={styles.th}>
              <Ionicons name="location-outline" size={16} color="#2563eb" />
              <Text style={styles.thText}> Wilaya</Text>
            </View>
            <View style={styles.th}>
              <Ionicons name="cash-outline" size={16} color="#2563eb" />
              <Text style={styles.thText}> Montant</Text>
            </View>
            <View style={styles.th}>
              <Ionicons name="document-text-outline" size={16} color="#2563eb" />
              <Text style={styles.thText}> Rapport</Text>
            </View>
            <View style={styles.th}>
              <Ionicons name="calendar-outline" size={16} color="#2563eb" />
              <Text style={styles.thText}> Date</Text>
            </View>
          </View>

          {filteredOps.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={styles.td}>{getWilayaName(item.caisse?.wilaya_id)}</Text>
              <Text style={styles.td}>{item.montant} DA</Text>
              
              <Text style={styles.td}>{item.rapport || "-"}</Text>
              <Text style={styles.td}>{formatDate(item.created_at)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f1f5f9" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15, textAlign: "center", color: "#3b82f6" },
  toggleContainer: { flexDirection: "row", marginBottom: 15 },
  toggleBtn: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 5,
    backgroundColor: "#94a3b8",
  },
  activeEncaissement: { backgroundColor: "#27ae60" },
  activeDecaissement: { backgroundColor: "#e74c3c" },
  toggleText: { fontWeight: "bold", color: "#fff" },
  filterContainer: { marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 8 },
  caisseBtn: { padding: 8, marginRight: 10, backgroundColor: "#e0f2fe", borderRadius: 8 },
  selectedCaisseBtn: { backgroundColor: "#0369a1" },
  caisseText: { color: "#0369a1", fontWeight: "600" },
  selectedCaisseText: { color: "#fff", fontWeight: "600" },
  tableContainer: { backgroundColor: "#fff", borderRadius: 12, padding: 10, elevation: 3 },
  tableHeader: { flexDirection: "row", backgroundColor: "#eaf1ff", borderRadius: 8, paddingVertical: 10 },
  th: { flexDirection: "row", alignItems: "center", minWidth: 120, paddingHorizontal: 10 },
  thText: { fontWeight: "bold", color: "#2563eb", fontSize: 13 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#f1f5f9", paddingVertical: 12 },
  td: { minWidth: 120, paddingHorizontal: 10, fontSize: 13, color: "#333" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f1f5f9" },
  loaderLogo: { width: 180, height: 180, resizeMode: "contain" },
});
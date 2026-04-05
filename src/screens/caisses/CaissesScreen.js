import React, { useEffect, useState, useContext, useMemo, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";

import { getCaisses } from "../../services/caisses.api";
import { getWilayas } from "../../services/wilayas.api";
import { AuthContext } from "../../context/AuthContext";

// Loader personnalisé
function Loader({ loading }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(fadeAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
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
      <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 20 }} />
    </View>
  );
}

// Écran principal des caisses
export default function CaissesScreen() {
  const { user } = useContext(AuthContext);

  const [caisses, setCaisses] = useState([]);
  const [wilayas, setWilayas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blinkAnim] = useState(new Animated.Value(0));

  // Modal détails
  const [selectedCaisse, setSelectedCaisse] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular: require("../../../assets/fonts/Poppins-Regular.ttf"),
    Poppins_600SemiBold: require("../../../assets/fonts/Poppins-SemiBold.ttf"),
    Poppins_700Bold: require("../../../assets/fonts/Poppins-Bold.ttf"),
  });

  useEffect(() => {
    fetchData();
    startBlink();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [caisseData, wilayaData] = await Promise.all([getCaisses(), getWilayas()]);
      setCaisses(Array.isArray(caisseData) ? caisseData : []);
      setWilayas(Array.isArray(wilayaData) ? wilayaData : []);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les données");
    } finally {
      setLoading(false);
    }
  };

  const wilayaMap = useMemo(() => {
    const map = new Map();
    wilayas.forEach((w) => map.set(Number(w.id), w.name));
    return map;
  }, [wilayas]);

  const renderWilayaName = (item) => item.wilaya || wilayaMap.get(Number(item.wilaya_id)) || "-";

  const startBlink = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  };

  if (loading || !fontsLoaded) return <Loader loading={loading} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏦 Gestion des Caisses</Text>

      {/* Header */}
      <View style={styles.tableHeader}>
        <Text style={styles.headerCell}>
          <Ionicons name="location-outline" size={16} color="#fff" /> Wilaya
        </Text>
        <Text style={styles.headerCell}>
          <Ionicons name="cash-outline" size={16} color="#fff" /> Solde
        </Text>
        <Text style={styles.headerCell}>
          <Ionicons name="alert-circle-outline" size={16} color="#fff" /> Statut
        </Text>
        <Text style={styles.headerCell}>
          <Ionicons name="eye-outline" size={16} color="#fff" /> Action
        </Text>
      </View>

      {/* Liste */}
      <FlatList
        data={caisses}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 50 }}
        renderItem={({ item, index }) => {
          const solde = item.solde_actuel ?? 0;
          const isLow = solde <= 5000;
          const status = isLow ? "A Alimenter" : "OK";

          return (
            <View style={[styles.row, index === 0 && { backgroundColor: "#d6eaf8" }]}>
              <Text style={styles.cell}>{renderWilayaName(item)}</Text>
              <Text style={[styles.cell, { color: isLow ? "#e74c3c" : "#27ae60" }]}>{solde} DA</Text>
              {isLow ? (
                <Animated.Text style={[styles.cell, { color: "#e74c3c", fontWeight: "bold", opacity: blinkAnim }]}>
                  {status}
                </Animated.Text>
              ) : (
                <Text style={[styles.cell, { color: "#27ae60", fontWeight: "bold" }]}>{status}</Text>
              )}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  setSelectedCaisse(item);
                  setModalVisible(true);
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="eye-outline" size={18} color="#fff" />
                  <Text style={styles.actionText}>Voir</Text>
                </View>
              </TouchableOpacity>
            </View>
          );
        }}
      />

      {/* Modal détails */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.5)' }}>
          <View style={{ width:'90%', backgroundColor:'#fff', borderRadius:10, padding:20 }}>
            <Text style={{ fontSize:18, fontWeight:'bold', marginBottom:10 }}>Détails de la Caisse</Text>
            {selectedCaisse && (
              <>
                <Text>Wilaya: {renderWilayaName(selectedCaisse)}</Text>
                <Text>Nom: {selectedCaisse.name}</Text>
                <Text>Solde actuel: {selectedCaisse.solde_actuel} DA</Text>
                <Text>Total encaissement: {selectedCaisse.total_encaissements} DA</Text>
                <Text>Total décaissement: {selectedCaisse.total_decaissements} DA</Text>
                <Text>Total Alimentation: {selectedCaisse.total_alimentations} DA</Text>
                
              
              </>
            )}
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{ marginTop:20, backgroundColor:'#2563eb', padding:10, borderRadius:8, alignItems:'center' }}
            >
              <Text style={{ color:'#fff', fontWeight:'600' }}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f4f6f9" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 15, color: "#2e86de", textAlign: "center", fontFamily: "Poppins_700Bold" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f1f5f9" },
  loaderLogo: { width: 200, height: 200, resizeMode: "contain" },
  tableHeader: { flexDirection: "row", backgroundColor: "#3498db", paddingVertical: 12, borderRadius: 8 },
  headerCell: { flex: 1, color: "#fff", fontWeight: "600", textAlign: "center", fontSize: 13, fontFamily: "Poppins_600SemiBold" },
  row: { flexDirection: "row", backgroundColor: "#fff", paddingVertical: 15, marginTop: 6, borderRadius: 8, elevation: 2, alignItems: "center" },
  cell: { flex: 1, textAlign: "center", fontSize: 13, fontFamily: "Poppins_400Regular" },
  actionButton: { flex: 1, backgroundColor: "#2563eb", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
  actionText: { color: "#fff", fontWeight: "600", marginLeft: 5, fontFamily: "Poppins_600SemiBold" },
});
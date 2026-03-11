import React, { useContext, useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
  Animated,
  Easing
} from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { getCaisses } from "../../services/caisses.api";
import { getDecaissements } from "../../services/decaissements.api";
import { getWilayas } from "../../services/wilayas.api";
import { Ionicons } from "@expo/vector-icons";
import { VictoryChart, VictoryBar, VictoryTheme, VictoryAxis } from "victory";

const screenWidth = Dimensions.get("window").width;

export default function HomeScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const role = user?.role?.toLowerCase() || "guest";

  const [caisses, setCaisses] = useState([]);
  const [wilayas, setWilayas] = useState([]);
  const [decaissements, setDecaissements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWilaya, setSelectedWilaya] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.linear,
          useNativeDriver: true
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          easing: Easing.linear,
          useNativeDriver: true
        })
      ])
    ).start();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const canViewDecaissements =
          user?.permissions?.includes("voir_decaissement") ||
          role === "admin" ||
          role === "superadmin";

        const [caisseData, wilayaData, decaissementData] =
          await Promise.all([
            getCaisses(),
            getWilayas(),
            canViewDecaissements ? getDecaissements(true) : Promise.resolve([])
          ]);

        setCaisses(caisseData || []);
        setWilayas(wilayaData || []);
        setDecaissements(
          (decaissementData || []).filter((d) => !d.consulte)
        );
      } catch (error) {
        console.log(error);
        Alert.alert(
          "Erreur",
          "Impossible de charger les données. Vérifiez votre connexion ou vos permissions."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // ================= LOADER PERSONNALISÉ =================
  if (loading) {
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

  // ================= ADMIN / SUPERADMIN =================
  if (role === "superadmin" || role === "admin") {
    const chartData = caisses
      .filter((c) => !selectedWilaya || c.wilaya_id === selectedWilaya)
      .map((c) => ({
        x: c.wilaya?.nom || c.nom || "Inconnu",
        y: Number(
          String(c.total_encaissements || 0)
            .replace(/\s/g, "")
            .replace(",", ".")
        )
      }));

    return (
      <ScrollView style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>Bienvenue {user?.nom}</Text>
        </View>

        <View style={styles.statsRow}>
          <StatCard icon="cube-outline" label="Caisses" value={caisses.length} />
          <StatCard
            icon="alert-circle-outline"
            label="Décaissements non consultés"
            value={decaissements.length}
          />
        </View>

        <TouchableOpacity
          style={styles.bigCard}
          onPress={() => navigation.navigate("Caisses")}
        >
          <Image
            source={require("../../../assets/images/Voir-les-caisses.png")}
            style={styles.bigCardImage}
          />
          <View style={styles.bigCardOverlay} />
        </TouchableOpacity>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Roulement des caisses</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <FilterButton
              active={selectedWilaya === null}
              label="Toutes"
              onPress={() => setSelectedWilaya(null)}
            />
            {wilayas.map((w) => (
              <FilterButton
                key={w.id}
                active={selectedWilaya === w.id}
                label={w.nom}
                onPress={() => setSelectedWilaya(w.id)}
              />
            ))}
          </ScrollView>

          <VictoryChart
            width={screenWidth - 40}
            theme={VictoryTheme.material}
            domainPadding={25}
            animate={{ duration: 800 }}
          >
            <VictoryAxis fixLabelOverlap />
            <VictoryAxis dependentAxis />
            <VictoryBar
              data={chartData}
              style={{ data: { fill: "#2563eb", borderRadius: 6 } }}
            />
          </VictoryChart>
        </View>
      </ScrollView>
    );
  }

  // ================= GESTIONNAIRE =================
  if (role === "gestionnaire") {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Dashboard Gestionnaire</Text>
          <Text style={styles.headerSubtitle}>Votre caisse</Text>
        </View>

        <View style={styles.statsRow}>
          {caisses
            .filter((c) => c.gestionnaire?.id === user.id)
            .map((c) => (
              <StatCard
                key={c.id}
                icon="cash-outline"
                label={c.wilaya?.nom || c.nom || "Inconnu"}
                value={c.solde_actuel || 0}
              />
            ))}
        </View>
      </ScrollView>
    );
  }

  return null;
}

/* ================= COMPONENTS ================= */
const StatCard = ({ icon, label, value }) => (
  <View style={styles.statCard}>
    <Ionicons name={icon} size={28} color="#2563eb" />
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const FilterButton = ({ label, active, onPress }) => (
  <TouchableOpacity
    style={[styles.filterBtn, active && styles.filterBtnActive]}
    onPress={onPress}
  >
    <Text style={active ? styles.filterTextActive : styles.filterText}>
      {label}
    </Text>
  </TouchableOpacity>
);

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    padding: 20
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9"
  },
  loaderLogo: {
    width: 200,
    height: 200,
    resizeMode: "contain"
  },
  headerContainer: { marginBottom: 25 },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2f6bf8",
    textAlign: "center"
  },
  headerSubtitle: {
    fontSize: 18,
    color: "#64748b",
    marginTop: 4,
    textAlign: "center"
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    marginRight: 10,
    shadowColor: "#2242f7",
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 5
  },
  statLabel: { marginTop: 10, color: "#64748b" },
  statValue: { fontSize: 22, fontWeight: "bold", marginTop: 5, color: "#0f172a" },
  bigCard: { height: 160, borderRadius: 20, overflow: "hidden", marginBottom: 25 },
  bigCardImage: { width: "100%", height: "100%" },
  
  chartCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5
  },
  chartTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 15, color: "#0f172a" },
  filterBtn: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, backgroundColor: "#e2e8f0", marginRight: 10 },
  filterBtnActive: { backgroundColor: "#2563eb" },
  filterText: { color: "#334155" },
  filterTextActive: { color: "#fff", fontWeight: "bold" }
});
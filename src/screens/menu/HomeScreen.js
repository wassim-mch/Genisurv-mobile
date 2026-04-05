import { useContext, useEffect, useRef, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { AuthContext } from "../../context/AuthContext";
import { getCaisses, getMyCaisse } from "../../services/caisses.api";
import { getDecaissements } from "../../services/decaissements.api";
import { getWilayas } from "../../services/wilayas.api";

import { Ionicons } from "@expo/vector-icons";
import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryGroup,
  VictoryTheme,
} from "victory";

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

  // 🔥 Animation logo
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const formatDA = (value) => {
    return new Intl.NumberFormat("fr-DZ", {
      style: "currency",
      currency: "DZD",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // 🔥 FETCH DATA PROPRE
  const fetchData = async () => {
    setLoading(true);
    try {
      const canViewDecaissements =
        user?.permissions?.includes("voir_decaissement") ||
        role === "admin" ||
        role === "superadmin";

      if (role === "gestionnaire") {
        const caisse = await getMyCaisse();
        setCaisses(caisse ? [caisse] : []);
        setWilayas([]);
        setDecaissements([]);
        return;
      }

      const [caisseData, wilayaData, decaissementData] = await Promise.all([
        getCaisses(),
        getWilayas(),
        canViewDecaissements ? getDecaissements(null, true) : Promise.resolve([]),
      ]);

      setCaisses(caisseData || []);
      setWilayas(wilayaData?.wilayas || []);
      setDecaissements((decaissementData || []).filter((d) => !d.consulte));
    } catch (error) {
      console.log(error);
      Alert.alert("Erreur", "Impossible de charger les données.");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 1er chargement
  useEffect(() => {
    fetchData();
  }, [user, role]);

  // 🔥 refresh quand on revient sur l’écran
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [user, role])
  );

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

  /* ================= ADMIN / SUPERADMIN ================= */
  if (role === "superadmin" || role === "admin") {
    const filteredCaisses = caisses
      .filter((c) => !selectedWilaya || c.wilaya === selectedWilaya)
      .sort((a, b) => a.wilaya.localeCompare(b.wilaya));

    const parseValue = (v) =>
      Number(String(v).replace(/\s/g, "").replace(",", ".")) || 0;

    const encaissementsData = filteredCaisses.map((c) => ({
      x: c.wilaya,
      y: parseValue(c.total_encaissements),
    }));

    const decaissementsData = filteredCaisses.map((c) => ({
      x: c.wilaya,
      y: parseValue(c.total_decaissements),
    }));

    const alimentationsData = filteredCaisses.map((c) => ({
      x: c.wilaya,
      y: parseValue(c.total_alimentations),
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
            label="Décaissements"
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
        </TouchableOpacity>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Roulement des caisses</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
          >
            <VictoryChart
              width={Math.max(filteredCaisses.length * 120, screenWidth)}
              theme={VictoryTheme.material}
              domainPadding={20}
              animate={{ duration: 800 }}
            >
              <VictoryAxis style={{ tickLabels: { fontSize: 12, angle: -25 } }} />
              <VictoryAxis dependentAxis />

              <VictoryGroup offset={20}>
                <VictoryBar data={encaissementsData} style={{ data: { fill: "#22c55e" } }} />
                <VictoryBar data={decaissementsData} style={{ data: { fill: "#ef4444" } }} />
                <VictoryBar data={alimentationsData} style={{ data: { fill: "#2563eb" } }} />
              </VictoryGroup>
            </VictoryChart>
          </ScrollView>
        </View>
      </ScrollView>
    );
  }

  /* ================= GESTIONNAIRE ================= */
  if (role === "gestionnaire") {
    const caisse = caisses[0];

    if (!caisse) {
      return (
        <View style={styles.container}>
          <Text style={styles.headerTitle}>Dashboard Gestionnaire</Text>
          <Text style={styles.headerSubtitle}>
            Vous n&apos;avez pas de caisse assignée.
          </Text>
        </View>
      );
    }

    const encaissement = Number(caisse.total_encaissements) || 0;
    const decaissement = Number(caisse.total_decaissements) || 0;
    const alimentation = Number(caisse.total_alimentations) || 0;

    const solde = alimentation + encaissement - decaissement;

    const chartData = [
      { x: "Encaissements", y: encaissement },
      { x: "Décaissements", y: decaissement },
      { x: "Solde", y: solde },
    ];

    return (
      <ScrollView style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Dashboard {caisse.wilaya}</Text>
          <Text style={styles.headerSubtitle}>Gérée par {user?.nom}</Text>
        </View>

        <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 20 }}
      >
          <StatCard icon="cash-outline" label="Encaissements" value={formatDA(encaissement)} />
          <StatCard icon="card-outline" label="Décaissements" value={formatDA(decaissement)} />
          <StatCard icon="wallet-outline" label="Solde" value={formatDA(solde)} />
        </ScrollView>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Résumé caisse</Text>

          <ScrollView horizontal>
            <VictoryChart
            standalone={false}
              width={Math.max(chartData.length * 120, screenWidth - 40)}
              theme={VictoryTheme.material}
              domainPadding={30}
              animate={{ duration: 800 }}
            >
              <VictoryAxis style={{ tickLabels: { fontSize: 14 } }} />
              <VictoryAxis dependentAxis />

              <VictoryBar
                data={chartData}
                labels={({ datum }) => formatDA(datum.y)}
                style={{
                  data: {
                    fill: ({ datum }) =>
                      datum.x === "Encaissements"
                        ? "#22c55e"
                        : datum.x === "Décaissements"
                        ? "#ef4444"
                        : "#2563eb",
                  },
                }}
              />
            </VictoryChart>
          </ScrollView>
        </View>
      </ScrollView>
    );
  }

  return null;
}

/* ================= COMPONENTS ================= */
const StatCard = ({ icon, label, value }) => (
  <View style={styles.statCardFixed}>
    <Ionicons name={icon} size={28} color="#2563eb" />
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9", padding: 20 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  loaderLogo: { width: 200, height: 200, resizeMode: "contain" },

  headerContainer: { marginBottom: 25 },
  headerTitle: { fontSize: 28, fontWeight: "bold", textAlign: "center", color: "#2f6bf8" },
  headerSubtitle: { fontSize: 16, textAlign: "center", color: "#64748b" },

  statsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },

  statCardFixed: {
    width: (screenWidth - 60) / 2,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    marginRight: 10,
    elevation: 6,
  },

  statLabel: { marginTop: 10, color: "#64748b" },
  statValue: { fontSize: 18, fontWeight: "bold", marginTop: 5 },

  bigCard: { height: 160, borderRadius: 20, overflow: "hidden", marginBottom: 25 },
  bigCardImage: { width: "100%", height: "100%" },

  chartCard: { backgroundColor: "#fff", borderRadius: 20, padding: 20, elevation: 6, marginTop: 10 },
  chartTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 15 },
});
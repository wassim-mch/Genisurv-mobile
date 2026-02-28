import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  Linking,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator
} from "react-native";

import * as Font from "expo-font";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { login } from "../../services/authService";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;

  // Charger les fonts
  const loadFonts = async () => {
    await Font.loadAsync({
      "Poppins-Regular": require("../../../assets/fonts/Poppins-Regular.ttf"),
      "Poppins-SemiBold": require("../../../assets/fonts/Poppins-SemiBold.ttf"),
      "Poppins-Bold": require("../../../assets/fonts/Poppins-Bold.ttf"),
    });
  };

  useEffect(() => {
    const initialize = async () => {
      await loadFonts();
      setFontsLoaded(true);

      // 🔐 Vérifier si token existe
      const token = await AsyncStorage.getItem("token");

      if (token) {
        navigation.replace("Home");
      } else {
        setCheckingToken(false);
      }
    };

    initialize();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    try {
      await login(email, password);
      navigation.replace("Home");
    } catch (error) {
      Alert.alert("Erreur", "Email ou mot de passe incorrect");
    }
  };

  // Loader pendant vérification token ou chargement fonts
  if (!fontsLoaded || checkingToken) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0a4c8a" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
            marginBottom: 20,
          }}
        >
          <Image
            source={require("../../../assets/images/logo.png")}
            style={{ width: 250, height: 120 }}
            resizeMode="contain"
          />
        </Animated.View>

        <Text style={styles.title}>Se Connecter</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="Entrez votre email"
          placeholderTextColor="#999"
          style={styles.input}
        />

        <Text style={styles.label}>Mot de passe</Text>
        <TextInput
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder="Entrez votre mot de passe"
          placeholderTextColor="#999"
          style={styles.input}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Se connecter</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{ alignSelf: "flex-center", marginBottom: 20 }}
        onPress={() => navigation.navigate("ForgotPassword")}>
            <Text style={styles.forgotPassword}>
              Mot de passe oublié ?
            </Text>
        </TouchableOpacity>
      
        <Text style={styles.description}>
          Cette application est spécialement dédiée aux gestionnaires régionaux et administrateurs de Genisurv
        </Text>

        <TouchableOpacity onPress={() => Linking.openURL("https://www.genisurv.com/terms")}>
          <Text style={styles.link}>Termes et Conditions</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 32,
    marginBottom: 30,
    fontFamily: "Poppins-Bold",
    color: "#0a4c8a",
  },
  label: {
    alignSelf: "flex-start",
    fontSize: 16,
    marginBottom: 5,
    fontFamily: "Poppins-SemiBold",
    color: "#333",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 20,
    fontFamily: "Poppins-Regular",
    fontSize: 16,
    color: "#000",
  },
  button: {
    width: "100%",
    backgroundColor: "#0a4c8a",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 25,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
  },
  description: {
    fontSize: 14,
    color: "#0a4c8a",
    textAlign: "center",
    marginBottom: 10,
    fontFamily: "Poppins-Regular",
  },
  link: {
    fontSize: 14,
    color: "#0a4c8a",
    textDecorationLine: "underline",
    fontFamily: "Poppins-SemiBold",
  },
  forgotPassword: {
  color: "red",
  fontFamily: "Poppins-SemiBold",
  fontSize: 14,
},
});
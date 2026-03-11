import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../context/AuthContext";
import { useNavigation } from "@react-navigation/native";

export default function AppBar({ title, onMenuPress }) {
  const { user, logout } = useContext(AuthContext);
  const navigation = useNavigation();

  const [menuVisible, setMenuVisible] = useState(false);

  const emailVerified = user?.email_verified_at;

  const handleLogout = () => {
    setMenuVisible(false);
    logout();
  };

  return (
    <View style={styles.container}>
      
      {/* LEFT MENU */}
      <TouchableOpacity onPress={onMenuPress}>
        <Ionicons name="menu" size={26} color="white" />
      </TouchableOpacity>

      {/* TITLE */}
      <Text style={styles.title}>{title}</Text>

      {/* RIGHT ACTIONS */}
      <View style={styles.actions}>

        {/* NOTIFICATIONS */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate("NotificationsScreen")}
        >
          <Ionicons name="notifications-outline" size={24} color="white" />
        </TouchableOpacity>

        {/* PROFILE */}
        <TouchableOpacity
          style={styles.profile}
          onPress={() => setMenuVisible(true)}
        >
          <Ionicons name="person" size={18} color="#1f2937" />
        </TouchableOpacity>

      </View>

      {/* PROFILE DROPDOWN */}

      <Modal
        transparent
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setMenuVisible(false)}
        >
          <Pressable style={styles.dropdown}>

            {!emailVerified && (
              <TouchableOpacity
                style={styles.item}
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate("VerifyEmailScreen");
                }}
              >
                <Ionicons name="mail-outline" size={20} color="#374151" />
                <Text style={styles.itemText}>Vérifier Email</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.item}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate("AccountScreen");
              }}
            >
              <Ionicons
                name="person-circle-outline"
                size={20}
                color="#374151"
              />
              <Text style={styles.itemText}>Compte</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.item}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={20} color="#dc2626" />
              <Text style={[styles.itemText, { color: "#dc2626" }]}>
                Déconnexion
              </Text>
            </TouchableOpacity>

          </Pressable>
        </Pressable>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 65,
    backgroundColor: "#0c4d8b",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },

  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconButton: {
    marginRight: 15,
  },

  profile: {
    width: 34,
    height: 34,
    borderRadius: 20,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
    alignItems: "flex-end",
    paddingTop: 70,
    paddingRight: 10,
  },

  dropdown: {
    backgroundColor: "white",
    borderRadius: 10,
    width: 190,
    paddingVertical: 10,

    elevation: 10,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
  },

  itemText: {
    marginLeft: 10,
    fontSize: 15,
    color: "#374151",
  },
});
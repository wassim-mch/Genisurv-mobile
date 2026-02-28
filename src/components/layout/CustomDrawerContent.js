import React, { useContext, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Animated,
} from "react-native";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../context/AuthContext";
import { sidebarMenu } from "../../utils/sidebarMenu";
import { usePermissions } from "../../hooks/usePermissions";

export default function CustomDrawerContent(props) {
  const permissions = usePermissions() || [];
  const { logout } = useContext(AuthContext);

  const activeRoute = props.state.routeNames[props.state.index];

  const handleLogout = () => {
    Alert.alert("Confirmation", "Êtes-vous sûr ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.container}
    >
      {/* TOP SECTION */}
      <View>
        <View style={styles.header}>
          <Image
            source={require("../../../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.menu}>
          {sidebarMenu.map((item) => {
            const hasPermission = Array.isArray(item.permission)
              ? item.permission.some((p) => permissions.includes(p))
              : permissions.includes(item.permission);

            if (!hasPermission) return null;

            const isActive = activeRoute === item.screen;

            return (
              <AnimatedMenuItem
                key={item.screen}
                item={item}
                isActive={isActive}
                onPress={() => props.navigation.navigate(item.screen)}
              />
            );
          })}
        </View>
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="white" />
          <Text style={styles.logoutText}> Déconnexion</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

/* ========================= */
/* Animated Menu Item */
/* ========================= */

function AnimatedMenuItem({ item, isActive, onPress }) {
  const animatedValue = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isActive ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [isActive]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["#f3f4f6", "#dbeafe"],
  });

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 8],
  });

  return (
    <Animated.View style={[styles.item, { backgroundColor, transform: [{ translateX }] }]}>
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.7}
        onPress={onPress}
      >
        <Ionicons
          name={item.icon}
          size={22}
          color={isActive ? "#2563eb" : "#3b82f6"}
          style={{ marginRight: 20 }}
        />
        <Text
          style={[
            styles.itemText,
            isActive && { color: "#2563eb", fontWeight: "bold" },
          ]}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

/* ========================= */
/* STYLES */
/* ========================= */

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "space-between", // garde footer en bas
    backgroundColor: "#f3f4f6",
  },

  header: {
    alignItems: "center",
    paddingVertical: 25,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },

  logo: {
    width: 200,
    height: 80,
  },

  menu: {
    paddingTop: 10,
  },

  item: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },

  itemText: {
    fontSize: 18,
    color: "#374151",
    fontWeight: "500",
  },

  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },

  logoutButton: {
    flexDirection: "row",
    backgroundColor: "#dc2626",
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  logoutText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
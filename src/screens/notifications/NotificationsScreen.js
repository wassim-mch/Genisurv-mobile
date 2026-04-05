import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getUnreadNotifications,
  markAsRead,
} from "../../services/Notification.api";

/**
 * 🔥 MAP DES TYPES BACKEND → TYPES UI
 * (important pour éviter le gris partout)
 */
const mapType = (type) => {
  switch (type?.toLowerCase()?.trim()) {
    case "success":
    case "paiement":
    case "payment":
    case "approved":
      return "success";

    case "error":
    case "failed":
    case "reject":
      return "error";

    case "warning":
    case "alert":
      return "warning";

    case "info":
    case "system":
    case "notification":
    default:
      return "info";
  }
};

/**
 * 🎨 STYLES PAR TYPE
 */
const notificationStyles = {
  success: {
    color: "#22c55e",
    bg: "#dcfce7",
    icon: "checkmark-done",
  },
  error: {
    color: "#ef4444",
    bg: "#fee2e2",
    icon: "close-circle",
  },
  warning: {
    color: "#f59e0b",
    bg: "#fef3c7",
    icon: "alert-circle",
  },
  info: {
    color: "#3b82f6",
    bg: "#dbeafe",
    icon: "information-circle",
  },
  default: {
    color: "#6b7280",
    bg: "#f3f4f6",
    icon: "notifications",
  },
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 📥 FETCH NOTIFICATIONS
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await getUnreadNotifications();

      const data = res.notifications ? res.notifications : res;

      const sorted = data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      setNotifications(sorted);
    } catch (error) {
      console.error("Erreur récupération notifications :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // 🔄 REFRESH
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications().then(() => setRefreshing(false));
  }, []);

  // ✅ MARK AS READ
  const handleMarkAsRead = async (id) => {
    const success = await markAsRead(id);

    if (success) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        )
      );
    }
  };

  // ⏱ TIME AGO
  const timeAgo = (date) => {
    const diff = Math.floor((new Date() - new Date(date)) / 1000);

    if (diff < 60) return `il y a ${diff}s`;
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)}min`;
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
    return `il y a ${Math.floor(diff / 86400)}j`;
  };

  // 🧩 RENDER ITEM
  const renderNotification = ({ item }) => {
    const typeKey = mapType(item.type);
    const typeStyle =
      notificationStyles[typeKey] || notificationStyles.default;

    return (
      <TouchableOpacity
        onPress={() => handleMarkAsRead(item.id)}
        style={[
          styles.card,
          !item.is_read && {
            borderLeftWidth: 5,
            borderLeftColor: typeStyle.color,
            backgroundColor: "#ffffff",
          },
        ]}
      >
        {/* ICON */}
        <View
          style={[
            styles.icon,
            { backgroundColor: typeStyle.color },
          ]}
        >
          <Ionicons
            name={typeStyle.icon}
            size={18}
            color="#fff"
          />
        </View>

        {/* CONTENT */}
        <View style={styles.content}>
          <Text style={styles.titleText}>
            {item.title || "Notification"}
          </Text>

          <Text style={styles.message}>
            {item.message}
          </Text>

          {/* TAG */}
          <View
            style={[
              styles.tag,
              { backgroundColor: typeStyle.bg },
            ]}
          >
            <Text
              style={[
                styles.tagText,
                { color: typeStyle.color },
              ]}
            >
              {item.type || "info"}
            </Text>
          </View>
        </View>

        {/* TIME */}
        <Text style={styles.time}>
          {timeAgo(item.created_at)}
        </Text>
      </TouchableOpacity>
    );
  };

  // ⏳ LOADING
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  // ❌ EMPTY
  if (notifications.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Notifications</Text>
        <Text style={styles.empty}>
          Aucune notification
        </Text>
      </View>
    );
  }

  // 📋 LIST
  return (
    <FlatList
      style={styles.container}
      data={notifications}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderNotification}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
      ListHeaderComponent={
        <Text style={styles.header}>
          Notifications
        </Text>
      }
    />
  );
}

/**
 * 🎨 STYLES CLEAN
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 16,
  },

  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#111827",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  empty: {
    textAlign: "center",
    marginTop: 20,
    color: "#6b7280",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  content: {
    flex: 1,
  },

  titleText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },

  message: {
    fontSize: 13,
    color: "#4b5563",
    marginTop: 4,
    marginBottom: 6,
  },

  tag: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  tagText: {
    fontSize: 11,
    fontWeight: "600",
  },

  time: {
    fontSize: 10,
    color: "#9ca3af",
    marginLeft: 8,
  },
});
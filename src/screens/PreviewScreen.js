import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { cacheDirectory } from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as Linking from "expo-linking";

export default function PreviewScreen({ route, navigation }) {
  const { url, type } = route.params;

  const download = async () => {
    try {
      const name = url.split("/").pop() || "file.pdf";

      const fileUri = cacheDirectory + name;

      const { uri } = await FileSystem.downloadAsync(url, fileUri);

      Alert.alert("Succès", "Téléchargé");

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      }
    } catch (e) {
      console.log(e);
      Alert.alert("Erreur téléchargement");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>

        <Text style={{ color: "#fff" }}>Aperçu</Text>

        <TouchableOpacity onPress={download}>
          <Ionicons name="download" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {type === "image" ? (
        <Image source={{ uri: url }} style={{ flex: 1 }} resizeMode="contain" />
      ) : (
        <TouchableOpacity
          onPress={() => Linking.openURL(url)}
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ color: "#fff" }}>Ouvrir PDF</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    backgroundColor: "#111",
  },
});
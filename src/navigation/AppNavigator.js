import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/auth/LoginScreen";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";
import LoadingScreen from "../screens/LoadingScreen/LoadingScreen";
import DrawerNavigator from "./DrawerNavigator";
import PreviewScreen from "../screens/PreviewScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <LoadingScreen />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>

      {/* 🔐 AUTH STACK */}
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

          {/* 👇 IMPORTANT: Preview accessible même ici */}
          <Stack.Screen name="Preview" component={PreviewScreen} />
        </>
      ) : (
        <>
          {/* 📱 APP STACK */}
          <Stack.Screen name="MainDrawer" component={DrawerNavigator} />

          {/* 👇 IMPORTANT: Preview aussi ici */}
          <Stack.Screen name="Preview" component={PreviewScreen} />
        </>
      )}

    </Stack.Navigator>
  );
}
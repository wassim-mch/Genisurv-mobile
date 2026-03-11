import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";
import AppBar from "../components/layout/AppBar";
import CustomDrawerContent from "../components/layout/CustomDrawerContent";
import { sidebarMenu } from "../utils/sidebarMenu";
import withPermission from "../guards/withPermission";

// Screens
import Dashboard from "../screens/menu/HomeScreen";
import Users from "../screens/users/UsersScreen";
import Roles from "../screens/roles/RolesScreen";
import Wilayas from "../screens/wilayas/WilayasScreen";
import Alimentation from "../screens/alimentation/AlimentationScreen";
import Operations from "../screens/operations/OperationsScreen";
import Caisses from "../screens/caisses/CaissesScreen";
import Encaissement from "../screens/encaissement/EncaissementScreen";
import Decaissement from "../screens/decaissement/DecaissementScreen";

import VerifyEmailScreen from "../screens/account/VerifyEmailScreen";
import AccountScreen from "../screens/account/AccountScreen";
import NotificationsScreen from "../screens/notifications/NotificationsScreen";

const Drawer = createDrawerNavigator();

const screenComponents = {
  Dashboard,
  Users,
  Roles,
  Wilayas,
  Alimentation,
  Operations,
  Caisses,
  Encaissement,
  Decaissement,
};

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="Dashboard" // ✅ Définir l’écran initial
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation, route }) => ({
        header: () => (
          <AppBar
            title={route.name}
            onMenuPress={() => navigation.toggleDrawer()}
          />
        ),
      })}
    >

      {/* SCREENS NON VISIBLES DANS LE DRAWER */}
      <Drawer.Screen
        name="VerifyEmailScreen"
        component={VerifyEmailScreen}
        options={{ drawerItemStyle: { display: "none" } }}
      />
      <Drawer.Screen
        name="AccountScreen"
        component={AccountScreen}
        options={{ drawerItemStyle: { display: "none" } }}
      />
      <Drawer.Screen
        name="NotificationsScreen"
        component={NotificationsScreen}
        options={{ drawerItemStyle: { display: "none" } }}
      />
      <Drawer.Screen
        name="ForgotPasswordScreen"
        component={ForgotPasswordScreen}
        options={{ drawerItemStyle: { display: "none" } }}
      />

      {/* SCREENS DU MENU SIDEBAR */}
      {sidebarMenu.map((item) => {
        const ScreenComponent = screenComponents[item.screen];
        if (!ScreenComponent) return null;

        return (
          <Drawer.Screen
            key={item.screen}
            name={item.screen}
            component={withPermission(ScreenComponent, item.permission)}
          />
        );
      })}
    </Drawer.Navigator>
  );
}
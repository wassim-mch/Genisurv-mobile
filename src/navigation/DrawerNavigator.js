import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import CustomDrawerContent from "../components/layout/CustomDrawerContent";
import { sidebarMenu } from "../utils/sidebarMenu";
import withPermission from "../guards/withPermission";

// 👉 Import tes screens ici
import Dashboard from "../screens/menu/HomeScreen";
import Users from "../screens/users/UsersScreen";
import Roles from "../screens/roles/RolesScreen";
import Wilayas from "../screens/wilayas/WilayasScreen";
import Alimentation from "../screens/alimentation/AlimentationScreen";
import Operations from "../screens/operations/OperationsScreen";
import Caisses from "../screens/caisses/CaissesScreen";
import Encaissement from "../screens/encaissement/EncaissementScreen";
import Decaissement from "../screens/decaissement/DecaissementScreen";

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
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "#1f2937" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      {sidebarMenu.map((item) => {
        const ScreenComponent = screenComponents[item.screen];

        if (!ScreenComponent) return null;

        return (
          <Drawer.Screen
            key={item.screen}
            name={item.screen}
            component={withPermission(
              ScreenComponent,
              item.permission
            )}
          />
        );
      })}
    </Drawer.Navigator>
  );
}
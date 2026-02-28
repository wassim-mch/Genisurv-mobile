export const sidebarMenu = [
  { 
    label: "Dashboard", 
    permission: "voir_caisse", 
    screen: "Dashboard",
    icon: "speedometer-outline"
  },
  { 
    label: "Users", 
    permission: "gerer_user", 
    screen: "Users",
    icon: "people-outline"
  },
  { 
    label: "Roles", 
    permission: "gerer_role", 
    screen: "Roles",
    icon: "shield-checkmark-outline"
  },
  { 
    label: "Wilayas", 
    permission: "gerer_wilaya", 
    screen: "Wilayas",
    icon: "map-outline"
  },
  { 
    label: "Alimentation", 
    permission: "gerer_alimentation", 
    screen: "Alimentation",
    icon: "card-outline"
  },
  { 
    label: "Operations", 
    permission: ["voir_encaissement", "voir_decaissement"], 
    screen: "Operations",
    icon: "swap-horizontal-outline"
  },
  { 
    label: "Caisses", 
    permission: "voir_tous_caisses", 
    screen: "Caisses",
    icon: "wallet-outline"
  },
  { 
    label: "Encaissement", 
    permission: "gerer_encaissement", 
    screen: "Encaissement",
    icon: "arrow-down-circle-outline"
  },
  { 
    label: "Decaissement", 
    permission: "gerer_decaissement", 
    screen: "Decaissement",
    icon: "arrow-up-circle-outline"
  },
];
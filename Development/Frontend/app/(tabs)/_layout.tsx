import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Slot, Tabs } from "expo-router";
import { SafeAreaView, StatusBar, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import { icons } from "@/constants";

export default function TabLayout() {
  return (
    <GestureHandlerRootView className="flex-1">
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#FCA311",
          headerShown: false,
          // tabBarStyle: { paddingBottom: 0, height: 50 },  // You can adjust height
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <FontAwesome size={28} name="home" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: "Chat",
            tabBarIcon: ({ color }) => (
              <FontAwesome size={28} name="comments" color={color} />
            ), // Use a valid icon name
          }}
        />
        <Tabs.Screen
          name="more"
          options={{
            title: "More",
            tabBarIcon: ({ color }) => (
          <FontAwesome size={28} name="bars" color={color} />
            ), // Use a valid icon name
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}

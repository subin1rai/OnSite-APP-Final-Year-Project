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
          // tabBarStyle: { paddingBottom: 0, height: 50 }
        }}
        
      >
        <StatusBar barStyle="light-content" backgroundColor="white" translucent={false} />
        <Tabs.Screen
          name="home"
          options={{
            title: "",
            tabBarIcon: ({ color }) => (  
              <FontAwesome size={28} name="home" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: "",
            tabBarIcon: ({ color }) => (
              <FontAwesome size={28} name="comments" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="more"
          options={{
            title: "",
            tabBarIcon: ({ color }) => (
          <FontAwesome size={28} name="bars" color={color} />
            ), 
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}

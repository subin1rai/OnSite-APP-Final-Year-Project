import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { SafeAreaView, StatusBar, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function _Layout() {
  return (
    <GestureHandlerRootView className="flex-1">
  
      <View className="flex-1">
        <StatusBar barStyle="dark-content" backgroundColor="white" translucent={false} />

        <Tabs
          screenOptions={{
            tabBarActiveTintColor: "#FCA311",
            headerShown: false,
          }}
        >
          <Tabs.Screen
            name="clientChat"
            options={{
              title: "",
              tabBarIcon: ({ color }) => <FontAwesome size={28} name="comments" color={color} />,
            }}
          />
          <Tabs.Screen
            name="clientHome"
            options={{
              title: "",
              tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
            }}
          />
          <Tabs.Screen
            name="clientProfile"
            options={{
              title: "",
              tabBarIcon: ({ color }) => <FontAwesome size={28} name="user" color={color} />,
            }}
          />
        </Tabs>
      </View>
    </GestureHandlerRootView>
  );
}

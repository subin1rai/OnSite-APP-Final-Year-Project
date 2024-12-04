import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import "../../global.css";
const Layout = () => {
  return (
    <>
      {/* Set StatusBar globally */}
      <StatusBar
        barStyle="dark-content" 
        backgroundColor="white" 
        translucent={false} 
      />
      {/* Define Stack Navigator */}
      <Stack>
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="sign-up" options={{ headerShown: false }} />
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      </Stack>
    </>
  );
};

export default Layout;

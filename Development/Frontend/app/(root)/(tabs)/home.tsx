import { SafeAreaView, StatusBar, Text } from "react-native";

const Home = () => {
  return (
    <SafeAreaView>
         <StatusBar
        barStyle="light-content" // Use "dark-content" for dark text
        backgroundColor="white" // Match this color to your header or app background
      />
      <Text>Home</Text>
    </SafeAreaView>
  );
};

export default Home;

import { SafeAreaView, Text } from "react-native";
import { useLocalSearchParams } from "expo-router"; // Correct import

const Project_home = () => {
  // Get the search parameters for this page
  const { projectId, projectName, ownerName } = useLocalSearchParams();

  return (
    <SafeAreaView>
      <Text>Project ID: {projectId}</Text>
      <Text>Project Name: {projectName}</Text>
      <Text>Owner Name: {ownerName}</Text>
    </SafeAreaView>
  );
};

export default Project_home;

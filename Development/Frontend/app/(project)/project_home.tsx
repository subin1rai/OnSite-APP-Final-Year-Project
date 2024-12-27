import { Image, RefreshControl, SafeAreaView, ScrollView, Text, View, Pressable } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router"; // Correct import
import { icons } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";

const Project_home = () => {
  // Get the search parameters for this page
  const router = useRouter();
  const { projectId, projectName, ownerName } = useLocalSearchParams();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate data fetching or API call
      console.log("Refreshing data...");
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated delay
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <SafeAreaView>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FCA311" // Loader color for iOS
            colors={["#FCA311"]} // Loader colors for Android
          />
        }
      >
        <View className="px-4">
          <View className="flex-row justify-between items-center">
            <Pressable onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </Pressable>
            <Text className="text-[24px] font-bold">{projectName}</Text>
            <Image source={icons.bell} className="w-8 h-8" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Project_home;

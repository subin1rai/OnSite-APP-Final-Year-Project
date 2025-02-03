import { Image, RefreshControl, SafeAreaView, ScrollView, Text, View, Pressable } from "react-native";
import { useRouter, useLocalSearchParams, Link } from "expo-router"; // Correct import
import { icons } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";

const Project_home = () => {
  // Get the search parameters for this page
  const router = useRouter();
  const { projectId, projectName, ownerName } = useLocalSearchParams();
  const [refreshing, setRefreshing] = useState(false);
  const [value,setValue] = useState(0);
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

          <View className="bg-[#FEEDCF] w-full mt-2 flex-row justify-between p-4 h-[200px]">
         <View className="">
         <View className="py-4">
          <Text className="font-semibold text-[16px]">client Name</Text>
          <Text className="font-bold text-[24px]">{ownerName}</Text>
          </View>
          <View className="py-4">
          <Text>Location</Text>
          <Text>Dharan-12</Text>
          </View>
         </View>
          {/* Progress */}
          <View>
            <Text>Progress</Text>
        
          </View>
          </View>
          <View>
          <Link
                href={{
                  pathname: "/(expenses)/budget",
                  params: {
                    projectId
                  }
                }}
              ><View className="w-full flex justify-center">
                <Text className="text-[18px]">Budget</Text>
                </View>
              </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Project_home;

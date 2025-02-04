import React from "react";
import { View, Text, SafeAreaView, ScrollView, RefreshControl, Image, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { icons } from "@/constants";
import { useProjectStore } from "@/store/projectStore"; // adjust path accordingly

const Project_home = () => {
  const router = useRouter();
  const { selectedProject } = useProjectStore();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Add refresh logic here (e.g., re-fetch project details)
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  if (!selectedProject) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No project data available.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FCA311" colors={["#FCA311"]} />
        }
      >
        <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
          {/* Header */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Pressable onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </Pressable>
            <Text style={{ fontSize: 24, fontWeight: "bold" }}>{selectedProject.projectName}</Text>
            <Image source={icons.bell} style={{ width: 32, height: 32 }} />
          </View>

          {/* Project Details Card */}
          <View style={{ backgroundColor: "#FEEDCF", marginTop: 12, padding: 16, height: 200, flexDirection: "row", justifyContent: "space-between" }}>
            <View>
              <Text style={{ fontSize: 16, fontWeight: "600" }}>Client Name</Text>
              <Text style={{ fontSize: 24, fontWeight: "bold" }}>{selectedProject.ownerName}</Text>
              <View style={{ marginTop: 8 }}>
                <Text>Location</Text>
                <Text>{selectedProject.location || "Not specified"}</Text>
              </View>
            </View>
            {/* Progress Section (customize as needed) */}
            <View style={{ justifyContent: "center" }}>
              <Text>Progress</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Project_home;

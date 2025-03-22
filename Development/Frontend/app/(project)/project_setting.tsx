import { icons } from "@/constants";
import apiHandler from "@/context/ApiHandler";
import { useProjectStore } from "@/store/projectStore";
import React, { useEffect, useState } from "react";
import {
  Image,
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { Ionicons } from "@expo/vector-icons";

// Interface
interface ProjectData {
  projectName: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  budget: {
    amount: number;
  }[];
}

// Helper to format date
const DateOnly = (date?: string) => {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
};

const ProjectSetting = () => {
  const { selectedProject } = useProjectStore();
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProject = async () => {
    try {
      const token = await SecureStore.getItemAsync("AccssToken");

      if (selectedProject) {
        const response = await apiHandler.post(
          `/singleProject?id=${selectedProject.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Project data fetched:", response.data);
        setProjectData(response.data.project);
      } else {
        console.error("No project selected");
      }
    } catch (error) {
      console.error("Failed to fetch project:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [selectedProject]);

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="p-4">
        {loading ? (
          <Text className="text-center py-4 text-gray-500">
            Loading project details...
          </Text>
        ) : projectData ? (
          <View className="flex gap-4">
            <View className="bg-white rounded-xl px-4 py-4 gap-3">
            {/* Header */}
            <View className="flex-row justify-between items-center gap-2">
              <Text className="text-2xl font-semibold">
                {projectData.projectName}
              </Text>
              <Image source={icons.edit} className="w-6 h-6" />
            </View>

            {/* Location */}
            <View className="flex-row items-center gap-2">
              <Image source={icons.point} className="w-6 h-6 mr-2" />
              <Text className="text-gray-700">
                {projectData.location || "No location provided"}
              </Text>
            </View>

            {/* Dates */}
            <View className="flex-row items-center  gap-2">
              <Ionicons name="calendar" size={18} color="#6B7280" />
              <Text className="text-gray-700">
                {DateOnly(projectData.startDate)}
              </Text>
              <Text className="text-gray-500">- - -</Text>
              <Text className="text-gray-700">
                {DateOnly(projectData.endDate)}
              </Text>
            </View>

            {/* Budget */}
            <View className="flex-row items-center gap-2">
              <Ionicons name="cash-outline" size={18} color="#6B7280" />
              <Text className="text-gray-700">
                {projectData.budget[0]?.amount ?? "No budget available"}
              </Text>
            </View>
          </View>
          {/* status */}
          <View className="flex-row bg-white rounded-xl px-4 py-4 gap-3 justify-between">
            <Text className="font-medium">Project Status</Text>
           <View>
           <Text>OnGoing</Text>
           </View>
          </View>
          {/*delete */}
          <View className="flex-row bg-white rounded-xl px-4 py-4 gap-3 items-center">
              <Image source={icons.trash} className="w-6 h-6 mr-2" />
            <Text className="font-medium text-[#FF3333]">Delete Project</Text>
          </View>

          </View>
        ) : (
          <Text className="text-center py-4 text-gray-500">
            No project data available
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ProjectSetting;

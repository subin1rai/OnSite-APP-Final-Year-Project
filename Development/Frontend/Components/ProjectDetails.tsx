import { icons, images } from "@/constants";
import apiHandler from "@/context/ApiHandler";
import { useProjectStore } from "@/store/projectStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  Modal,
  FlatList,
  Alert,
} from "react-native";

// Define TypeScript interfaces
interface Client {
  id: number;
  email: string;
  role: string;
  username: string;
  image: string | null;
  shareid?: number;
}

interface Project {
  id: number;
  projectName: string;
  ownerName: string;
  location: string;
  startDate: string;
  endDate: string;
  status: string;
  client?: Client;
}

interface Status {
  label: string;
  color: string;
}

const ProjectDetails: React.FC = () => {
  const { selectedProject } = useProjectStore();
  const [status, setStatus] = useState<string>("OnGoing");
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [projectData, setProjectData] = useState<Project | null>(null);

  const statuses: Status[] = [
    { label: "OnGoing", color: "bg-blue-500" },
    { label: "Completed", color: "bg-green-500" },
    { label: "Pending", color: "bg-yellow-500" },
    { label: "Cancelled", color: "bg-red-500" },
  ];

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    setModalVisible(false);
  };

  const handleShareProject = () => {
    if (projectData?.client) {
      Alert.alert(
        "Project already shared",
        "This project has already been shared with a client."
      );
    } else {
      router.push("/(project)/share_project");
    }
  };

  const getStatusColor = (status: string): string => {
    return statuses.find((s) => s.label === status)?.color || "bg-gray-500";
  };

  const fetchProject = async () => {
    try {
      const response = await apiHandler.post<{ data: Project }>(
        "/projectDetails",
        {
          projectId: selectedProject?.id,
        }
      );
      setProjectData(response.data);
    } catch (error) {
      console.error("Error fetching project details:", error);
    }
  };

  useEffect(() => {
    fetchProject();
  }, []);

  return (
    <View className="p-4 bg-white">
      {/* Project Status */}
      <View className="flex flex-row justify-between items-center py-4">
        <Text className="text-lg font-medium">Project Status</Text>
        <TouchableOpacity
          className="flex flex-row gap-2 items-center"
          onPress={() => setModalVisible(true)}
        >
          <View className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
          <Text className="text-lg">{status}</Text>
          <Image source={icons.dropdown} className="w-6 h-6" />
        </TouchableOpacity>
      </View>

      <View className="border-b border-gray-300 my-2" />

      <TouchableOpacity
        className="flex flex-row justify-between items-center py-4"
        onPress={handleShareProject}
      >
        <Text className="text-lg font-medium">Share Project</Text>

        {projectData?.client?.shareid ? (
          <Image
            source={{ uri: projectData.client.image || images.imageProfile }}
            className="w-9 h-9 rounded-full"
          />
        ) : (
          <Ionicons name="share-outline" size={24} />
        )}
      </TouchableOpacity>

      <View className="border-b border-gray-300 my-2" />

      {/* Project Settings */}
      <TouchableOpacity
        className="flex flex-row justify-between items-center py-4"
        onPress={() => router.push("/(project)/project_setting")}
      >
        <Text className="text-lg font-medium">Project Settings</Text>
        <Image source={icons.edit} className="w-6 h-6" />
      </TouchableOpacity>

      <View className="border-b border-gray-300 my-2" />

      {/* Modal for Status Selection */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="absolute top-24 right-6 w-40 bg-white shadow-lg rounded-lg border border-gray-200 p-2">
          <FlatList
            data={statuses}
            keyExtractor={(item) => item.label}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="p-3 flex flex-row items-center gap-2 border-b border-gray-200"
                onPress={() => handleStatusChange(item.label)}
              >
                <View className={`w-3 h-3 rounded-full ${item.color}`} />
                <Text className="text-lg">{item.label}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
};

export default ProjectDetails;

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
  Modal,
  ActivityIndicator,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import SuccessModal from "@/Components/SuccessModel";
import ErrorModal from "@/Components/ErrorModel";

// Interface
interface ProjectData {
  projectName: string;
  location?: string;
  startDate?: string;
  status?: string;
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
  const { selectedProject, clearSelectedProject } = useProjectStore();
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const fetchProject = async () => {
    try {
      const token = await SecureStore.getItemAsync("AccessToken");

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
      } 
    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await apiHandler.put("/projectDelete", {
        projectId: selectedProject?.id
      });
      
      if (response && response.status === 200) {
        setIsDeleting(false);
        setShowDeleteModal(false);
        setSuccessModalVisible(true);
        clearSelectedProject();
      } else {
        throw new Error("Failed to delete project");
      }
    } catch (error:any) {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setErrorMessage(`${error.message}. Please try again.`);
      setErrorModalVisible(true);
      console.error("Delete project error:", error);
    }
  };

  const handleSuccessModalClose = () => {
    setSuccessModalVisible(false);
    router.back();
  };

  const handleErrorModalClose = () => {
    setErrorModalVisible(false);
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
              <View className="flex-row items-center gap-2">
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
                <Text>{projectData.status}</Text>
              </View>
            </View>
            {/*delete */}
            <TouchableOpacity 
              className="flex-row bg-white rounded-xl px-4 py-4 gap-3 items-center" 
              onPress={() => setShowDeleteModal(true)}
            >
              <Image source={icons.trash} className="w-6 h-6 mr-2" />
              <Text className="font-medium text-[#FF3333]">Delete Project</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text className="text-center py-4 text-gray-500">
            No project data available
          </Text>
        )}
      </View>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/40">
          <View className="bg-white w-4/5 rounded-xl p-5 items-center">
            <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="trash-outline" size={24} color="#ef4444" className="p-4" />
            </View>
            
            <Text className="text-xl font-bold text-gray-800 mb-2 text-center">
              Delete Project
            </Text>
            
            <Text className="text-gray-600 text-center mb-6">
              Are you sure you want to delete this project? This action cannot be undone.
            </Text>
            
            <View className="flex-row w-full gap-3">
              <TouchableOpacity 
                className="flex-1 border border-gray-300 py-3 rounded-lg items-center"
                onPress={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                <Text className="text-gray-700 font-medium">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="flex-1 bg-red-500 py-3 rounded-lg items-center"
                onPress={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white font-medium">Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <SuccessModal
        visible={successModalVisible}
        title="Project Deleted"
        message="Your project has been successfully deleted."
        onClose={handleSuccessModalClose}
      />

      {/* Error Modal */}
      <ErrorModal
        visible={errorModalVisible}
        title="Error"
        message={errorMessage}
        onClose={handleErrorModalClose}
      />
    </SafeAreaView>
  );
};

export default ProjectSetting;
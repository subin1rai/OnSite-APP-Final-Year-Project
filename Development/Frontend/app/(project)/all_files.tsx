import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  Pressable,
  StatusBar,
  Platform,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useProjectStore } from "@/store/projectStore";
import apiHandler from "../../context/ApiHandler";
import Checkbox from "expo-checkbox";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

interface FileItem {
  id: number;
  name: string;
  file: string; 
  projectId: number;
}

export default function AllFiles() {
  const { selectedProject } = useProjectStore();
  const projectId = selectedProject?.id || null;
  const [documents, setDocuments] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);


  useEffect(() => {
    if (projectId) {
      fetchDocuments();
    }
  }, [projectId]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await apiHandler.post(
        "/allDocument",
        { projectId },
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.data.success) {
        setDocuments(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
    setLoading(false);
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Camera access is required to take pictures.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      uploadFiles([result.assets[0]]);
    }
  };
const openFilePicker = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      multiple: true,
      type: ["image/*", "application/pdf"],
    });

    if (result.canceled) {
      return;
    }

    uploadFiles(result.assets);
  };

  // Function to upload files to backend
  const uploadFiles = async (files: any[]) => {
    const formData = new FormData();
    formData.append("projectId", projectId?.toString() || "");

    files.forEach((file) => {
      const fileBlob = {
        uri: file.uri,
        type: file.mimeType || "application/octet-stream",
        name: file.name || `upload_${Date.now()}`
      };
      formData.append("files", fileBlob as any);
    });

    try {
      const response = await apiHandler.post("/document/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        setDocuments((prevDocs) => [...response.data.data, ...prevDocs]);
        Alert.alert("Success", "Files uploaded successfully!");
      } else {
        Alert.alert("Upload Failed", response.data.message);
      }
    } catch (error) {
      console.error("Upload Error:", error);
      Alert.alert("Error", "Failed to upload files. Please try again.");
    }
  };

  const handleLongPress = (file: FileItem) => {
    setSelectionMode(true);
    setSelectedFiles([file]);
  };
  const handleFileSelect = (file: FileItem) => {
    if (!selectionMode) return;

    setSelectedFiles((prevSelected) => {
      const isSelected = prevSelected.some((item) => item.id === file.id);
      if (isSelected) {
        return prevSelected.filter((item) => item.id !== file.id);
      } else {
        return [...prevSelected, file];
      }
    });
  };

  // Delete selected files
  const deleteFiles = async () => {
    if (selectedFiles.length === 0) return;

    Alert.alert("Delete Files", "Are you sure you want to delete the selected files?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const fileIds = selectedFiles.map((file) => file.id);

          try {
            const response = await apiHandler.post("/document/delete", { fileIds }, { headers: { "Content-Type": "application/json" } });

            if (response.data.success) {
              setDocuments((prevDocs) => prevDocs.filter((doc) => !fileIds.includes(doc.id)));
              setSelectedFiles([]);
              setSelectionMode(false);
              Alert.alert("Deleted", "Files have been deleted successfully.");
            } else {
              Alert.alert("Error", "Failed to delete files.");
            }
          } catch (error) {
            console.error("Delete Error:", error);
            Alert.alert("Error", "Something went wrong.");
          }
        },
      },
    ]);
  };


  const isImageFile = (fileUrl: string) => /\.(jpg|jpeg|png)$/i.test(fileUrl);
  const isPdfFile = (fileUrl: string) => /\.pdf$/i.test(fileUrl);

  const renderItem = ({ item }: { item: FileItem }) => {
    const isSelected = selectedFiles.some((selected) => selected.id === item.id);

    return (
      <TouchableOpacity
        className="w-1/3 p-2 aspect-square"
        onLongPress={() => handleLongPress(item)}
        onPress={() => handleFileSelect(item)}
      >
        <View className="relative bg-gray-100 border border-gray-300 rounded-lg overflow-hidden flex-1">
          {isSelected && (
            <View className="absolute top-2 left-2 z-10">
              <Checkbox value={true} color="#ffb133" />
            </View>
          )}
          {isImageFile(item.file) ? (
            <Image source={{ uri: item.file }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <View className="flex-1 justify-center items-center p-2">
              <Image source={require("../../assets/icons/pdf-icon.png")} className="w-12 h-12 mb-2" resizeMode="contain" />
              <Text className="text-xs text-gray-600 text-center" numberOfLines={2}>
                {item.name}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <SafeAreaView className="bg-[#ffb133]">
        <View
          className="bg-[#ffb133] flex-row justify-between items-center px-4 pb-[10px]"
          style={{
            marginTop: Platform.OS === "ios" ? 0: StatusBar.currentHeight,
          }}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
          <Text className="text-white text-2xl font-medium tracking-widest">
            Files
          </Text>
          {selectionMode ? (
            <TouchableOpacity onPress={deleteFiles}>
              <Ionicons name="trash" size={24} color="white" />
            </TouchableOpacity>
          ) : 
          <View className=" flex-row gap-4 py-1 items-center">
           <TouchableOpacity onPress={openCamera}>
           <Ionicons name="camera" size={24} color="white" />
           </TouchableOpacity>
           <TouchableOpacity onPress={openFilePicker}>
            <Ionicons name="download" size={24} color="white" />
           </TouchableOpacity>
          </View>}
        </View>
      </SafeAreaView>

      {/* Loader */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FCA311" />
        </View>
      ) : (
        <FlatList
          data={documents}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          numColumns={3}
        />
      )}
    </View>
  );
}

import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, Alert, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useVendorsStore } from "@/store/mainVendorStore";
import apiHandler from "@/context/ApiHandler";
import * as SecureStore from "expo-secure-store";
import { Ionicons } from "@expo/vector-icons";

interface MainVendorProps {
  onVendorAdded?: () => void;
}

const MainVendor: React.FC<MainVendorProps> = ({ onVendorAdded }) => {
  const { addVendor } = useVendorsStore();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Request Permissions
  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: galleryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== "granted" || galleryStatus !== "granted") {
      Alert.alert("Permission Denied", "You need to allow camera & gallery access to use this feature.");
    }
  };

  // Open Camera
  const takePhoto = async () => {
    await requestPermissions();

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Pick Image from Gallery
  const pickImage = async () => {
    await requestPermissions();

    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Upload Image to Backend for OCR Processing
  const handleUpload = async () => {
    if (!image) {
      Alert.alert("Error", "Please select an image first.");
      return;
    }

    setLoading(true);

    try {
      const token = await SecureStore.getItemAsync("AccessToken");

      const formData = new FormData();
      formData.append("image", {
        uri: image,
        type: "image/jpeg",
        name: "vendor.jpg",
      } as any);

      const response = await apiHandler.post("/addVendor", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        addVendor(response.data.vendor); // Add vendor to store
        Alert.alert("Success", "Vendor added successfully!");
        setImage(null);
        if (onVendorAdded) onVendorAdded();
      } else {
        Alert.alert("Error", response.data.message || "Failed to add vendor");
      }
    } catch (error) {
      console.error("Upload Error:", error);
      Alert.alert("Error", "Something went wrong! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="p-4">
      <Text className="text-xl font-semibold mb-2">Upload Vendor Image</Text>

      {/* Image Preview */}
      {image && (
        <Image source={{ uri: image }} className="w-full h-40 rounded-md mb-3 border border-neutral-400" />
      )}

      {/* Image Upload Buttons */}
      <View className="flex-row justify-between mb-4 gap-4 mt-4">
        <TouchableOpacity onPress={takePhoto} className="bg-blue-500 p-3 rounded-md flex-1 h-32">
        <Ionicons name="camera" size={42} color="white" className="items-center m-auto"/>
        </TouchableOpacity>

        <TouchableOpacity onPress={pickImage} className="border border-neutral-400 p-3 rounded-md flex-1">
        <Ionicons name="image" size={42} color="gray" className="items-center m-auto"/>
        </TouchableOpacity>
      </View>

      {/* Upload Button */}
      <TouchableOpacity className="bg-[#ffb133] p-4 mt-6 rounded-md" onPress={handleUpload} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-center">Upload</Text>}
      </TouchableOpacity>
    </View>
  );
};

export default MainVendor;

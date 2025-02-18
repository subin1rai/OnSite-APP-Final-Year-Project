import React, { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useThreeDModelStore } from "@/store/threeDmodelStore";
import { useProjectStore } from "@/store/projectStore";
import * as SecureStore from "expo-secure-store";
import apiHandler from "@/context/ApiHandler";

// Define Props Type
interface Add3DModelProps {
  onModelAdded?: () => void;
}

// Define Form Data Type
interface FormDataType {
  image: string | null;
  modelName: string;
  modelUrl: string;
}

const Add3DModel: React.FC<Add3DModelProps> = ({ onModelAdded }) => {
  const { addThreeDModel } = useThreeDModelStore();
  const { selectedProject } = useProjectStore();

  const [form, setForm] = useState<FormDataType>({
    image: null,
    modelName: "",
    modelUrl: "",
  });

  const [uploading, setUploading] = useState<boolean>(false);

  // Handle Form Input Change
  const handleChange = (key: keyof FormDataType, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

   // Reset Form Values
   const resetForm = () => {
    setForm({ image: null, modelName: "", modelUrl: "" });
  };
  // Open Image Picker
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Allow access to media library to upload images."
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setForm((prev) => ({ ...prev, image: result.assets[0].uri }));
    }
  };

  // Upload 3D Model Data
  const handleSubmit = async () => {
    if (!selectedProject) {
      Alert.alert("Error", "No active project selected.");
      return;
    }

    if (!form.modelName || !form.modelUrl || !form.image) {
      Alert.alert("Missing Fields", "All fields including image are required.");
      return;
    }

    setUploading(true);
    try {
      const token = await SecureStore.getItemAsync("AccessToken");
      const formData = new FormData();
      formData.append("modelName", form.modelName);
      formData.append("modelUrl", form.modelUrl);
      formData.append("projectId", selectedProject.id.toString());

      // Convert Image URI to FormData format
      if (form.image) {
        const imageName = form.image.split("/").pop() || "model.jpg";
        const imageExt = imageName.split(".").pop() || "jpg";
        formData.append("image", {
          uri: form.image,
          name: `model.${imageExt}`,
          type: `image/${imageExt}`,
        } as any);
      }

      const response = await apiHandler.post("/upload3dmodel", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        Alert.alert("Success", "3D Model added successfully!");
        addThreeDModel(response.data.model);
        resetForm();
        if (onModelAdded) onModelAdded();
      } else {
        Alert.alert("Error", "Failed to add 3D Model.");
      }
    } catch (error) {
      console.error("Upload Error:", error);
      Alert.alert("Error", "Something went wrong! Please check logs.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ScrollView className="px-4 pt-2" keyboardShouldPersistTaps="handled">
        
         {/* Model Name */}
         <View className="mt-4">
          <Text>Model Name</Text>
          <TextInput
            placeholder="Enter Model Name"
            value={form.modelName}
            onChangeText={(text) => handleChange("modelName", text)}
            className="mt-2 border border-gray-300 rounded-md py-4 px-3 text-gray-700"
            returnKeyType="done"
            placeholderTextColor="#888"
          />
        </View>

        {/* Model URL */}
        <View className="mt-4">
          <Text>Model URL</Text>
          <TextInput
            placeholder="Enter Model URL"
            value={form.modelUrl}
            onChangeText={(text) => handleChange("modelUrl", text)}
            className="mt-2 border border-gray-300 rounded-md py-4 px-3 text-gray-700"
            keyboardType="url"
            returnKeyType="done"
            placeholderTextColor="#888"
          />
        </View>
        {/* Upload Image */}
        <TouchableOpacity onPress={pickImage}>
          <Text className="mb-2">Upload Model Preview</Text>
          <View className="h-40 w-full border border-neutral-200 rounded-lg bg-neutral-200 flex items-center justify-center">
            {form.image ? (
              <Image
                source={{ uri: form.image }}
                className="h-full w-full rounded-lg"
              />
            ) : (
              <Text className="text-gray-500">Select Image</Text>
            )}
          </View>
        </TouchableOpacity>


        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={uploading}
          className="mt-6 bg-[#ffb133] py-4 rounded-md"
        >
          <Text className="text-white text-center text-lg">
            {uploading ? "Uploading..." : "Add 3D Model"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

export default Add3DModel;

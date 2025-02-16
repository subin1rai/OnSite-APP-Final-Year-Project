import React, { useState } from "react";
import { 
    Text, TextInput, TouchableOpacity, View, Image, Alert, 
    Keyboard, TouchableWithoutFeedback, ScrollView 
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useWorkerStore } from "@/store/workerStore";
import * as SecureStore from "expo-secure-store";
import apiHandler from "@/context/ApiHandler";

// Define Props Type
interface MainWorkerProps {
  onWorkerAdded?: () => void;
}

// Define Form Data Type
interface FormDataType {
  image: string | null;
  workerName: string;
  designation: string;
  contact: string;
  salary: string;
}

const MainWorker: React.FC<MainWorkerProps> = ({ onWorkerAdded }) => {
  const [form, setForm] = useState<FormDataType>({
    image: null,
    workerName: "",
    designation: "",
    contact: "",
    salary: "",
  });

  const [uploading, setUploading] = useState<boolean>(false);

  // Handle Form Input Change
  const handleChange = (key: keyof FormDataType, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Open Image Picker
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Allow access to media library to upload images.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setForm((prev) => ({ ...prev, image: result.assets[0].uri }));
    }
  };

  // Upload Worker Data
  const handleSubmit = async () => {
    if (!form.workerName || !form.contact || !form.designation || !form.salary || !form.image) {
      Alert.alert("Missing Fields", "All fields including image are required.");
      return;
    }
  
    setUploading(true);
    try {
      const data = new FormData();
      data.append("name", form.workerName);
      data.append("contact", form.contact);
      data.append("designation", form.designation);
      data.append("salary", form.salary);
  
      if (form.image) {
        const imageName = form.image.split("/").pop() || "worker.jpg";
        const imageExt = imageName.split(".").pop() || "jpg";
        data.append("image", { uri: form.image, name: `worker.${imageExt}`, type: `image/${imageExt}` } as any);
      }
  
      const token = await SecureStore.getItemAsync("AccessToken");
      const response = await apiHandler.post("/worker/addWorker", data, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } });
  
      if (response.status === 200) {
        Alert.alert("Success", "Worker added successfully!");
        useWorkerStore.getState().addWorker(response.data.savedWorker);
        onWorkerAdded?.();
      }
    } catch {
      Alert.alert("Error", "Failed to add worker.");
    } finally {
      setUploading(false);
    }
  };
  

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ScrollView 
        className="px-4 pt-2"
        keyboardShouldPersistTaps="handled"
      >
        {/* Upload Image */}
        <TouchableOpacity onPress={pickImage}>
          <Text className="text-center mb-2">Upload Image</Text>
          <View className="h-32 w-32 border border-neutral-400 rounded-lg m-auto bg-neutral-200 flex items-center justify-center">
            {form.image ? (
              <Image source={{ uri: form.image }} className="h-full w-full rounded-lg" />
            ) : (
              <Text className="text-gray-500">Select Image</Text>
            )}
          </View>
        </TouchableOpacity>

        {/* Worker Name */}
        <View className="mt-4">
          <Text>Worker Name</Text>
          <TextInput
            placeholder="Worker Name"
            value={form.workerName}
            onChangeText={(text) => handleChange("workerName", text)}
            className="mt-2 border border-gray-300 rounded-md py-2 px-3 text-gray-700"
            returnKeyType="done"
          />
        </View>

        {/* Designation */}
        <View className="mt-4">
          <Text>Designation</Text>
          <TextInput
            placeholder="Designation"
            value={form.designation}
            onChangeText={(text) => handleChange("designation", text)}
            className="mt-2 border border-gray-300 rounded-md py-2 px-3 text-gray-700"
            returnKeyType="done"
          />
        </View>

        {/* Contact */}
        <View className="mt-4">
          <Text>Contact</Text>
          <TextInput
            placeholder="Contact"
            value={form.contact}
            onChangeText={(text) => handleChange("contact", text)}
            className="mt-2 border border-gray-300 rounded-md py-2 px-3 text-gray-700"
            keyboardType="phone-pad"
            returnKeyType="done"
          />
        </View>

        {/* Salary */}
        <View className="mt-4">
          <Text>Salary</Text>
          <TextInput
            placeholder="Salary"
            value={form.salary}
            onChangeText={(text) => handleChange("salary", text)}
            className="mt-2 border border-gray-300 rounded-md py-2 px-3 text-gray-700"
            keyboardType="numeric"
            returnKeyType="done"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity onPress={handleSubmit} disabled={uploading} className="mt-6 bg-[#ffb133] py-3 rounded-md">
          <Text className="text-white text-center text-lg">{uploading ? "Uploading..." : "Add Worker"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

export default MainWorker;

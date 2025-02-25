import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import apiHandler from "@/context/ApiHandler";
import { images } from "@/constants";

interface FormDataType {
  image: string | null;
  name: string;
  email: string;
}

const EditProfile = () => {
  const [form, setForm] = useState<FormDataType>({
    image: null,
    name: "",
    email: "",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);

  // Fetch User Data
  const fetchUserData = async () => {
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync("AccessToken");
      const response = await apiHandler.get("/user/getUser", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const user = response?.data?.user;
      setForm({
        name: user.username,
        email: user.email,
        image: user.image || null,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Handle Form Input Change
  const handleChange = (key: keyof FormDataType, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Reset Form
  const resetForm = () => {
    fetchUserData();
  };

  // Open Image Picker
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Allow access to media library to upload images."
      );
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

  // Update Profile Data
  const handleUpdateProfile = async () => {
    if (!form.name || !form.email) {
      Alert.alert("Missing Fields", "Name and Email are required.");
      return;
    }

    setUpdating(true);
    try {
      const token = await SecureStore.getItemAsync("AccessToken");
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);

      // Convert Image URI to FormData format
      if (form.image) {
        const imageName = form.image.split("/").pop() || "profile.jpg";
        const imageExt = imageName.split(".").pop() || "jpg";
        formData.append("image", {
          uri: form.image,
          name: `profile.${imageExt}`,
          type: `image/${imageExt}`,
        } as any);
      }

      const response = await apiHandler.put("/user/updateUser", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        Alert.alert("Success", "Profile updated successfully!");
        resetForm();
      } else {
        Alert.alert("Error", "Failed to update profile.");
      }
    } catch (error) {
      console.error("Update Error:", error);
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#FCA311" />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ScrollView className="px-4 pt-2" keyboardShouldPersistTaps="handled">
        {/* Profile Image Upload */}
        <TouchableOpacity onPress={pickImage} className="items-center mb-4">
          <View className="h-40 w-40 border border-neutral-300 rounded-full bg-neutral-200 flex items-center justify-center overflow-hidden">
            {form.image ? (
              <Image
                source={{ uri: form.image }}
                className="h-full w-full rounded-full"
              />
            ) : (
              <Text className="text-gray-500">Select Image</Text>
            )}
          </View>
          <Text className="text-blue-600 mt-2">Change Profile Picture</Text>
        </TouchableOpacity>

        {/* Name Field */}
        <View className="mt-4">
          <Text>Name</Text>
          <TextInput
            placeholder="Enter Full Name"
            value={form.name}
            onChangeText={(text) => handleChange("name", text)}
            className="mt-2 border border-gray-300 rounded-md py-4 px-3 text-gray-700"
            returnKeyType="done"
            placeholderTextColor="#888"
          />
        </View>

        {/* Email Field */}
        <View className="mt-4">
          <Text>Email</Text>
          <TextInput
            placeholder="Enter Email"
            value={form.email}
            onChangeText={(text) => handleChange("email", text)}
            className="mt-2 border border-gray-300 rounded-md py-4 px-3 text-gray-700"
            keyboardType="email-address"
            returnKeyType="done"
            placeholderTextColor="#888"
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleUpdateProfile}
          disabled={updating}
          className="mt-6 bg-[#ffb133] py-4 rounded-md"
        >
          <Text className="text-white text-center text-lg">
            {updating ? "Updating..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

export default EditProfile;

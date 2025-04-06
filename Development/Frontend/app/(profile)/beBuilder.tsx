import React, { useState } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import apiHandler from "@/context/ApiHandler";
import * as SecureStore from "expo-secure-store";

// TypeScript interfaces
interface FormData {
  companyName: string;
  address: string;
  email: string;
  contact: string;
}

interface FormErrors {
  companyName?: string;
  address?: string;
  email?: string;
  contact?: string;
}

const BeBuilder: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    address: "",
    email: "",
    contact: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });

    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: undefined,
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.contact.trim()) {
      newErrors.contact = "Contact number is required";
    } else if (!/^\d{10}$/.test(formData.contact.replace(/\D/g, ""))) {
      newErrors.contact = "Contact should be a valid 10-digit number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync("AccessToken");
      if (!token) {
        Alert.alert(
          "Authentication Error",
          "Please log in again to continue.",
          [{ text: "OK" }]
        );
        setLoading(false);
        return;
      }

      const response = await apiHandler.post("/register-builder", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.status === 201) {
        setShowSuccess(true);
        setFormData({
          companyName: "",
          address: "",
          email: "",
          contact: "",
        });
        
        // Hide success message after 8 seconds
        setTimeout(() => {
          setShowSuccess(false);
          router.back();
        }, 8000);
      } else {
        Alert.alert(
          "Registration Failed",
          response.data.message || "There was an error registering your account",
          [{ text: "OK" }]
        );
      }
    } catch (error: any) {
      console.error("Error submitting builder data:", error);
      
      // Check for already registered as builder error
      if (error.response?.status === 400 && 
          error.response?.data?.message === "User already registered as a Builder") {
        Alert.alert(
          "Already Registered",
          "You are already registered as a Builder.",
          [{ text: "OK", onPress: () => router.back() }]
        );
      }
      // Check for network errors
      else if (!error.response) {
        Alert.alert(
          "Network Error",
          "Unable to connect to the server. Please check your internet connection.",
          [{ text: "OK" }]
        );
      } 
      // Check for specific status codes
      else if (error.response?.status === 401) {
        Alert.alert(
          "Authentication Error",
          "Your session has expired. Please log in again.",
          [{ text: "OK" }]
        );
      } else if (error.response?.status === 400) {
        Alert.alert(
          "Validation Error",
          error.response?.data?.message || "Please check your form details and try again.",
          [{ text: "OK" }]
        );
      } else {
        // Generic error for all other cases
        Alert.alert(
          "Error",
          "An unexpected error occurred. Please try again later.",
          [{ text: "OK" }]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Success message component
  if (showSuccess) {
    return (
      <SafeAreaView className="flex-1">
        <View className="flex-1 justify-center items-center px-6">
          <View className="bg-green-50 w-full rounded-xl p-8 items-center">
            <View className="bg-green-100 rounded-full p-4 mb-4">
              <Ionicons name="checkmark-circle" size={60} color="#10B981" />
            </View>
            <Text className="text-2xl font-bold text-gray-800 mb-2 text-center">
              Registration Successful!
            </Text>
            <Text className="text-gray-600 text-center mb-6">
              Your builder account has been created successfully. You can now access all builder features.
            </Text>
            <TouchableOpacity
              className="mt-2 rounded-lg py-3 px-6 bg-[#FCA311] w-full"
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-center">Return to Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          
          {/* Content with visual flair */}
          <View className="px-4 py-6">
            {/* Header section with accent background */}
            <View className="bg-amber-50 rounded-xl p-5 mb-6">
              <Text className="text-2xl font-bold text-gray-800 mb-2">
                Join Our Builder Network
              </Text>
              <Text className="text-gray-600 leading-5">
                Complete the form below to register your company as a builder on
                our platform. Get access to projects and grow your business with
                us.
              </Text>
            </View>

            {/* Form Fields */}
            <View className="flex-col gap-4">
              <View>
                <Text className="text-gray-700 font-medium mb-2">
                  Company Name
                </Text>
                <View
                  className={`flex-row items-center border rounded-lg px-3 py-2 ${
                    errors.companyName
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300 bg-gray-50"
                  }`}
                >
                  <Ionicons
                    name="business-outline"
                    size={20}
                    color="#6B7280"
                    className="mr-2"
                  />
                  <TextInput
                    className="flex-1 text-base py-2 px-1"
                    placeholder="Enter your company name"
                    placeholderTextColor="#9CA3AF"
                    value={formData.companyName}
                    onChangeText={(text) => handleChange("companyName", text)}
                  />
                </View>
                {errors.companyName && (
                  <Text className="text-red-500 text-xs mt-1">
                    {errors.companyName}
                  </Text>
                )}
              </View>

              <View>
                <Text className="text-gray-700 font-medium mb-2">Address</Text>
                <View
                  className={`flex-row items-start border rounded-lg px-3 py-2 ${
                    errors.address
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300 bg-gray-50"
                  }`}
                >
                  <Ionicons
                    name="location-outline"
                    size={20}
                    color="#6B7280"
                    className="mr-2 mt-2"
                  />
                  <TextInput
                    className="flex-1 text-base py-2 px-1"
                    placeholder="Enter company address"
                    placeholderTextColor="#9CA3AF"
                    value={formData.address}
                    onChangeText={(text) => handleChange("address", text)}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
                {errors.address && (
                  <Text className="text-red-500 text-xs mt-1">
                    {errors.address}
                  </Text>
                )}
              </View>

              <View>
                <Text className="text-gray-700 font-medium mb-2">Email</Text>
                <View
                  className={`flex-row items-center border rounded-lg px-3 py-2 ${
                    errors.email
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300 bg-gray-50"
                  }`}
                >
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color="#6B7280"
                    className="mr-2"
                  />
                  <TextInput
                    className="flex-1 text-base py-2 px-1"
                    placeholder="Enter company email"
                    placeholderTextColor="#9CA3AF"
                    value={formData.email}
                    onChangeText={(text) => handleChange("email", text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                {errors.email && (
                  <Text className="text-red-500 text-xs mt-1">
                    {errors.email}
                  </Text>
                )}
              </View>

              <View>
                <Text className="text-gray-700 font-medium mb-2">
                  Contact Number
                </Text>
                <View
                  className={`flex-row items-center border rounded-lg px-3 py-2 ${
                    errors.contact
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300 bg-gray-50"
                  }`}
                >
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color="#6B7280"
                    className="mr-2"
                  />
                  <TextInput
                    className="flex-1 text-base py-2 px-1"
                    placeholder="Enter contact number"
                    placeholderTextColor="#9CA3AF"
                    value={formData.contact}
                    onChangeText={(text) => handleChange("contact", text)}
                    keyboardType="phone-pad"
                  />
                </View>
                {errors.contact && (
                  <Text className="text-red-500 text-xs mt-1">
                    {errors.contact}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                className={`mt-6 rounded-lg py-4 flex-row justify-center items-center ${loading ? "bg-amber-300" : "bg-[#FCA311]"}`}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <>
                    <ActivityIndicator size="small" color="#ffffff" />
                    <Text className="text-white font-bold ml-2">
                      Processing...
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#ffffff"
                    />
                    <Text className="text-white font-bold ml-2">
                      Register as Builder
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Additional info */}
              <View className="mt-6 bg-blue-50 p-4 rounded-lg">
                <Text className="text-blue-800 font-medium mb-1">
                  Benefits of joining:
                </Text>
                <View className="ml-1">
                  <Text className="text-blue-700 text-sm mb-1">
                    • Access to qualified project leads
                  </Text>
                  <Text className="text-blue-700 text-sm mb-1">
                    • Streamlined project management tools
                  </Text>
                  <Text className="text-blue-700 text-sm">
                    • Enhanced visibility to potential clients
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default BeBuilder;
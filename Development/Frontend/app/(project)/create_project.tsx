import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Keyboard,
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "react-native-ui-datepicker";
import dayjs from "dayjs";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import * as SecureStore from "expo-secure-store";
import apiHandler from "@/context/ApiHandler";
import { KeyboardTypeOptions } from "react-native";

const CreateProject = () => {
  const [startDate, setStartDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(dayjs().add(30, 'day'));
  const [openStartPicker, setOpenStartPicker] = useState(false);
  const [openEndPicker, setOpenEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  // Form State
  const [form, setForm] = useState({
    projectName: "",
    ownerName: "",
    budgetAmount: "",
    location: "",
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  });

  // Handle Input Changes
  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Handle Date Change for Start Date
  const handleStartDateChange = (date: any) => {
    setStartDate(date);
    setForm((prev) => ({ ...prev, startDate: date.toISOString() }));
    setOpenStartPicker(false);
  };

  // Handle Date Change for End Date
  const handleEndDateChange = (date: any) => {
    setEndDate(date);
    setForm((prev) => ({ ...prev, endDate: date.toISOString() }));
    setOpenEndPicker(false);
  };

  const validateStep1 = () => {
    if (!form.projectName || !form.location) {
      Alert.alert("Missing Information", "Please fill in project name and address.");
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (
      !form.projectName ||
      !form.ownerName ||
      !form.budgetAmount ||
      !form.location ||
      !form.startDate ||
      !form.endDate
    ) {
      Alert.alert("Incomplete Form", "Please fill in all fields before submitting.");
      return;
    }

    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync("AccessToken");
      
      const result = await apiHandler.post(
        "/project/create",
        {
          projectName: form.projectName,
          ownerName: form.ownerName,
          budgetAmount: Number(form.budgetAmount),
          location: form.location,
          startDate: form.startDate,
          endDate: form.endDate
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (result?.status === 201) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Project created successfully!",
          visibilityTime: 500,
          onHide: () => {
            router.replace("../(tabs)/home");
          },
        });
      } else {
        throw new Error("Failed to create project.");
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "Failed to create project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Custom Input Component
  const FormInput = ({ label, placeholder, value, onChangeText, keyboardType = "default", icon }: { label: string; placeholder: string; value: string; onChangeText: (text: string) => void; keyboardType?: KeyboardTypeOptions; icon?: keyof typeof Ionicons.glyphMap }) => (
    <View className="mb-5">
      <Text className="text-gray-700 font-medium mb-2 text-base">{label}</Text>
      <View className="flex-row items-center border border-gray-200 bg-white rounded-xl px-4 py-3 shadow-sm">
        {icon && (
          <View className="mr-3">
            <Ionicons name={icon} size={20} color="#FCA311" />
          </View>
        )}
        {/* Adding onTouchStart to prevent keyboard dismissal */}
        <TextInput
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          className="flex-1 text-gray-800 text-base"
          placeholderTextColor="#9CA3AF"
          onTouchStart={(e) => e.stopPropagation()}
          blurOnSubmit={false}
        />
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          keyboardShouldPersistTaps="always"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        >
          {/* Header */}
          <View className="px-4">
            {/* Progress Indicator */}
            <View className="flex-row items-center mt-6 bg-white/20 rounded-full p-1">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <View 
                  key={index} 
                  className={`flex-1 h-2 mx-1 rounded-full ${
                    index + 1 <= currentStep ? "bg-[#FCA311]" : "bg-neutral-200"
                  }`}
                />
              ))}
            </View>
          </View>

          <View className="flex-1 px-6 py-6">
            {currentStep === 1 && (
              <>
                <Text className="text-xl font-bold text-gray-800 mb-6">Project Information</Text>
                
                <FormInput
                  label="Project Name"
                  placeholder="Enter project name"
                  value={form.projectName}
                  onChangeText={(text: string) => handleChange("projectName", text)}
                  icon="business"
                />
                
                <FormInput
                  label="Project Location"
                  placeholder="Enter project address"
                  value={form.location}
                  onChangeText={(text: string) => handleChange("location", text)}
                  icon="location"
                />
                
                {/* Date Pickers */}
                <View className="mb-5">
                  <Text className="text-gray-700 font-medium mb-2 text-base">Project Timeline</Text>
                  <View className="flex-row justify-between">
                    {/* Start Date Picker */}
                    <TouchableOpacity
                      className="flex-1 mr-2 flex-row items-center border border-gray-200 bg-white rounded-xl px-4 py-3 shadow-sm"
                      onPress={() => setOpenStartPicker(true)}
                    >
                      <Ionicons name="calendar-outline" size={20} color="#FCA311" />
                      <View className="ml-3">
                        <Text className="text-xs text-gray-500">Start Date</Text>
                        <Text className="text-gray-800">
                          {startDate.format("MMM DD, YYYY")}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* End Date Picker */}
                    <TouchableOpacity
                      className="flex-1 ml-2 flex-row items-center border border-gray-200 bg-white rounded-xl px-4 py-3 shadow-sm"
                      onPress={() => setOpenEndPicker(true)}
                    >
                      <Ionicons name="calendar-outline" size={20} color="#FCA311" />
                      <View className="ml-3">
                        <Text className="text-xs text-gray-500">End Date</Text>
                        <Text className="text-gray-800">
                          {endDate.format("MMM DD, YYYY")}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}

            {currentStep === 2 && (
              <>
                <Text className="text-xl font-bold text-gray-800 mb-6">Client & Budget Details</Text>
                
                <FormInput
                  label="Client Name"
                  placeholder="Enter client name"
                  value={form.ownerName}
                  onChangeText={(text) => handleChange("ownerName", text)}
                  icon="person"
                />
                
                <FormInput
                  label="Budget Amount"
                  placeholder="Enter project budget"
                  value={form.budgetAmount}
                  onChangeText={(text) => handleChange("budgetAmount", text)}
                  keyboardType="numeric"
                  icon="cash"
                />
                
                <View className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <Text className="text-blue-800 font-medium">Project Summary</Text>
                  <View className="mt-2">
                    <View className="flex-row justify-between py-1">
                      <Text className="text-gray-600">Project:</Text>
                      <Text className="text-gray-800 font-medium">{form.projectName}</Text>
                    </View>
                    <View className="flex-row justify-between py-1">
                      <Text className="text-gray-600">Location:</Text>
                      <Text className="text-gray-800 font-medium">{form.location}</Text>
                    </View>
                    <View className="flex-row justify-between py-1">
                      <Text className="text-gray-600">Timeline:</Text>
                      <Text className="text-gray-800 font-medium">
                        {startDate.format("MMM DD")} - {endDate.format("MMM DD, YYYY")}
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            )}

            {/* Navigation Buttons */}
            <View className="flex-row mt-6">
              {currentStep > 1 && (
                <TouchableOpacity
                  onPress={prevStep}
                  className="flex-1 mr-2 py-4 rounded-xl border border-gray-300 bg-white"
                >
                  <Text className="text-center text-gray-700 font-semibold">Back</Text>
                </TouchableOpacity>
              )}
              
              {currentStep < totalSteps ? (
                <TouchableOpacity
                  onPress={nextStep}
                  className={`flex-1 ${currentStep > 1 ? 'ml-2' : ''} py-4 rounded-xl bg-[#FCA311]`}
                >
                  <Text className="text-center text-white font-semibold">Next</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={loading}
                  className={`flex-1 ${currentStep > 1 ? 'ml-2' : ''} py-4 rounded-xl ${
                    loading ? "bg-gray-400" : "bg-[#FCA311]"
                  }`}
                >
                  <Text className="text-center text-white font-semibold">
                    {loading ? "Creating..." : "Create Project"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Start Date Picker Modal */}
      <Modal visible={openStartPicker} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-5 rounded-2xl w-11/12 shadow-lg">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-gray-800">Select Start Date</Text>
              <TouchableOpacity onPress={() => setOpenStartPicker(false)}>
                <Ionicons name="close-circle" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <DateTimePicker
              mode="single"
              date={startDate.toDate()}
              onChange={(params) => {
                if (params.date) {
                  handleStartDateChange(dayjs(params.date));
                }
              }}
              selectedItemColor="#FCA311"
            />
            <TouchableOpacity
              onPress={() => setOpenStartPicker(false)}
              className="mt-4 py-3 bg-[#FCA311] rounded-xl"
            >
              <Text className="text-center text-white font-semibold">Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* End Date Picker Modal */}
      <Modal visible={openEndPicker} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-5 rounded-2xl w-11/12 shadow-lg">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-gray-800">Select End Date</Text>
              <TouchableOpacity onPress={() => setOpenEndPicker(false)}>
                <Ionicons name="close-circle" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <DateTimePicker
              mode="single"
              date={endDate.toDate()}
              minDate={startDate.toDate()}
              onChange={(params) => {
                if (params.date) {
                  handleEndDateChange(dayjs(params.date));
                }
              }}
              selectedItemColor="#FCA311"
            />
            <TouchableOpacity
              onPress={() => setOpenEndPicker(false)}
              className="mt-4 py-3 bg-[#FCA311] rounded-xl"
            >
              <Text className="text-center text-white font-semibold">Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CreateProject;
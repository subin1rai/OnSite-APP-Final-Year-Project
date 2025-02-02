import React, { Children, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // For icons
import DateTimePicker from "react-native-ui-datepicker"; // For date picker modal
import dayjs from "dayjs"; // For date formatting
import { create_project } from "@/context/project"; // Import API function
import { router } from "expo-router";

const CreateProject = () => {
  const [startDate, setStartDate] = useState(dayjs()); // Start date state
  const [endDate, setEndDate] = useState(dayjs()); // End date state
  const [openStartPicker, setOpenStartPicker] = useState(false); // Start date picker visibility
  const [openEndPicker, setOpenEndPicker] = useState(false); // End date picker visibility
  const [loading, setLoading] = useState(false); // Loading state

  // Form State
  const [form, setForm] = useState({
    projectName: "",
    ownerName: "",
    budgetAmount: "",
    location: "",
    startDate: "",
    endDate: "",
  });

  // Handle Input Changes
  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Handle Form Submission
  const handleSubmit = async () => {
    // Validate form fields
    if (
      !form.projectName ||
      !form.ownerName ||
      !form.budgetAmount ||
      !form.location
    ) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      const result = await create_project(
        form.projectName,
        form.ownerName,
        Number(form.budgetAmount),
        form.location,
        startDate.toISOString(), 
        endDate.toISOString()
      );

      if (result?.status === 200) {
        console.log("SUCCESS");
        // router.replace("../(project)/project_home");
      } else {
        console.log("failed to create project");
        throw new Error("Failed to create project.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to create project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: "white" }}
    >
      {/* Dismiss keyboard when touching outside */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 bg-white px-4 py-4">
            {/* Project Name Input */}
            <Text className="mt-4 px-4 text-gray-600">Project Name</Text>
            <TextInput
              placeholder="Project Name"
              value={form.projectName}
              onChangeText={(text) => handleChange("projectName", text)}
              className="mt-2 border border-gray-300 rounded-md mx-4 px-4 py-4 text-gray-700"
            />

            {/* Address Input */}
            <Text className="mt-4 px-4 text-gray-600">Address</Text>
            <TextInput
              placeholder="Address"
              value={form.location}
              onChangeText={(text) => handleChange("location", text)}
              className="mt-2 border border-gray-300 rounded-md mx-4 px-4 py-4 text-gray-700"
            />

            {/* Project Value Input */}
            <Text className="mt-4 px-4 text-gray-600">Project Value</Text>
            <TextInput
              placeholder="Project Value"
              keyboardType="numeric"
              value={form.budgetAmount}
              onChangeText={(text) => handleChange("budgetAmount", text)}
              className="mt-2 border border-gray-300 rounded-md mx-4 px-4 py-4 text-gray-700"
            />

            {/* Client Name Input */}
            <Text className="mt-4 px-4 text-gray-600">Client Name</Text>
            <TextInput
              placeholder="Client Name"
              value={form.ownerName}
              onChangeText={(text) => handleChange("ownerName", text)}
              className="mt-2 border border-gray-300 rounded-md mx-4 px-4 py-4 text-gray-700"
            />

            {/* Date Pickers */}
            <View className="flex-row justify-between mt-4">
              {/* Start Date Picker */}
              <View className="flex-1 mr-2">
                <TouchableOpacity
                  className="flex-row items-center border border-gray-300 rounded-md px-4 py-4 mx-4"
                  onPress={() => setOpenStartPicker(true)}
                >
                  <Ionicons name="calendar" size={18} color="#6B7280" />
                  <Text className="ml-2 text-gray-400">
                    {startDate.format("DD/MM/YYYY")}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* End Date Picker */}
              <View className="flex-1 ml-2">
                <TouchableOpacity
                  className="flex-row items-center border border-gray-300 rounded-md px-4 py-4 mx-4"
                  onPress={() => setOpenEndPicker(true)}
                >
                  <Ionicons name="calendar" size={18} color="#6B7280" />
                  <Text className="ml-2 text-gray-400">
                    {endDate.format("DD/MM/YYYY")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Create Project Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              className={`mt-6 ${
                loading ? "bg-gray-400" : "bg-[#FCA311]"
              } rounded-md py-3`}
            >
              <Text className="text-center text-white font-semibold text-lg">
                {loading ? "Creating..." : "Create Project"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Start Date Picker Modal */}
          <Modal visible={openStartPicker} transparent animationType="slide">
            <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
              <View className="bg-white p-5 rounded-lg w-11/12">
                <Text className="mb-4 text-lg font-semibold">Select Start Date</Text>
                <DateTimePicker
                  mode="single"
                  date={startDate.toDate()}
                  onChange={(params) => {
                    if (params.date) {
                      setStartDate(dayjs(params.date));
                    }
                    setOpenStartPicker(false);
                  }}
                />
              </View>
            </View>
          </Modal>

          {/* End Date Picker Modal */}
          <Modal visible={openEndPicker} transparent animationType="slide">
            <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
              <View className="bg-white p-5 rounded-lg w-11/12">
                <Text className="mb-4 text-lg font-semibold">Select End Date</Text>
                <DateTimePicker
                  mode="single"
                  date={endDate.toDate()}
                  onChange={(params) => {
                    if (params.date) {
                      setEndDate(dayjs(params.date));
                    }
                    setOpenEndPicker(false);
                  }}
                />
              </View>
            </View>
          </Modal>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default CreateProject;

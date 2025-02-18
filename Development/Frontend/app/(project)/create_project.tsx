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
  TouchableWithoutFeedback,
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "react-native-ui-datepicker";
import dayjs from "dayjs";
// import { create_project } from "@/context/project";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import * as SecureStore from "expo-secure-store";
import apiHandler from "@/context/ApiHandler";

const CreateProject = () => {
  const [startDate, setStartDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(dayjs());
  const [openStartPicker, setOpenStartPicker] = useState(false);
  const [openEndPicker, setOpenEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);

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
  const handleStartDateChange = (date: dayjs.Dayjs) => {
    setStartDate(date);
    setForm((prev) => ({ ...prev, startDate: date.toISOString() }));
  };

  // Handle Date Change for End Date
  const handleEndDateChange = (date: dayjs.Dayjs) => {
    setEndDate(date);
    setForm((prev) => ({ ...prev, endDate: date.toISOString() }));
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
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    const token = await SecureStore.getItemAsync("AccessToken");
    try {
      setLoading(true);
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
              className={`mt-6 py-3 rounded-md mx-4 ${
                loading ? "bg-gray-400" : "bg-[#FCA311]"
              } `}
            >
              <Text className="text-center text-white font-semibold text-lg ">
                {loading ? "Creating..." : "Create Project"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Start Date Picker Modal */}
          <Modal visible={openStartPicker} transparent animationType="slide">
            <TouchableWithoutFeedback onPress={() => setOpenStartPicker(false)}>
              <View className="flex-1 justify-center items-center">
                {/* Modal Content with Border and Shadow */}
                <View className="bg-white p-5 rounded-lg w-11/12 border border-gray-300 shadow-lg">
                  <Text className="mb-4 text-lg font-semibold">
                    Select Start Date
                  </Text>
                  <DateTimePicker
                    mode="single"
                    date={startDate.toDate()}
                    onChange={(params) => {
                      if (params.date) {
                        handleStartDateChange(dayjs(params.date));
                      }
                    }}
                  />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

          <Modal visible={openEndPicker} transparent animationType="slide">
            <TouchableWithoutFeedback onPress={() => setOpenEndPicker(false)}>
              <View className="flex-1 justify-center items-center">
                {/* Modal Content with Border and Shadow */}
                <View className="bg-white p-5 rounded-lg w-11/12 border-2 border-gray-300 shadow-md">
                  <Text className="mb-4 text-lg font-semibold">
                    Select End Date
                  </Text>
                  <DateTimePicker
                    mode="single"
                    date={endDate.toDate()}
                    onChange={(params) => {
                      if (params.date) {
                        handleEndDateChange(dayjs(params.date));
                      }
                    }}
                  />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default CreateProject;

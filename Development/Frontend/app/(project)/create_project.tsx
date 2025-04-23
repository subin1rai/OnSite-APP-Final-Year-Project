import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Modal,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "react-native-ui-datepicker";
import dayjs from "dayjs";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import * as SecureStore from "expo-secure-store";
import apiHandler from "@/context/ApiHandler";
import { KeyboardTypeOptions } from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import ConstructionPredictions from "@/Components/constructionPredictions";

const FormInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = "default",
  icon,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: KeyboardTypeOptions;
  icon?: keyof typeof Ionicons.glyphMap;
}) => (
  <View className="mb-5">
    <Text className="text-gray-700 font-medium mb-2 text-base">{label}</Text>
    <View className="flex-row items-center border border-gray-200 bg-white rounded-xl px-4 py-3 shadow-sm">
      {icon && (
        <View className="mr-3">
          <Ionicons name={icon} size={20} color="#FCA311" />
        </View>
      )}
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        className="flex-1 text-gray-800 text-base"
        placeholderTextColor="#9CA3AF"
        blurOnSubmit={false}
      />
    </View>
  </View>
);

const CreateProject = () => {
  const [startDate, setStartDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(dayjs().add(30, "day"));
  const [openStartPicker, setOpenStartPicker] = useState(false);
  const [openEndPicker, setOpenEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = ["75%"];

  // Add state for prediction results
  const [predictionValue, setPredictionValue] = useState(0);
  const [buildingSummary, setBuildingSummary] = useState<{
    houseType: string;
    materialQuality: string;
    totalArea: number;
    bedrooms: number;
    bathrooms: number;
  } | null>(null);
  const [showPrediction, setShowPrediction] = useState(false);

  const totalSteps = 2;

  const [form, setForm] = useState({
    projectName: "",
    ownerName: "",
    budgetAmount: "",
    location: "",
    area: "",
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  });

  // Helper to format numbers with commas
  const formatNumber = (num: any) => {
    if (num === undefined || num === null) return "0";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Open BottomSheet
  const openBottomSheet = () => {
    setIsBottomSheetOpen(true);
    setTimeout(() => bottomSheetRef.current?.snapToIndex(0), 10);
  };

  // Close BottomSheet
  const handleClosePress = () => {
    bottomSheetRef.current?.close();
    setTimeout(() => setIsBottomSheetOpen(false), 300);
  };

  // Handle prediction results from ConstructionPredictions
  const handlePredictionComplete = (
    value: number,
    summary: {
      houseType: string;
      materialQuality: string;
      totalArea: number;
      bedrooms: number;
      bathrooms: number;
    }
  ) => {
    setPredictionValue(value);
    setBuildingSummary(summary);
    setShowPrediction(true);
    handleClosePress();
  };

  // Apply the predicted amount to the budget
  const applyToBudget = () => {
    setForm((prev) => ({
      ...prev,
      budgetAmount: predictionValue.toString(),
    }));
  };

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleStartDateChange = (date: any) => {
    setStartDate(date);
    setForm((prev) => ({ ...prev, startDate: date.toISOString() }));
    setOpenStartPicker(false);
  };

  const handleEndDateChange = (date: any) => {
    setEndDate(date);
    setForm((prev) => ({ ...prev, endDate: date.toISOString() }));
    setOpenEndPicker(false);
  };

  const validateStep1 = () => {
    if (!form.projectName || !form.location || !form.area) {
      Alert.alert(
        "Missing Information",
        "Please fill in project name, address, and area."
      );
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
      !form.area ||
      !form.startDate ||
      !form.endDate
    ) {
      Alert.alert(
        "Incomplete Form",
        "Please fill in all fields before submitting."
      );
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
          area: Number(form.area),
          startDate: form.startDate,
          endDate: form.endDate,
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        >
          <View className="px-4">
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
                <Text className="text-xl font-bold text-gray-800 mb-6">
                  Project Information
                </Text>

                <FormInput
                  label="Project Name"
                  placeholder="Enter project name"
                  value={form.projectName}
                  onChangeText={(text) => handleChange("projectName", text)}
                  icon="business"
                />

                <FormInput
                  label="Project Location"
                  placeholder="Enter project address"
                  value={form.location}
                  onChangeText={(text) => handleChange("location", text)}
                  icon="location"
                />

                <FormInput
                  label="Project Area"
                  placeholder="Enter project area in sq ft"
                  value={form.area}
                  onChangeText={(text) => handleChange("area", text)}
                  keyboardType="numeric"
                  icon="resize-outline"
                />

                <View className="mb-5">
                  <Text className="text-gray-700 font-medium mb-2 text-base">
                    Project Timeline
                  </Text>
                  <View className="flex-row justify-between">
                    <TouchableOpacity
                      className="flex-1 mr-2 flex-row items-center border border-gray-200 bg-white rounded-xl px-4 py-3 shadow-sm"
                      onPress={() => setOpenStartPicker(true)}
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color="#FCA311"
                      />
                      <View className="ml-3">
                        <Text className="text-xs text-gray-500">
                          Start Date
                        </Text>
                        <Text className="text-gray-800">
                          {startDate.format("MMM DD, YYYY")}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-1 ml-2 flex-row items-center border border-gray-200 bg-white rounded-xl px-4 py-3 shadow-sm"
                      onPress={() => setOpenEndPicker(true)}
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color="#FCA311"
                      />
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
                <Text className="text-xl font-bold text-gray-800 mb-6">
                  Client & Budget Details
                </Text>

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
                  <Text className="text-blue-800 font-medium">
                    Project Summary
                  </Text>
                  <View className="mt-2">
                    <View className="flex-row justify-between py-1">
                      <Text className="text-gray-600">Project:</Text>
                      <Text className="text-gray-800 font-medium">
                        {form.projectName}
                      </Text>
                    </View>
                    <View className="flex-row justify-between py-1">
                      <Text className="text-gray-600">Location:</Text>
                      <Text className="text-gray-800 font-medium">
                        {form.location}
                      </Text>
                    </View>
                    <View className="flex-row justify-between py-1">
                      <Text className="text-gray-600">Area:</Text>
                      <Text className="text-gray-800 font-medium">
                        {form.area} sq ft
                      </Text>
                    </View>
                    <View className="flex-row justify-between py-1">
                      <Text className="text-gray-600">Timeline:</Text>
                      <Text className="text-gray-800 font-medium">
                        {startDate.format("MMM DD")} -{" "}
                        {endDate.format("MMM DD, YYYY")}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Construction Prediction Results - Show when available */}
                {showPrediction && buildingSummary && (
                  <View className="mt-4 p-4 bg-yellow-50 rounded-xl ">
                    <View className="flex-row justify-between items-center mb-2">
                      <View className="flex-row items-center">
                        <Ionicons
                          name="calculator-outline"
                          size={18}
                          color="#D97706"
                        />
                        <Text className="text-yellow-700 font-medium ml-2">
                          Construction Cost Estimate
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => setShowPrediction(false)}
                      >
                        <Ionicons
                          name="close-circle-outline"
                          size={22}
                          color="#D97706"
                        />
                      </TouchableOpacity>
                    </View>

                    <View className="items-center  py-2 border-y border-yellow-100">
                      <Text className="text-2xl font-bold text-yellow-600">
                        {formatNumber(predictionValue)}
                      </Text>
                    </View>

                    <View className="mb-3">
                      <Text className="text-xs text-yellow-700 mb-1">
                        Based on:
                      </Text>
                      <View className="flex-row flex-wrap justify-between">
                        <View className="flex-row flex-wrap  mr-4 mb-1">
                          <Text className="text-xs text-yellow-800 font-medium">
                            Type:
                          </Text>
                          <Text className="text-xs text-yellow-700 ml-1">
                            {buildingSummary.houseType}
                          </Text>
                        </View>
                        <View className="flex-row mr-4 mb-1">
                          <Text className="text-xs text-yellow-800 font-medium">
                            Quality:
                          </Text>
                          <Text className="text-xs text-yellow-700 ml-1">
                            {buildingSummary.materialQuality}
                          </Text>
                        </View>
                        <View className="flex-row mr-4 mb-1">
                          <Text className="text-xs text-yellow-800 font-medium">
                            Total Area:
                          </Text>
                          <Text className="text-xs text-yellow-700 ml-1">
                            {buildingSummary.totalArea} sq ft
                          </Text>
                        </View>
                        <View className="flex-row mr-4 mb-1">
                          <Text className="text-xs text-yellow-800 font-medium">
                            Rooms:
                          </Text>
                          <Text className="text-xs text-yellow-700 ml-1">
                            {buildingSummary.bedrooms}B/
                            {buildingSummary.bathrooms}B
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                )}
                <TouchableOpacity
                  className="mt-4 py-3 bg-gray-100 rounded-xl border border-gray-200 flex-row justify-center items-center"
                  onPress={openBottomSheet}
                >
                  <Ionicons
                    name="calculator-outline"
                    size={20}
                    color="#4B5563"
                  />
                  <Text className="text-gray-700 font-medium ml-2">
                    {showPrediction
                      ? "Recalculate Construction Costs"
                      : "Predict Construction Costs"}{" "}
                    →
                  </Text>
                </TouchableOpacity>
              </>
            )}
            <View className="flex-row mt-6">
              {currentStep > 1 && (
                <TouchableOpacity
                  onPress={prevStep}
                  className="flex-1 mr-2 py-4 rounded-xl border border-gray-300 bg-white"
                >
                  <Text className="text-center text-gray-700 font-semibold">
                    Back
                  </Text>
                </TouchableOpacity>
              )}

              {currentStep < totalSteps ? (
                <TouchableOpacity
                  onPress={nextStep}
                  className={`flex-1 ${
                    currentStep > 1 ? "ml-2" : ""
                  } py-4 rounded-xl bg-[#FCA311]`}
                >
                  <Text className="text-center text-white font-semibold">
                    Next
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={loading}
                  className={`flex-1 ${
                    currentStep > 1 ? "ml-2" : ""
                  } py-4 rounded-xl ${
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

        {/* Date Picker Modals */}
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

        {/* BottomSheet */}
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose={true}
          onClose={handleClosePress}
          handleIndicatorStyle={{
            backgroundColor: "#999",
            width: 40,
            height: 4,
          }}
          backgroundStyle={{ backgroundColor: "#f5f5f5" }}
        >
          <BottomSheetView style={{ flex: 1 }}>
            <ConstructionPredictions
              onPredictionComplete={handlePredictionComplete}
              initialArea={form.area}
              initialLocation={form.location}
            />
          </BottomSheetView>
        </BottomSheet>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default CreateProject;

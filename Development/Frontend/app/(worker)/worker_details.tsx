import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import apiHandler from "@/context/ApiHandler";
import { useAttendanceStore } from "@/store/attendanceStore";
import * as SecureStore from "expo-secure-store";

interface AttendanceRecord {
  date: string;
  status: string;
  shifts: number;
}

interface WorkerData {
  workerId: number;
  name: string;
  designation: string;
  attendanceByMonth: { [month: string]: AttendanceRecord[] };
  salaryByMonth: { [month: string]: number };
  summaryByMonth: { [month: string]: { totalPresent: number; totalAbsent: number } };
}

const WorkerDetails = () => {
  const { selectedWorker } = useAttendanceStore();
  const workerId = selectedWorker?.id;

  const [workerData, setWorkerData] = useState<WorkerData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [months, setMonths] = useState<string[]>([]); // Store dynamic months
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(0); // Default first available month

  useEffect(() => {
    console.log("Selected Worker ID:", workerId);
    if (workerId) {
      fetchWorkerDetails();
    } else {
      console.error("Worker ID is missing");
      setLoading(false);
    }
  }, [workerId]);

  const fetchWorkerDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await SecureStore.getItemAsync("AccessToken");
      const response = await apiHandler.post(
        "/workerDetails",
        { workerId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("API Response:", response.data);

      if (!response || !response.data) {
        throw new Error("Invalid response from server");
      }

      setWorkerData(response.data);

      // Extract months dynamically from API response
      const availableMonths = Object.keys(response.data.attendanceByMonth).sort((a, b) =>
        new Date(a).getTime() - new Date(b).getTime()
      );

      setMonths(availableMonths);
      setSelectedMonthIndex(availableMonths.length - 1); // Default to latest month
      setLoading(false);
    } catch (error) {
      console.error("Error fetching worker details:", error);
      setError("Failed to load worker details. Please try again.");
      setLoading(false);
    }
  };

  const selectedMonth = months[selectedMonthIndex];

  const handlePreviousMonth = () => {
    if (selectedMonthIndex > 0) {
      setSelectedMonthIndex(selectedMonthIndex - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonthIndex < months.length - 1) {
      setSelectedMonthIndex(selectedMonthIndex + 1);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#FDB43D" />
        <Text>Loading worker details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">{error}</Text>
        <TouchableOpacity onPress={fetchWorkerDetails}>
          <Text className="text-blue-500">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!workerData || months.length === 0) {
    return (
      <View className="p-4">
        <Text className="text-lg font-bold">No Worker Data Available</Text>
      </View>
    );
  }

  const totalPresent = workerData.summaryByMonth[selectedMonth]?.totalPresent || 0;
  const totalAbsent = workerData.summaryByMonth[selectedMonth]?.totalAbsent || 0;
  const totalSalary = workerData.salaryByMonth[selectedMonth]?.toFixed(2) || "0.00";

  return (
    <SafeAreaView className="p-4  bg-white flex-1 ">
      {/* Worker Info */}
      <View className="flex-row items-center justify-between mb-4 mx-4">
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View className="items-center">
          <Text className="text-xl font-bold">{workerData.name}</Text>
          <Text className="text-md text-gray-500">{workerData.designation}</Text>
        </View>
        <Ionicons name="document-text-outline" size={24} color="black" />
      </View>

      {/* Month Selector */}
      <View className="flex-row justify-between items-center my-4 mx-4">
        <TouchableOpacity onPress={handlePreviousMonth} disabled={selectedMonthIndex === 0}>
          <Ionicons name="chevron-back" size={24} color={selectedMonthIndex === 0 ? "gray" : "black"} />
        </TouchableOpacity>
        <Text className="text-lg font-bold">{selectedMonth}</Text>
        <TouchableOpacity onPress={handleNextMonth} disabled={selectedMonthIndex === months.length - 1}>
          <Ionicons name="chevron-forward" size={24} color={selectedMonthIndex === months.length - 1 ? "gray" : "black"} />
        </TouchableOpacity>
      </View>

      {/* Attendance Summary */}
      <View className="flex-row justify-between bg-gray-100 p-3 rounded-lg mb-4 mx-4">
        <Text className="text-green-500">Present: {totalPresent}</Text>
        <Text className="text-red-500">Absent: {totalAbsent}</Text>
        <Text className="text-blue-500">Total Salary: ₹ {totalSalary}</Text>
      </View>

      {/* Attendance List */}
      <FlatList
        data={workerData.attendanceByMonth[selectedMonth] || []}
        keyExtractor={(item) => item.date}
        renderItem={({ item }) => (
          <View className="bg-gray-50 p-3 rounded-lg mb-3 shadow mx-4">
            <Text className="text-gray-500">Entry</Text>
            <View className="flex-row justify-between mt-1">
              <Text className="text-lg font-bold">
                {new Date(item.date).toLocaleDateString("en-US", {
                  day: "2-digit",
                  month: "short",
                  weekday: "short",
                })}
              </Text>
              <View className="flex-row items-center gap-2">
                <View className="px-3 py-1 rounded-md" style={{ backgroundColor: item.status === "present" ? "#D1FAE5" : "#FECACA" }}>
                  <Text className="text-green-700">{item.status}</Text>
                </View>
                <Text className="text-gray-700">{item.shifts} Shift</Text>
                <TouchableOpacity>
                  <Ionicons name="chevron-down" size={20} color="#FCA311" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default WorkerDetails;

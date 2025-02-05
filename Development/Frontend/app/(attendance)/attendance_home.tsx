import React, { useCallback, useEffect, useState } from "react";
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useProjectStore } from "@/store/projectStore";
import { single_project } from "@/context/project";
import AuthService from "@/context/AuthContext";
import { router } from "expo-router";

// Define a type for attendance records
interface AttendanceRecord {
  id: number;
  projectWorkerId: number;
  date: string; // Expected in "YYYY-MM-DD" format
  status: string; // "present" or "absent"
}

// Define a type for workers
interface Worker {
  id: number;
  name: string;
  contact: string;
  profile: string | null;
  designation: string;
  attendance: AttendanceRecord[];
}

const AttendanceHome = () => {
  const { selectedProject } = useProjectStore();
  const [date, setDate] = useState(new Date("2024-02-04")); // Default date
  const [loading, setLoading] = useState(false);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch the single project and extract its workers array from result.project.workers
  const fetchSingleProject = async () => {
    if (!selectedProject || !selectedProject.id) {
      console.warn("No selected project available.");
      return;
    }
    setLoading(true);
    try {
      console.log("Fetching Project ID:", selectedProject.id);
      const result = await single_project(selectedProject.id.toString());
      console.log("Result from single_project:", result);
      // Check if result has a project object with a workers array
      if (result && result.project && result.project.workers) {
        setWorkers(result.project.workers);
      } else {
        console.warn("No workers found in the project result.");
        setWorkers([]);
      }
    } catch (error) {
      console.error("Error fetching project:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const isExpired = await AuthService.isTokenExpired();
      if (isExpired) {
        console.log("Token expired. Redirecting to login...");
        await AuthService.removeToken();
        router.replace("/(auth)/sign_in");
        return;
      }
      await fetchSingleProject();
    } catch (error) {
      console.error("Error during refresh:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Fetch data when selectedProject is available or changes
  useEffect(() => {
    if (selectedProject) {
      fetchSingleProject();
    }
  }, [selectedProject]);

  // Helper: format date to "YYYY-MM-DD"
  const formatDate = (dateObj: Date) => {
    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const day = dateObj.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const currentDateKey = formatDate(date);

  // Placeholder for current attendance status
  const currentAttendance: { [key: number]: string } = {};

  // Change date by a given number of days
  const changeDate = (days: number) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    setDate(newDate);
  };

  // Compute attendance counts based on the current date
  const presentCount = workers.filter((worker) =>
    worker.attendance.some(
      (record) =>
        record.date === currentDateKey && record.status.toLowerCase() === "present"
    )
  ).length;

  const absentCount = workers.filter((worker) =>
    worker.attendance.some(
      (record) =>
        record.date === currentDateKey && record.status.toLowerCase() === "absent"
    )
  ).length;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header with date changer */}
      <View className="flex-row justify-between p-4">
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons
            name="chevron-back"
            size={24}
            color="#FCA311"
            onPress={() => changeDate(-1)}
          />
          <View className="flex items-center py-2 px-4 rounded-lg bg-[#FEEDCF]">
            <Text className="text-2xl font-bold">{date.getDate()}</Text>
            <Text className="text-2xl font-bold">
              {date
                .toLocaleString("default", { month: "short" })
                .toUpperCase()}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={24}
            color="#FCA311"
            onPress={() => changeDate(1)}
          />
        </View>
        <View className="flex justify-end items-end gap-2">
          <Text className="text-green-600 text-2xl font-semibold">
            {presentCount} Present
          </Text>
          <View className="flex-row gap-2 items-center">
            <View className="w-4 h-4 bg-red-400 rounded-sm" />
            <Text className="text-red-500 text-lg">{absentCount} Absent</Text>
          </View>
        </View>
      </View>

      {/* Add Worker Section */}
      <View className="border-b border-gray-300 mx-4" />
      <TouchableOpacity className="flex-row justify-between">
        <View />
        <TouchableOpacity
          className="flex-row items-center p-4 gap-2"
          onPress={() => {
            console.log(selectedProject);
          }}
        >
          <Ionicons name="add" size={24} color="#FDB43D" />
          <Text
            className="text-lg font-medium"
            style={{ color: "#FDB43D" }}
          >
            Add Worker
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
      <View className="border-b border-gray-300 mx-4" />

      {/* Workers Heading */}
      <Text className="font-bold text-2xl px-4 py-2">Workers</Text>

      {/* Worker List */}
      <FlatList
        data={workers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          // Get current attendance status for this worker (defaulting to "Unmarked")
          const status = currentAttendance[item.id] || "Unmarked";
          return (
            <View>
              <View className="flex-row items-center justify-between px-4 mt-2">
                <View className="flex-row items-center gap-2">
                  <View className="w-8 h-8 bg-red-400 rounded-full" />
                  <View className="flex-row items-center">
                    <Text>{item.name}</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={24}
                      color="#FDB43D"
                    />
                  </View>
                </View>
                <Text>1.0 Shift</Text>
              </View>

              <View className="px-4 py-2 flex-row items-center justify-between">
                <Text className="text-xl">{item.designation}</Text>
                <View className="flex-row items-center gap-2">
                  <TouchableOpacity
                    className="border px-4 py-2 rounded-md"
                    style={{ borderColor: "#C2C2C2" }}
                  >
                    <Text>Present</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="border px-4 py-2 rounded-md"
                    style={{ borderColor: "#C2C2C2" }}
                  >
                    <Text>Absent</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="border rounded-md"
                    style={{ borderColor: "#C2C2C2", padding: 4 }}
                  >
                    <Ionicons
                      name="chevron-down"
                      size={20}
                      color="#FCA311"
                      onPress={() => changeDate(1)}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <View className="border-b border-gray-300 mx-4" />
            </View>
          );
        }}
         refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor="#FCA311"
                    colors={["#FCA311"]}
                  />
                }
      />
    </SafeAreaView>
  );
};

export default AttendanceHome;
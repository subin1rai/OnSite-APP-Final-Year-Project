import React, { useCallback, useEffect, useState } from "react";
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useProjectStore } from "@/store/projectStore";
import { single_project } from "@/context/project";
import AuthService from "@/context/AuthContext";
import { router } from "expo-router";
import apiHandler from "@/context/ApiHandler";

interface AttendanceRecord {
  id: number;
  projectWorkerId: number;
  date: string;
  status: string;
}

interface Worker {
  id: number;
  name: string;
  contact: string;
  profile: string | null;
  designation: string;
  projectWorkerId: number;
  attendance: AttendanceRecord[];
}

const AttendanceHome = () => {
  const { selectedProject } = useProjectStore();
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSingleProject = async () => {
    if (!selectedProject?.id) {
      console.warn("No selected project available.");
      return;
    }
    setLoading(true);
    try {
      const result = await single_project(selectedProject.id.toString());
      if (result?.project?.worker) {
        setWorkers(result.project.worker);
      } else {
        setWorkers([]);
      }
    } catch (error) {
      console.error("Error fetching project:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateObj: Date) => {
    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const day = dateObj.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const recordAttendance = async (projectWorkerId: number, status: string) => {
    try {
      console.log("Recording attendance:", projectWorkerId, status);
  
      // ✅ Optimistic UI update before hitting API
      setWorkers((prevWorkers) =>
        prevWorkers.map((worker) =>
          worker.projectWorkerId === projectWorkerId
            ? {
                ...worker,
                attendance: worker.attendance.some(
                  (a) => formatDate(new Date(a.date)) === formatDate(date)
                )
                  ? worker.attendance.map((a) =>
                      formatDate(new Date(a.date)) === formatDate(date)
                        ? { ...a, status } // ✅ Update existing attendance record
                        : a
                    )
                  : [...worker.attendance, { id: Date.now(), projectWorkerId, date: formatDate(date), status }], // ✅ Add new record
              }
            : worker
        )
      );
  
      // ✅ Send API request to update attendance
      const response = await apiHandler.post(
        "/attendance",
        {
          id: projectWorkerId,
          date: formatDate(date),
          status,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      if (!response) {
        throw new Error("Failed to record attendance");
      }
  
      console.log("Attendance recorded successfully");
  
      // ✅ Fetch the latest attendance immediately after the API call
      await fetchSingleProject();
    } catch (error) {
      console.error("Error recording attendance:", error);
      Alert.alert("Error", "Failed to record attendance");
    }
  };
  
  
  const getAttendanceStatus = (worker: Worker) => {
    const currentDateStr = formatDate(date);
    const todayAttendance = worker.attendance.find(
      (a) => formatDate(new Date(a.date)) === currentDateStr
    );
    return todayAttendance?.status || "unmarked"; // ✅ Show the latest status
  };
  

  const getPresentCount = useCallback(() => {
    const currentDateStr = formatDate(date);
    return workers.reduce((count, worker) => {
      const isPresent = worker.attendance.some(
        (a) =>
          formatDate(new Date(a.date)) === currentDateStr &&
          a.status === "present"
      );
      return isPresent ? count + 1 : count;
    }, 0);
  }, [workers, date, formatDate]);

  const getAbsentCount = useCallback(() => {
    const currentDateStr = formatDate(date);
    return workers.reduce((count, worker) => {
      const isAbsent = worker.attendance.some(
        (a) =>
          formatDate(new Date(a.date)) === currentDateStr &&
          a.status === "absent"
      );
      return isAbsent ? count + 1 : count;
    }, 0);
  }, [workers, date, formatDate]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const isExpired = await AuthService.isTokenExpired();
      if (isExpired) {
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

  useEffect(() => {
    if (selectedProject) {
      fetchSingleProject();
      onRefresh();
    }
  }, [selectedProject]);

  const changeDate = (days: number) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    setDate(newDate);
  };

  const renderWorker = ({ item }: { item: Worker }) => {
    const status = getAttendanceStatus(item);
    
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
              disabled={loading}
              className={`border px-4 py-2 rounded-md ${
                status === "present" ? "bg-green-100" : ""
              }`}
              style={{ borderColor: "#C2C2C2" }}
              onPress={() => recordAttendance(item.projectWorkerId, "present")}
            >
              <Text>Present</Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={loading}
              className={`border px-4 py-2 rounded-md ${
                status === "absent" ? "bg-red-100" : ""
              }`}
              style={{ borderColor: "#C2C2C2" }}
              onPress={() => recordAttendance(item.projectWorkerId, "absent")}
            >
              <Text>Absent</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="border rounded-md"
              style={{ borderColor: "#C2C2C2", padding: 4 }}
            >
              <Ionicons name="chevron-down" size={20} color="#FCA311" />
            </TouchableOpacity>
          </View>
        </View>
        <View className="border-b border-gray-300 mx-4" />
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
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
              {date.toLocaleString("default", { month: "short" }).toUpperCase()}
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
            {getPresentCount()} Present
          </Text>
          <View className="flex-row gap-2 items-center">
            <View className="w-4 h-4 bg-red-400 rounded-sm" />
            <Text className="text-red-500 text-lg">
              {getAbsentCount()} Absent
            </Text>
          </View>
        </View>
      </View>

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
          <Text className="text-lg font-medium" style={{ color: "#FDB43D" }}>
            Add Worker
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
      <View className="border-b border-gray-300 mx-4" />

      <Text className="font-bold text-2xl px-4 py-2">Workers</Text>

      <FlatList
        data={workers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderWorker}
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
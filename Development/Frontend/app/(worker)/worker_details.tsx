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
import { useProjectStore } from "@/store/projectStore";
import WebView from "react-native-webview";
import { useRouter } from "expo-router"; // ✅ Use expo-router

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
  summaryByMonth: {
    [month: string]: { totalPresent: number; totalAbsent: number };
  };
}

const WorkerDetails = () => {
  const { selectedWorker } = useAttendanceStore();
  const { selectedProject } = useProjectStore();
  const [workerData, setWorkerData] = useState<WorkerData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [months, setMonths] = useState<string[]>([]);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(0);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null); // ✅ WebView State

  const projectId = selectedProject?.id;
  const workerId = selectedWorker?.id;
  const router = useRouter(); // ✅ Use expo-router

  useEffect(() => {
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
        { workerId, projectId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response || !response.data) {
        throw new Error("Invalid response from server");
      }

      setWorkerData(response.data);

      // Extract months dynamically from API response
      const availableMonths = Object.keys(response.data.attendanceByMonth).sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime()
      );

      setMonths(availableMonths);
      setSelectedMonthIndex(availableMonths.length - 1);
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

  if (!workerData || months.length === 0) {
    return (
      <View className="p-4 m-auto">
        <Text className="text-lg font-bold">No Worker Data Available</Text>
      </View>
    );
  }

  const totalPresent =
    workerData.summaryByMonth[selectedMonth]?.totalPresent || 0;
  const totalAbsent =
    workerData.summaryByMonth[selectedMonth]?.totalAbsent || 0;
  const totalSalary =
    workerData.salaryByMonth[selectedMonth]?.toFixed(2) || "0.00";

  // **🔹 Make Payment Function**
  const makePayment = async () => {
    try {
      const response = await apiHandler.post(
        "/initialize-khalti",
        {
          workerId,
          projectId,
          totalSalary,
          selectedMonth,
          selectedYear: new Date().getFullYear(), // ✅ Ensure Year is included
          website_url: "http://localhost:3099",
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data.success) {
        setPaymentUrl(response.data.payment.payment_url); // ✅ Open Khalti WebView
      } else {
        console.error("Payment Initialization Failed", response.data);
      }
    } catch (error) {
      console.error("Error making payment:", error);
    }
  };

  // **🔹 Handle WebView Navigation Changes**
  const handleWebViewNavigation = (navState: any) => {
    if (navState.url.includes("localhost:3099")) {
      setPaymentUrl(null); // ✅ Close WebView after payment
      fetchWorkerDetails(); // ✅ Refresh Data
      router.replace("/(worker)/worker_details"); // ✅ Redirect to workers list after payment
    }
  };

  // **🔹 Render WebView for Khalti Payment**
  if (paymentUrl) {
    return (
      <WebView
        source={{ uri: paymentUrl }}
        onNavigationStateChange={handleWebViewNavigation}
      />
    );
  }

  return (
    <SafeAreaView className="p-4 bg-white flex-1">
      {/* Worker Info */}
      <View className="flex-row items-center justify-between mb-4 mx-4">
        <TouchableOpacity onPress={() => router.back()}> {/* ✅ Use router.back() */}
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View className="items-center">
          <Text className="text-xl font-bold">{workerData.name}</Text>
          <Text className="text-md text-gray-500">
            {workerData.designation}
          </Text>
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

      {/* Payment Button */}
      <View className="mx-4">
        <TouchableOpacity onPress={makePayment} className="w-full items-center p-4 bg-[#FCAC29] rounded-lg">
          <Text className=" font-semibold text-xl text-white">Make Payment</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default WorkerDetails;

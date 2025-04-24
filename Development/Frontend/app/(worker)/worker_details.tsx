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
import { useRouter } from "expo-router"; 

/**
 * @information Only show payment button when the list has exactly 30 attendance records
 * This is to ensure payments are only processed for complete monthly data
 */

const getCurrentMonthYear = () => {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0"); 
  const year = date.getFullYear();
  return { month, year };
};

interface AttendanceRecord {
  date: string;
  status: string;
  shifts: number;
  paymentStatus: string;
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
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false); 
  const router = useRouter(); 

  const projectId = selectedProject?.id;
  const workerId = selectedWorker?.id;

  useEffect(() => {
    const { month, year } = getCurrentMonthYear();
    setSelectedMonthIndex(months.indexOf(`${year}-${month}`) || 0); 
  }, []);

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

  // ✅ Month Name to MM Format Mapping
  const monthMap: { [key: string]: string } = {
    "January": "01",
    "February": "02",
    "March": "03",
    "April": "04",
    "May": "05",
    "June": "06",
    "July": "07",
    "August": "08",
    "September": "09",
    "October": "10",
    "November": "11",
    "December": "12",
  };

  
  const makePayment = async () => {
    try {
      console.log("📢 Payment button clicked");
      console.log("🛠 Worker ID:", workerId);
      console.log("🛠 Project ID:", projectId);
      console.log("🛠 Selected Month (Before Fix):", selectedMonth);
      console.log("🛠 Total Salary:", workerData?.salaryByMonth[selectedMonth]);

      if (!workerId || !projectId || !selectedMonth || !workerData) {
        console.error("🚨 Missing required fields for payment!");
        return;
      }

      const totalSalary = workerData.salaryByMonth[selectedMonth] || 0;
      const [year, monthName] = selectedMonth.split("-");
      const fixedMonth = monthMap[monthName] || "01";

      console.log("🛠 Fixed Month:", fixedMonth);

      const response = await apiHandler.post(
        "/initialize-khalti",
        {
          workerId,
          projectId,      
          totalSalary,
          month: fixedMonth,
          year: parseInt(year),
          website_url: "https://21b5-2001-df7-be80-3a7a-fc8b-13b0-a5f6-94d6.ngrok-free.app",
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log("✅ API Response:", response.data);

      if (response.data.success) {
        setPaymentUrl(response.data.payment.payment_url);
        console.log("🔗 Opening Payment URL:", response.data.payment.payment_url);
      } else {
        console.error("🚨 Payment Initialization Failed", response.data);
      }
    } catch (error) {
      console.error("❌ Error making payment:", error);
    }
  };

  // ✅ WebView Navigation Handler
  const handleWebViewNavigation = (navState: any) => {
    if (navState.url.includes("localhost:3098")) {
      setPaymentUrl(null);
      setPaymentSuccess(true);
      fetchWorkerDetails(); 
    }
  };

  
  if (paymentSuccess) {
    return (
      <SafeAreaView className="p-4 bg-white flex-1 items-center justify-center">
        <Ionicons name="checkmark-circle-outline" size={64} color="green" />
        <Text className="text-2xl font-bold text-green-600 mt-4">
          Payment Successful!
        </Text>
        <Text className="text-md text-gray-500 mt-2">
          Your payment has been processed successfully.
        </Text>
        <TouchableOpacity
          onPress={() => {
            setPaymentSuccess(false);
            fetchWorkerDetails();
          }}
          className="mt-6 p-4 bg-[#FCAC29] rounded-lg"
        >
          <Text className="font-semibold text-xl text-white">Back to Worker Details</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  
  if (paymentUrl) {
    return (
      <WebView source={{ uri: paymentUrl }} onNavigationStateChange={handleWebViewNavigation} />
    );
  }

  // Check if there are exactly 30 attendance records for the selected month
  const attendanceRecords = workerData?.attendanceByMonth[selectedMonth] || [];
  const hasThirtyRecords = attendanceRecords.length === 30;

  return (
    <SafeAreaView className="p-4 bg-white flex-1">
      {/* Worker Info */}
      <View className="flex-row items-center justify-between mb-4 mx-4">
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View className="items-center">
          <Text className="text-xl font-bold">{workerData?.name}</Text>
          <Text className="text-md text-gray-500">
            {workerData?.designation}
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

      {/* Summary Section */}
      <View className="flex-row justify-between bg-gray-100 p-4 rounded-lg mb-4 mx-4">
        <Text className="text-green-500">Present: {workerData?.summaryByMonth[selectedMonth]?.totalPresent || 0}</Text>
        <Text className="text-red-500">Absent: {workerData?.summaryByMonth[selectedMonth]?.totalAbsent || 0}</Text>
        <Text className="text-blue-500">Total Salary: ₹ {workerData?.salaryByMonth[selectedMonth]?.toFixed(2) || "0.00"}</Text>
      </View>

      {/* Records Count Indicator */}
      <View className="mx-4 mb-2">
        <Text className="text-gray-500 text-center">
          {attendanceRecords.length} days recorded {hasThirtyRecords ? '(Complete month)' : '(Incomplete month)'}
        </Text>
      </View>

      {/* Attendance List */}
      <FlatList
        data={attendanceRecords}
        keyExtractor={(item) => item.date}
        renderItem={({ item }) => (
          <View className="bg-gray-100 p-3 rounded-lg mb-3 mx-4">
            <View className="flex-row justify-between mt-1">
              <View>
                <Text className="text-gray-500">Date</Text>
                <Text className="text-lg font-bold">
                  {new Date(item.date).toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "short",
                    weekday: "short",
                  })}
                </Text>
                <View className="flex-row mt-2 items-center gap-2">
                  <Text className="text-gray-700">Payment:</Text>
                  <Text className="p-1 bg-[#FCA311] rounded-md px-3 PY-2 text-lg font-medium text-white">
                    {item.paymentStatus}
                  </Text>
                </View>
              </View>
              <View className="flex items-center gap-2">
                <Text className="text-gray-700">{item.shifts} Shift</Text>
                <View
                  className="px-3 py-1 rounded-md"
                  style={{
                    backgroundColor:
                      item.status === "present" ? "#D1FAE5" : "#FECACA",
                  }}
                >
                  <Text
                    className={
                      item.status === "present"
                        ? "text-green-700"
                        : "text-red-700"
                    }
                  >
                    {item.status}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      />

      {/* Payment Button - Only show if there are exactly 30 records and at least one is pending */}
      <View className="mx-4">
        {hasThirtyRecords && 
         attendanceRecords.some(record => record.paymentStatus === "pending") && (
          <TouchableOpacity 
            onPress={makePayment} 
            className="w-full items-center p-4 bg-[#FCAC29] rounded-lg"
          >
            <Text className="font-semibold text-xl text-white">Make Payment</Text>
          </TouchableOpacity>
        )}
        
        {/* Show info message when payment not available */}
        {!hasThirtyRecords && attendanceRecords.some(record => record.paymentStatus === "pending") && (
          <View className="p-3 bg-gray-100 rounded-lg items-center">
            <Text className="text-gray-600">
              Payment available only for complete months (30 days)
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default WorkerDetails;
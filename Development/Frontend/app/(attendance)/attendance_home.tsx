import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useProjectStore } from "@/store/projectStore";
import { router } from "expo-router";
import AuthService from "@/context/AuthContext";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import AddWorkers from "@/Components/AddWorkers";
import { images } from "@/constants";
import UpdateWorkerSheet from "@/Components/UpdateWorkerSheet";
import { useAttendanceStore, AttendanceRecord, Worker } from "@/store/attendanceStore";
import apiHandler from "@/context/ApiHandler";

const AttendanceHome = () => {
  const { selectedProject } = useProjectStore();
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { workers, fetchWorkers,setSelectedWorker} = useAttendanceStore();
  const [isAddWorkerSheetOpen, setIsAddWorkerSheetOpen] = useState(false);
  const [isUpdateWorkerSheetOpen, setIsUpdateWorkerSheetOpen] = useState(false);
  const snapPoints = ["50%", "70%"];
  const snapPoint = ["40%"];
  const addWorkerSheetRef = useRef<BottomSheet>(null);
  const updateWorkerSheetRef = useRef<BottomSheet>(null);

  const handleAddWorkerOpen = useCallback(() => {
    if (!isAddWorkerSheetOpen) {
      addWorkerSheetRef.current?.expand();
      setIsAddWorkerSheetOpen(true);
    }
  }, [isAddWorkerSheetOpen]);

  const handleAddWorkerClose = () => {
    addWorkerSheetRef.current?.close();
    setIsAddWorkerSheetOpen(false);
  };

  const handleUpdateWorkerOpen = useCallback(() => {
    if (!isUpdateWorkerSheetOpen) {
      updateWorkerSheetRef.current?.expand();
      setIsUpdateWorkerSheetOpen(true);
    }
  }, [isUpdateWorkerSheetOpen]);

  const handleUpdateWorkerClose = () => {
    updateWorkerSheetRef.current?.close();
    setIsUpdateWorkerSheetOpen(false);
  };

  const formatDate = (dateObj: Date) => {
    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const day = dateObj.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const recordAttendance = async (projectWorkerId: number, status: string) => {
    try {
      const response = await apiHandler.post(
        "/attendance",
        {
          id: projectWorkerId,
          date: formatDate(date),
          status,
        },
        { headers: { "Content-Type": "application/json" } }
      );
      if (!response) throw new Error("Failed to record attendance");
      await fetchWorkers();
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
    return todayAttendance?.status || "unmarked";
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
  }, [workers, date]);

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
  }, [workers, date]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const isExpired = await AuthService.isTokenExpired();
      if (isExpired) {
        await AuthService.removeToken();
        router.replace("/(auth)/sign_in");
        return;
      }
      await fetchWorkers();
    } catch (error) {
      console.error("Error during refresh:", error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchWorkers]);

  useEffect(() => {
    if (selectedProject) {
      fetchWorkers();
      setIsAddWorkerSheetOpen(false);
      setIsUpdateWorkerSheetOpen(false);
      onRefresh();
    }
  }, [selectedProject]);

  const changeDate = (days: number) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    setDate(newDate);
  };

  const handleWorkerClick = (selectedWorker: Worker) => {
    useAttendanceStore.getState().setSelectedWorker(selectedWorker);
    handleUpdateWorkerOpen();
  };
  const setWorkerClick =(worker: Worker) => {
    setSelectedWorker(worker); 
    router.push("/(worker)/worker_details");
  };
  

  const renderWorker = ({ item }: { item: Worker }) => {
    const status = getAttendanceStatus(item);
    
    const todayAttendanceRecord = item.attendance.find(
      (att) => formatDate(new Date(att.date)) === formatDate(date)
    );

    return (
      <View>
        <View className="flex-row items-center justify-between px-4 mt-2">
          <TouchableOpacity className="flex-row items-center gap-2"   onPress={() => setWorkerClick(item)} >
            <View>
              <Image
                className="w-8 h-8 rounded-full"
                source={item.profile ? { uri: item.profile } : images.imageProfile}
              />
            </View>
            <View className="flex-row items-center">
              <Text>{item.name}</Text>
              <Ionicons name="chevron-forward" size={24} color="#FDB43D"/>
            </View>
          </TouchableOpacity>
          {todayAttendanceRecord && (
            <Text>{todayAttendanceRecord.shifts} Shift(s)</Text>
          )}
        </View>

        <View className="px-4 py-2 flex-row items-center justify-between">
          <Text className="text-xl">{item.designation}</Text>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              disabled={loading}
              className={`border px-4 py-2 rounded-md ${status === "present" ? "bg-green-100" : ""}`}
              style={{ borderColor: "#C2C2C2" }}
              onPress={() => recordAttendance(item.projectWorkerId, "present")}
            >
              <Text>Present</Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={loading}
              className={`border px-4 py-2 rounded-md ${status === "absent" ? "bg-red-100" : ""}`}
              style={{ borderColor: "#C2C2C2" }}
              onPress={() => recordAttendance(item.projectWorkerId, "absent")}
            >
              <Text>Absent</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="border rounded-md p-1"
              style={{ borderColor: "#C2C2C2" }}
              onPress={() => handleWorkerClick(item)}
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
    <SafeAreaView className="flex-1 bg-white z-0">
      {(isAddWorkerSheetOpen || isUpdateWorkerSheetOpen) && (
        <View
          className="absolute inset-0 bg-black/50 z-10"
          onTouchStart={() => {
            if (isAddWorkerSheetOpen) handleAddWorkerClose();
            if (isUpdateWorkerSheetOpen) handleUpdateWorkerClose();
          }}
        />
      )}

      <View className="flex-row justify-between p-4">
        <View className="flex-row items-center">
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
            <Text className="text-red-500 text-lg">{getAbsentCount()} Absent</Text>
          </View>
        </View>
      </View>

      <View className="border-b border-gray-300 mx-4" />
      <TouchableOpacity className="flex-row justify-between">
        <View />
        <TouchableOpacity
          className="flex-row items-center p-4 gap-2"
          onPress={handleAddWorkerOpen}
        >
          <Ionicons name="add" size={24} color="#FDB43D" />
          <Text className="text-lg font-medium text-[#FDB43D]">Add Worker</Text>
        </TouchableOpacity>
      </TouchableOpacity>
      <View className="border-b border-gray-300 mx-4" />
      <Text className="font-bold text-2xl px-4 py-2">Workers</Text>
      <FlatList
        data={workers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderWorker}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FCA311" colors={["#FCA311"]} />
        }
      />

      {/* Add Worker Bottom Sheet */}
      <BottomSheet
        ref={addWorkerSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        onClose={handleAddWorkerClose}
        containerStyle={{ zIndex: 20 }}
      >
        <BottomSheetView>
          {isAddWorkerSheetOpen && <AddWorkers handleAddWorkerClose={handleAddWorkerClose} />}
        </BottomSheetView>
      </BottomSheet>

      {/* Update Worker Bottom Sheet */}
      <BottomSheet
        ref={updateWorkerSheetRef}
        index={-1}
        snapPoints={snapPoint}
        enablePanDownToClose={true}
        onClose={handleUpdateWorkerClose}
        containerStyle={{ zIndex: 20 }}
      >
        <BottomSheetView>
          {isUpdateWorkerSheetOpen && <UpdateWorkerSheet onClose={handleUpdateWorkerClose} />}
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
};

export default AttendanceHome;

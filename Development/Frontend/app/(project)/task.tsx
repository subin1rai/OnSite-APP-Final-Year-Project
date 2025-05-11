import React, { useEffect, useRef, useState } from "react";
import {FlatList,SafeAreaView,Text,TouchableOpacity,View,Pressable,StatusBar,Platform,ActivityIndicator,Alert,Modal} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AddTask from "@/Components/AddTask";
import { useProjectStore } from "@/store/projectStore";
import apiHandler from "@/context/ApiHandler";
import { useTaskStore } from "@/store/taskStore";

interface TaskType {
  id: number;
  name: string;
  description: string;
  status: string;
  createdAt?: string;
}

interface TaskStore {
  tasks: TaskType[];
  setTasks: (tasks: TaskType[]) => void;
  projectProgress: number;
  setProjectProgress: (progress: number) => void;
}

const TaskScreen = () => {
  const { selectedProject } = useProjectStore();
  // const [tasks, setTasks] = useState<TaskType[]>([]);
  const { tasks, setTasks } = useTaskStore();
  const [searchText, setSearchText] = useState("");
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const swipeableRefs = useRef<Map<number, Swipeable>>(new Map());
  const snapPoints = ["75%"];

  const statusOptions = [
    { key: "inProgress", label: "In Progress", color: "bg-[#FEF3C7] text-[#92400E]" },
    { key: "Delayed", label: "Delayed", color: "bg-[#FEE2E2] text-[#991B1B]" },
    { key: "Completed", label: "Completed", color: "bg-green-50 text-green-600" },
    { key: "pending", label: "Pending", color: "bg-blue-50 text-blue-600" }
  ];

  const fetchTasks = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const res = await apiHandler.post("/task", {
        projectId: selectedProject?.id,
      });
  
      const sortedTasks = (res.data || []).sort(
        (a: TaskType, b: TaskType) =>
          new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime()
      );
  
  
      setTasks(sortedTasks); 
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    if (selectedProject?.id) fetchTasks();
  }, [selectedProject]);

  const openBottomSheet = (task?: TaskType) => {
    if (task) {
      setSelectedTask(task);
      setIsEditing(true);
    } else {
      setSelectedTask(null);
      setIsEditing(false);
    }
    setIsBottomSheetOpen(true);
    setTimeout(() => bottomSheetRef.current?.snapToIndex(0), 10);
  };

  const handleClosePress = () => {
    bottomSheetRef.current?.close();
    setTimeout(() => {
      setIsBottomSheetOpen(false);
      setSelectedTask(null);
      setIsEditing(false);
    }, 300);
  };

  const handleTaskAdded = () => {
    handleClosePress();
    fetchTasks();
  };

  const handleRefresh = () => {
    swipeableRefs.current.forEach((ref) => ref.close());
    
    setRefreshing(true);
    fetchTasks(false);
  };

  const handleDeleteTask = async (taskId: number) => {
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await apiHandler.delete(`/task/${taskId}`);
              fetchTasks();
            } catch (err) {
              console.error("Failed to delete task", err);
              Alert.alert("Error", "Failed to delete task. Please try again.");
            }
          },
        },
      ]
    );
  };

  const openStatusModal = (task: TaskType) => {
    setSelectedTask(task);
    setStatusModalVisible(true);
  };

  const updateTaskStatus = async (status: string) => {
    if (!selectedTask) return;
    
    try {
      await apiHandler.put(`/task/${selectedTask.id}`, {
        ...selectedTask,
        status: status
      });
      setStatusModalVisible(false);
      fetchTasks();
    } catch (err) {
      console.error("Failed to update task status", err);
      Alert.alert("Error", "Failed to update task status. Please try again.");
    }
  };

  const filteredTasks = (tasks || []).filter((task) =>
    task.name?.toLowerCase().includes(searchText.toLowerCase())
  );
  

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-50 text-green-600';
      case 'inProgress':
        return 'bg-[#FEF3C7] text-[#92400E]';
      case 'pending':
        return 'bg-blue-50 text-blue-600';
      case 'Delayed':
        return 'bg-[#FEE2E2] text-[#991B1B]';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  const renderRightActions = (task: TaskType, progress: any) => {
    return (
      <View className="flex-row">
        {/* Status button */}
        <TouchableOpacity
          className="bg-purple-50 justify-center items-center px-4"
          onPress={() => {
            const ref = swipeableRefs.current.get(task.id);
            if (ref) ref.close();
            openStatusModal(task);
          }}
        >
          <Ionicons name="ellipsis-horizontal-circle-outline" size={22} color="#8B5CF6" />
          <Text className="text-purple-500 text-xs mt-1">Status</Text>
        </TouchableOpacity>
        
        {/* Delete button */}
        <TouchableOpacity
          className="bg-red-50 justify-center items-center px-4"
          onPress={() => {
            const ref = swipeableRefs.current.get(task.id);
            if (ref) ref.close();
            handleDeleteTask(task.id);
          }}
        >
          <Ionicons name="trash-outline" size={22} color="#EF4444" />
          <Text className="text-red-500 text-xs mt-1">Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderTaskItem = ({ item }: { item: TaskType }) => {
    return (
      <Swipeable
        ref={(ref) => {
          if (ref) swipeableRefs.current.set(item.id, ref);
          else swipeableRefs.current.delete(item.id);
        }}
        renderRightActions={(progress) => renderRightActions(item, progress)}
        overshootRight={false}
      >
        <TouchableOpacity
          className="py-4 px-5 bg-white border-l-4 border-[#ffb133] rounded-sm"
          style={{ borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}
         
        >
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-lg font-medium text-gray-800 flex-1 pr-2">
              {item.name}
            </Text>
            <Text className={`text-xs px-3 py-1 rounded-full ${getStatusColor(item.status)}`}>
              {item.status}
            </Text>
          </View>
          <Text className="text-sm text-gray-500">{item.description}</Text>
          {item.createdAt && (
            <Text className="text-xs text-gray-400 mt-2">
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          )}
        </TouchableOpacity>
      </Swipeable>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="flex-1 bg-white">
        <SafeAreaView className="bg-[#ffb133]">
          <View
            className="bg-[#ffb133] flex-row justify-between mt-16 items-center px-4 pb-[10px]"
            style={{
              marginTop: Platform.OS === "ios" ? 60 : StatusBar.currentHeight,
            }}
          >
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-2xl font-medium tracking-widest">
              Task
            </Text>
            <TouchableOpacity onPress={() => openBottomSheet()}>
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Task List */}
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#ffb133" />
          </View>
        ) : (
          <FlatList
            data={filteredTasks}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, paddingTop: 8 }}
            ItemSeparatorComponent={() => <View className="h-3" />}
            renderItem={renderTaskItem}
            ListEmptyComponent={() => (
              <View className="flex-1 justify-center items-center py-16">
                <Ionicons name="list-outline" size={44} color="#e5e7eb" />
                <Text className="text-center text-gray-400 mt-4">
                  No tasks found.
                </Text>
                <TouchableOpacity 
                  className="mt-5 py-3 px-5 border border-[#ffb133]" 
                  onPress={() => openBottomSheet()}
                >
                  <Text className="text-[#ffb133] font-medium">Add New Task</Text>
                </TouchableOpacity>
              </View>
            )}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        )}


        {/* Status Update Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={statusModalVisible}
          onRequestClose={() => setStatusModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-white rounded-lg w-4/5 p-5">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-medium text-gray-800">Update Status</Text>
                <TouchableOpacity onPress={() => setStatusModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              <Text className="text-sm text-gray-500 mb-4">
                Select a status for "{selectedTask?.name}"
              </Text>
              
              <View className="space-y-2">
                {statusOptions.map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    className={`p-3 rounded-lg border mt-4 ${
                      selectedTask?.status === option.key 
                        ? 'border-[#ffb133] bg-amber-50' 
                        : 'border-gray-200'
                    }`}
                    onPress={() => updateTaskStatus(option.key)}
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className="font-medium text-gray-800">{option.label}</Text>
                      <Text className={`text-xs px-2 py-1 rounded-full ${option.color}`}>
                        {option.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
              
              <TouchableOpacity 
                className="mt-4 py-3 bg-[#ffb133] rounded-lg items-center"
                onPress={() => setStatusModalVisible(false)}
              >
                <Text className="text-white font-medium">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Dim Background BottomSheet */}
        {isBottomSheetOpen && (
          <Pressable
            className="absolute top-0 left-0 w-full h-full bg-black opacity-50"
            onPress={handleClosePress}
          />
        )}

        {/* BottomSheet */}
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose={true}
          onClose={handleClosePress}
          handleIndicatorStyle={{ backgroundColor: '#d1d5db', width: 40 }}
          backgroundStyle={{ backgroundColor: '#fff' }}
        >
          <BottomSheetView>
            <View className="px-5 pt-2 pb-2">
              <View className="flex-row justify-between items-center mb-6 mt-2">
                <Text className="text-xl font-medium text-gray-800">
                   Add New Task
                </Text>
                <TouchableOpacity 
                  className="p-1 rounded-full" 
                  onPress={handleClosePress}
                >
                  <Ionicons name="close" size={22} color="#666" />
                </TouchableOpacity>
              </View>
              <AddTask 
                onWorkerAdded={handleTaskAdded} 
              />
            </View>
          </BottomSheetView>
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
};

export default TaskScreen;
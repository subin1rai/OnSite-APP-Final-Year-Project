import React, { useEffect, useRef, useState } from "react";
import { 
  FlatList, 
  SafeAreaView, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View, 
  Pressable, 
  StatusBar, 
  Platform, 
  Image,
  ActivityIndicator,
  Modal
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import MainWorker from "@/Components/MainWorker";
import { useWorkerStore } from "@/store/workerStore";
import { router } from "expo-router";
import { Swipeable } from "react-native-gesture-handler";
import apiHandler from "@/context/ApiHandler";
import SuccessModal from "@/Components/SuccessModel";
import ErrorModal from "@/Components/ErrorModel";

const WorkerList = () => {
  const { workers, fetchWorkers, removeWorker } = useWorkerStore();
  const [searchText, setSearchText] = useState<string>("");
  const [filteredWorkers, setFilteredWorkers] = useState(workers);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [workerToDelete, setWorkerToDelete] = useState<number | null>(null);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  const bottomSheetRef = useRef<BottomSheet>(null);
  const swipeableRefs = useRef<Map<number, Swipeable>>(new Map());
  const snapPoints = ["75%"];

  useEffect(() => {
    fetchWorkers(); 
  }, []);

  useEffect(() => {
    setFilteredWorkers(
      searchText.trim()
        ? workers.filter(worker => worker.name.toLowerCase().includes(searchText.toLowerCase()))
        : workers
    );
  }, [searchText, workers]);

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

  // Worker added successfully
  const handleWorkerAdded = () => {
    handleClosePress();
    setSuccessMessage("Worker added successfully");
    setSuccessModalVisible(true);
    fetchWorkers();
  };

  // Confirm delete modal
  const showDeleteConfirmation = (workerId: number) => {
    // Close any open swipeable
    if (swipeableRefs.current.has(workerId)) {
      swipeableRefs.current.get(workerId)?.close();
    }
    
    setWorkerToDelete(workerId);
    setConfirmDeleteVisible(true);
  };

  // Delete worker
  const handleDeleteWorker = async () => {
    if (!workerToDelete) return;
    
    setIsDeleting(true);
    setConfirmDeleteVisible(false);
    
    try {
      const response = await apiHandler.put("/removeWorker", {
        workerId: workerToDelete,
      });

      if (response.status === 200) {
        // Remove from local state
        removeWorker(workerToDelete);
        setSuccessMessage("Worker removed successfully");
        setSuccessModalVisible(true);
      } else {
        throw new Error("Failed to delete worker");
      }
    } catch (error) {
      console.error("Error deleting worker:", error);
      setErrorMessage("Failed to delete worker. Please try again.");
      setErrorModalVisible(true);
    } finally {
      setIsDeleting(false);
      setWorkerToDelete(null);
    }
  };

  // Render swipe actions
  const renderRightActions = (workerId: number) => {
    return (
      <TouchableOpacity
        className="bg-red-500 justify-center items-center w-20 rounded-lg"
        onPress={() => showDeleteConfirmation(workerId)}
      >
        <Ionicons name="trash-outline" size={24} color="white" className="px-4" />
        <Text className="text-white text-xs mt-1">Delete</Text>
      </TouchableOpacity>
    );
  };

  // Close all other open swipeables
  const closeOtherSwipeables = (workerId: number) => {
    swipeableRefs.current.forEach((ref, id) => {
      if (id !== workerId && ref) {
        ref.close();
      }
    });
  };

  // Empty state component
  const renderEmptyList = () => (
    <View className="flex-1 justify-center items-center mt-20">
      <Ionicons name="people-outline" size={70} color="#e5e7eb" />
      <Text className="text-xl font-medium text-gray-400 mt-4">No workers found</Text>
      {searchText.length > 0 ? (
        <Text className="text-gray-400 mt-2">Try a different search term</Text>
      ) : (
        <TouchableOpacity
          className="mt-6 bg-[#ffb133] py-3 px-6 rounded-lg items-center"
          onPress={openBottomSheet}
        >
          <Text className="text-white font-medium">Add Worker</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <SafeAreaView className="bg-[#ffb133]">
        <View className="bg-[#ffb133] flex-row justify-between items-center px-4 pb-4"
          style={{ marginTop: Platform.OS === "ios" ? 60 : 16 }}>
          <TouchableOpacity 
            onPress={() => router.back()}
            className="p-1"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-medium tracking-widest">
            Workers
          </Text>
          <TouchableOpacity 
            onPress={openBottomSheet}
            className="p-1"
          >
            <Ionicons name="add" size={26} color="white" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Search Bar */}
      <View className="mx-4 my-3 bg-white rounded-lg flex-row items-center px-4 py-2 shadow-sm">
        <Ionicons name="search" size={20} color="#9ca3af" />
        <TextInput
          className="flex-1 px-3 h-10 text-base text-gray-900"
          placeholder="Search workers..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#9ca3af"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText("")}>
            <Ionicons name="close-circle" size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      {/* Info text about swipe */}
      {filteredWorkers.length > 0 && (
        <View className="flex-row items-center justify-center mx-4 mb-3">
          <Ionicons name="information-circle-outline" size={14} color="#9ca3af" />
          <Text className="text-gray-400 text-xs ml-1">
            Swipe left to delete a worker
          </Text>
        </View>
      )}

      {/* Worker List */}
      <FlatList
        data={filteredWorkers}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 20,
          flexGrow: filteredWorkers.length === 0 ? 1 : undefined,
        }}
        ListEmptyComponent={renderEmptyList}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Swipeable
            ref={(ref) => {
              if (ref) swipeableRefs.current.set(item.id, ref);
            }}
            renderRightActions={() => renderRightActions(item.id)}
            onSwipeableOpen={() => closeOtherSwipeables(item.id)}
            overshootRight={false}
            friction={2}
          >
            <View className="py-4 px-4 flex-row justify-between items-center my-1 bg-white rounded-lg shadow-sm border border-gray-100">
              <View className="flex-row gap-3 items-center">
                {item.profile ? (
                  <Image
                    source={{ uri: item.profile }}
                    className="h-12 w-12 rounded-full bg-gray-100"
                  />
                ) : (
                  <View className="h-12 w-12 rounded-full bg-[#fff3e0] items-center justify-center">
                    <Text className="text-[#ffb133] text-xl font-bold">
                      {item.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View>
                  <Text className="text-xs text-gray-500 mb-0.5">
                    {item.designation || "Worker"}
                  </Text>
                  <Text className="text-base font-semibold text-gray-800">
                    {item.name}
                  </Text>
                  <Text className="text-sm text-gray-500 mt-0.5">
                    {item.contact}
                  </Text>
                </View>
              </View>

              <View className="items-end">
                <Text className="text-xs text-gray-400">Salary</Text>
                <Text className="text-lg font-bold text-[#ffb133]">
                  रु {item.salary ? item.salary.toLocaleString() : 0}
                </Text>
              </View>
            </View>
          </Swipeable>
        )}
      />

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
        handleStyle={{ backgroundColor: "#f8f8f8" }}
        handleIndicatorStyle={{ backgroundColor: "#9ca3af", width: 40 }}
      >
        <BottomSheetView>
          <MainWorker onWorkerAdded={handleWorkerAdded} />
        </BottomSheetView>
      </BottomSheet>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={confirmDeleteVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setConfirmDeleteVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/40">
          <View className="bg-white w-4/5 rounded-xl p-5 items-center">
            <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="trash-outline" size={24} color="#ef4444" />
            </View>
            
            <Text className="text-xl font-bold text-gray-800 mb-2 text-center">
              Delete Worker
            </Text>
            
            <Text className="text-gray-600 text-center mb-6">
              Are you sure you want to delete this worker? This action cannot be undone.
            </Text>
            
            <View className="flex-row w-full gap-3">
              <TouchableOpacity 
                className="flex-1 border border-gray-300 py-3 rounded-lg items-center"
                onPress={() => setConfirmDeleteVisible(false)}
                disabled={isDeleting}
              >
                <Text className="text-gray-700 font-medium">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="flex-1 bg-red-500 py-3 rounded-lg items-center"
                onPress={handleDeleteWorker}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white font-medium">Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <SuccessModal
        visible={successModalVisible}
        title="Success"
        message={successMessage}
        onClose={() => setSuccessModalVisible(false)}
      />

      {/* Error Modal */}
      <ErrorModal
        visible={errorModalVisible}
        title="Error"
        message={errorMessage}
        onClose={() => setErrorModalVisible(false)}
      />
    </View>
  );
};

export default WorkerList;
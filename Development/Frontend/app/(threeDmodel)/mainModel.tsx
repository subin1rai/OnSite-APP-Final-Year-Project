import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  Pressable,
  StatusBar,
  Platform,
  Image,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useThreeDModelStore } from "@/store/threeDmodelStore";
import { useProjectStore } from "@/store/projectStore";
import Add3Dmodel from "@/Components/Add3Dmodel";

const MainModel = () => {
  const { threeDModels, fetchThreeDModels, clearThreeDModels } = useThreeDModelStore();
  const { selectedProject } = useProjectStore();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = ["65%"];

  useEffect(() => {
    if (selectedProject) {
      setLoading(true);
      clearThreeDModels(); 
      fetchThreeDModels().finally(() => setLoading(false)); 
    }
  }, [selectedProject]);

  // Refresh Control Handler
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchThreeDModels();
    setRefreshing(false);
  };

  // Open BottomSheet 
  const openBottomSheet = useCallback(() => {
    setIsOpen(true);
    setTimeout(() => {
      bottomSheetRef.current?.snapToIndex(0); 
    }, 100);
  }, []);

  // Close BottomSheet
  const handleClosePress = useCallback(() => {
    bottomSheetRef.current?.close();
    setTimeout(() => setIsOpen(false), 300);
  }, []);

  return (
    <View className="flex-1 bg-[#DODODO]">
      {/* Header */}
      <SafeAreaView className="bg-[#ffb133]">
        <View
          className="bg-[#ffb133] flex-row justify-between mt-16 items-center px-4 pb-[10px]"
          style={{
            marginTop: Platform.OS === "ios" ? 60 : StatusBar.currentHeight,
          }}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
          <Text className="text-white text-2xl font-medium tracking-widest">
           3D Model
          </Text>
          <TouchableOpacity onPress={openBottomSheet}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Loader */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FCA311" />
        </View>
      ) : (
        // 3D Model List
        <ScrollView
          className="mx-4 mt-4"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FCA311" colors={["#FCA311"]} />
          }
        >
          {threeDModels.length > 0 ? (
            <View className="flex-row flex-wrap justify-between">
              {threeDModels.map((model) => (
                <View key={model.id} className="bg-white rounded-lg mt-2 drop-shadow-lg w-[48%]">
                  <Image source={{ uri: model.image }} className="w-full h-32 rounded-t-lg" />
                  <Text className="text-xl font-medium p-2">{model.modelName}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View className="flex-1 justify-center items-center h-[500px]">
              <Text className="text-gray-500 text-lg text-center">No 3D Models Available</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Dim Background when BottomSheet is open */}
      {isOpen && (
        <Pressable
          className="absolute top-0 left-0 w-full h-full bg-black opacity-50"
          onPress={handleClosePress}
        />
      )}

      {/* BottomSheet for Adding 3D Model */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        onClose={handleClosePress}
        detached={true} 
        style={{ flex: 1 }} 
      >
        <BottomSheetView style={{ flex: 1 }}>
          <Add3Dmodel />
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

export default MainModel;

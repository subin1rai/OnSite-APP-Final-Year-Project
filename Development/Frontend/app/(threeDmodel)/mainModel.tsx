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
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  role: string;
  exp: number;
  [key: string]: any;
}
const MainModel = () => {
  const { threeDModels, fetchThreeDModels, clearThreeDModels } = useThreeDModelStore();
  const { selectedProject } = useProjectStore();
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);
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

  useEffect(() => {
    const getRoleFromToken = async () => {
      const token = await SecureStore.getItemAsync("AccessToken");
      if (token) {
        try {
          const decoded = jwtDecode<DecodedToken>(token);
          setRole(decoded.role || null);
        } catch (err) {
          console.error("Invalid token", err);
          setRole(null);
        }
      }
    };

    getRoleFromToken();
  }, []);

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

  
const handleModelClick = (selectedModelData: any) => {
    console.log("selected model :",selectedModelData);
    useThreeDModelStore.getState().setSelectedModel(selectedModelData);
    router.push("/(threeDmodel)/viewModel");
  };

  return (
    <View className="flex-1 bg-[#DODODO]">
      {/* Header */}
      <SafeAreaView className="bg-[#ffb133]">
        <View
          className="bg-[#ffb133] flex-row justify-between mt-16 items-center px-4 pb-[10px]"
          style={{
            marginTop: Platform.OS === "ios" ? 60 : 4,
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-medium tracking-widest">
            3D Model
          </Text>
          {role === "builder" ? (
               <TouchableOpacity onPress={openBottomSheet}>
               <Ionicons name="add" size={24} color="white" />
             </TouchableOpacity>
          ) :<View/>}

    
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
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FCA311"
              colors={["#FCA311"]}
            />
          }
        >
          {threeDModels.length > 0 ? (
            <View className="flex-row flex-wrap justify-between">
              {threeDModels.map((model) => (
                <TouchableOpacity
                  key={model.id}
                  onPress={() => handleModelClick(model)}
                  className="bg-white rounded-lg mt-2 drop-shadow-lg w-[48%]"
                >
                  <Image
                    source={{ uri: model.image }}
                    className="w-full h-32 rounded-t-lg"
                  />
                  <Text className="text-xl font-medium p-2">
                    {model.modelName}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="flex-1 justify-center items-center h-[500px]">
              <Text className="text-gray-500 text-lg text-center">
                No 3D Models Available
              </Text>
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

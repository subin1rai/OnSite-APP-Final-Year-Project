import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  Pressable,
  StatusBar,
  Platform,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useProjectStore } from "@/store/projectStore";
import AddFile from "@/Components/AddFile";
import apiHandler from "../../context/ApiHandler";
import eventBus from "../../context/eventBus";

interface FileItem {
  id: number;
  name: string;
  file: string; 
  projectId: number;
}

export default function AllFiles() {
  const { selectedProject } = useProjectStore();
  const projectId = selectedProject?.id || null;
  const [documents, setDocuments] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = ["50%"];

  useEffect(() => {
    if (projectId) {
      fetchDocuments();
    }
  }, [projectId]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await apiHandler.post(
        "/allDocument",
        { projectId },
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.data.success) {
        setDocuments(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
    setLoading(false);
  };

  // Open BottomSheet properly
  const openBottomSheet = useCallback(() => {
    setIsOpen(true);
    requestAnimationFrame(() => {
      bottomSheetRef.current?.expand();
    });
  }, []);

  // Close BottomSheet properly
  const closeBottomSheet = useCallback(() => {
    bottomSheetRef.current?.close();
    setTimeout(() => setIsOpen(false), 300);
  }, []);

  useEffect(() => {
    eventBus.on("openBottomSheet", openBottomSheet);
    return () => {
      eventBus.off("openBottomSheet", openBottomSheet);
    };
  }, []);

  const isImageFile = (fileUrl: string) => /\.(jpg|jpeg|png)$/i.test(fileUrl);
  const isPdfFile = (fileUrl: string) => /\.pdf$/i.test(fileUrl);

  const renderItem = ({ item }: { item: FileItem }) => (
    <TouchableOpacity className="w-1/3 p-2 aspect-square">
      <View className="bg-gray-100 border border-gray-300 rounded-lg overflow-hidden flex-1">
        {isImageFile(item.file) ? (
          <Image source={{ uri: item.file }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <View className="flex-1 justify-center items-center p-2">
            <Image source={require("../../assets/icons/pdf-icon.png")} className="w-12 h-12 mb-2" resizeMode="contain" />
            <Text className="text-xs text-gray-600 text-center" numberOfLines={2}>{item.name}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <SafeAreaView className="bg-[#ffb133]">
        <View
          className="bg-[#ffb133] flex-row justify-between items-center px-4 pb-[10px]"
          style={{
            marginTop: Platform.OS === "ios" ? 0: StatusBar.currentHeight,
          }}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
          <Text className="text-white text-2xl font-medium tracking-widest">
            Files
          </Text>
          <View className=" flex-row gap-4 py-1 items-center">
           <TouchableOpacity>
           <Ionicons name="camera" size={24} color="white" />
           </TouchableOpacity>
           <TouchableOpacity  >
            <Ionicons name="download" size={24} color="white" />
           </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* Loader */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FCA311" />
        </View>
      ) : (
        <FlatList
          data={documents}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          numColumns={3}
        />
      )}

      {/* Dim Background when BottomSheet is open */}
      {isOpen && (
        <Pressable
          className="absolute top-0 left-0 w-full h-full bg-black opacity-50"
          onPress={closeBottomSheet}
        />
      )}

      {/* BottomSheet for Adding File
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        onClose={closeBottomSheet}
        detached={true}
        backgroundStyle={{ borderRadius: 24 }}
      >
        <BottomSheetView className="flex-1">
          <AddFile />
        </BottomSheetView>
      </BottomSheet> */}
    </View>
  );
}

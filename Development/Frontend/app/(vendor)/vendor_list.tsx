import React, { useEffect, useRef, useState } from "react";
import { FlatList, SafeAreaView, Text, TextInput, TouchableOpacity, View, Pressable, StatusBar, Platform, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import MainVendor from "@/Components/MainVendor";
import { useVendorsStore } from "@/store/mainVendorStore";
import { router } from "expo-router";

const VendorList = () => {
  const { vendors, fetchVendors } = useVendorsStore();
  const [searchText, setSearchText] = useState<string>("");
  const [filteredVendors, setFilteredVendors] = useState(vendors);
  const [isOpen, setIsOpen] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = ["55%"];

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredVendors(vendors);
    } else {
      setFilteredVendors(
        vendors.filter(vendor =>
          vendor.VendorName.toLowerCase().includes(searchText.toLowerCase())
        )
      );
    }
  }, [searchText, vendors]);

  const openBottomSheet = () => {
    setIsOpen(true);
    bottomSheetRef.current?.snapToIndex(0);
  };

  const handleClosePress = () => {
    bottomSheetRef.current?.close();
    setIsOpen(false);
  };

  const handleVendorAdded = () => {
    handleClosePress();
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <SafeAreaView className="bg-[#ffb133]">
        <View
          className="bg-[#ffb133] flex-row justify-between mt-16 items-center px-4 pb-[10px]"
          style={{ marginTop: Platform.OS === "ios" ? 60 : StatusBar.currentHeight }}
        ><TouchableOpacity onPress={() => router.back()}>
                  <Ionicons name="arrow-back" size={24} color="white" />
                  </TouchableOpacity> 
          <Text className="text-white text-2xl font-medium tracking-widest">Vendors</Text>
          <TouchableOpacity onPress={openBottomSheet}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Search Bar */}
      <View className="mx-4 my-3 bg-gray-200 rounded-full flex-row items-center px-4 py-2">
        <Ionicons name="search" size={22} color="#333" />
        <TextInput
          className="flex-1 px-3 h-10 text-xl text-gray-900"
          placeholder="Search vendors..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#888"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText("")}>
            <Ionicons name="close-circle" size={22} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Vendor List */}
      <FlatList
        data={filteredVendors}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View className="py-3 px-4 flex-row justify-between items-center mx-4 mt-3 bg-white rounded-md shadow-sm">
            <View className="flex-row gap-4 items-center">
              <Image source={{ uri: item.profile }} className="h-12 w-12 rounded-full" />
              <View>
                <Text className="text-[12px] text-gray-500">{item.companyName || "Vendor"}</Text>
                <Text className="text-xl font-medium">{item.VendorName}</Text>
                <Text className="text-sm text-gray-500">{item.contact}</Text>
              </View>
            </View>
          </View>
        )}
      />

      {/* Dim Background when BottomSheet is open */}
      {isOpen && (
        <Pressable
          className="absolute top-0 left-0 w-full h-full bg-black opacity-50"
          onPress={handleClosePress}
        />
      )}

      {/* BottomSheet for Adding Vendor */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        onClose={handleClosePress}
      >
        <BottomSheetView>
          <MainVendor onVendorAdded={handleVendorAdded} />
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

export default VendorList;

// components/EmergencyModal.tsx
import React, { useMemo, useRef, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Linking } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { ambulanceServices, AmbulanceService } from "@/constants/ambulancedata";

interface Props {
  visible: boolean;
  onClose: () => void;
}

const EmergencyModal = ({ visible, onClose }: Props) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["60%", "90%"], []);

  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const districts = Array.from(new Set(ambulanceServices.map((a) => a.district)));

  const filteredServices = selectedDistrict
    ? ambulanceServices.filter((a) => a.district === selectedDistrict)
    : ambulanceServices;

  const handleCall = (phone: string) => {
    const number = phone.replace(/\s/g, "").split(",")[0];
    Linking.openURL(`tel:${number}`);
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      index={visible ? 0 : -1}
      onClose={onClose}
      enablePanDownToClose
    >
      <View className="p-4">
        <Text className="text-lg font-semibold mb-2">Select District:</Text>
        <FlatList
          horizontal
          data={districts}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedDistrict(item)}
              className={`px-3 py-1 rounded-full mr-2 ${selectedDistrict === item ? "bg-red-500" : "bg-gray-300"}`}
            >
              <Text className="text-white">{item}</Text>
            </TouchableOpacity>
          )}
        />

        <Text className="text-lg font-semibold my-4">Ambulance Services:</Text>
        <FlatList
          data={filteredServices}
          keyExtractor={(item, index) => `${item.name}-${index}`}
          renderItem={({ item }) => (
            <View className="mb-4 bg-gray-100 p-3 rounded-lg">
              <Text className="font-semibold">{item.name}</Text>
              <Text className="text-sm text-gray-500 mb-2">{item.district}</Text>
              <TouchableOpacity
                onPress={() => handleCall(item.phone)}
                className="bg-red-600 py-2 px-4 rounded-lg mt-1"
              >
                <Text className="text-white text-center">Call</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </BottomSheet>
  );
};

export default EmergencyModal;

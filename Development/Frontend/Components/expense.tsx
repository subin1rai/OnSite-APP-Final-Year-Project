import { TouchableWithoutFeedback } from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import React, { useCallback, useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { FloatingAction } from "react-native-floating-action";
import AddExpenses from "@/components/AddExpenses";
import apiHandler from "@/context/ApiHandler";

const Expense = () => {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [transaction, setTransaction] = useState("");
  const snapPoints = ["40%"];

  const handleOpenBottomSheet = useCallback(() => {
    bottomSheetRef.current?.expand();
    setIsBottomSheetOpen(true);
  }, []);

  const handleCloseBottomSheet = () => {
    bottomSheetRef.current?.close();
    setIsBottomSheetOpen(false);
  };
  const fetchTrancation = async() => {
    try {
      const response = await apiHandler.get()
    } catch (error) {
      
    }
  }


return (
  <TouchableWithoutFeedback onPress={handleCloseBottomSheet}>
    <View className="h-[100%] relative">
      <ScrollView className="flex-1">
        {/* Expenses List */}
        <View className="flex flex-row bg-white justify-between items-center px-4 mx-4 rounded-md mt-2 shadow-sm py-3">
          <View className="gap-2">
            <Text className="text-2xl font-semibold">AK Breakes</Text>
            <Text className="text-[#3C3C43] font-medium">AK Trades</Text>
            <Text className="text-sm text-[#3C3C43]">2024 Dec 06 10:11 AM</Text>
          </View>
          <View>
            <Text className="text-lg font-medium text-[#FF3B30]">
              NRP. 50000
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button - Fixed at Bottom */}
      <View className="absolute bottom-1 right-0 bg-red-500">
        <FloatingAction
          overrideWithAction
          actions={[
            {
              text: "Add Transaction",
              icon: require("@/assets/icons/ai.png"), // Ensure this path is correct
              name: "add_transaction",
            },
          ]}
          onPressItem={handleOpenBottomSheet} // Opens Bottom Sheet
          color="#FF9500"
          buttonSize={56}
          overlayColor="rgba(0, 0, 0, 0.5)" // Transparent Overlay
        />
      </View>

      {/* Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        onClose={handleCloseBottomSheet}
        containerStyle={{ zIndex: 20, flex: 1 }}
      >
        <BottomSheetView className="px-4">
  {isBottomSheetOpen && <AddExpenses handleCloseBottomSheet={handleCloseBottomSheet} />}
</BottomSheetView>

      </BottomSheet>
    </View>
  </TouchableWithoutFeedback>
);

};

export default Expense;

import React, { useState } from "react";
import { ScrollView, Text, View, StyleSheet } from "react-native";
import { FloatingAction } from "react-native-floating-action";

// const actions = [
//   {
//     text: "Income",
//     // icon: require("./images/ic_accessibility_white.png"),
//     name: "bt_accessibility",
//     position: 2,
//     color: "#ffb133"
//   },
//   {
//     text: "Add expenses",
//     // icon: require("./images/ic_language_white.png"),
//     name: "bt_language",
//     position: 1,
//     color: "#ffb133"
//   },
//   {
//     text: "Add Vendor",
//     // icon: require("./images/ic_room_white.png"),
//     name: "vendor",
//     position: 3,
//     color: "#ffb133"
//   }
// ];

const Expense = () => {
  const [form, setFormOpen] = useState(false);
  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }}>
        {/* Expenses List */}
        <View className="flex flex-row bg-white justify-between items-center px-4 mx-4 rounded-md mt-2">
          <View className="gap-2 py-3">
            <View className="">
              <Text className="font-semibold text-2xl">AK Breakes</Text>
              <Text className="font-medium text-[#3C3C43]">AK Trades</Text>
            </View>
            <View className="">
              <Text className="font-normal text-sm text-[#3C3C43]">2024 Dec 06 10:11 AM</Text>
            </View>
          </View>
          <View className="">
            <Text className="text-[16px] font-medium text-[#FF3B30]">NRP. 50000</Text>
          </View>
        </View>

        {/* Add more Expense items here like the one above */}
        {/* Copy the View blocks above for each expense */}

      </ScrollView>

      {/* Floating Action Button */}
      <FloatingAction

        // onPressItem={}
        color="#FF9500" // You can change this to any color you want
        position="right" // Position it on the right side
        buttonSize={56} // Size of the button
        overlayColor="#fffff" 
   
      />
    </View>
  );
};

// const styles = StyleSheet.create({
//   floatingActionButton: {
//     position: "absolute",
//     right: 20,
//     bottom: 20,
//     zIndex: 1, // Ensures the button is always on top of other elements
//   },
// });

export default Expense;

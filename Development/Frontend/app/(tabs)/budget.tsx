import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { BlurView } from "expo-blur";
import { images } from "@/constants"; // Assuming images are stored here
import { useState } from "react";
import Expense from "../(expenses)/expense";
import Vendors from "../(expenses)/vendors";

const Budget = () => {
  const [activeTab, setActiveTab] = useState("Expense"); // State to track active tab

  // Function to change the active tab
  const handleTabChange = (tabName: "Expense" | "Vendors") => {
    setActiveTab(tabName);
  };

  return (
    <SafeAreaView className="bg-[#ffb133]">
      <View className="bg-[#ffb133] h-[180px] w-full z-0 flex">
        <View className="flex-row justify-between mx-4 items-center">
          <Ionicons name="arrow-back" size={24} color="white" />
          <Text className="text-2xl text-white font-semibold tracking-wider">
            Budget
          </Text>
          <Image
            source={images.imageProfile}
            className="w-10 h-10 rounded-full"
          />
        </View>
        <BlurView
          className="z-100 w-[91%] h-[173px] mt-5 mx-auto rounded-lg border border-neutral-200/25"
          style={[
            {
              shadowColor: "#000", // Color of the shadow
              shadowOffset: { width: 0, height: 5 }, // Position of the shadow
              shadowOpacity: 0.1, // Transparency of the shadow
              shadowRadius: 10, // Blur radius of the shadow
              elevation: 5, // Elevation for Android shadow
              ...(Platform.OS === "android" && { elevation: 0 }), // Android-specific shadow
              overflow: "hidden", // Ensure rounded corners are applied
            },
          ]}
          tint="light" // Set the blur color to white
          intensity={80} // Blur intensity
        >
          <View className="px-4 flex gap-4 mt-4">
            <Text className="text-3xl font-semibold text-white">
              Ram Kumar Limbu
            </Text>
            <View className="flex flex-row justify-between ">
              <View className="">
                <Text className="font-medium text-2xl text-white">Budget</Text>
                <Text className="font-medium text-2xl text-[#C17800]">
                  NRP. 24,00,000
                </Text>
              </View>
              <View>
                <Text className="font-medium text-2xl text-white">
                  Budget In Hand
                </Text>
                <Text className="font-medium text-2xl text-[#079907]">
                  NRP. 24,00,000
                </Text>
              </View>
            </View>
            {/* second row */}
            <View className="flex flex-row justify-between ">
              <View>
                <Text className="font-medium text-2xl text-white">
                  Expenses
                </Text>
                <Text className="font-medium text-2xl text-[#FF3B30]">
                  NRP. 24,00,000
                </Text>
              </View>
              <View className="">
                <Text className="font-medium text-2xl text-white">
                  Remaining
                </Text>
                <Text className="font-medium text-2xl text-[#FF9500]">
                  NRP. 24,00,000
                </Text>
              </View>
            </View>
          </View>
        </BlurView>

        {/* Custom Tabs Navigation */}
        <View className="flex flex-row mt-4">
          <TouchableOpacity
            onPress={() => handleTabChange("Expense")}
            style={{
              flex: 1,
              paddingVertical: 10,
              alignItems: "center",
              borderBottomWidth: 2,
              borderBottomColor:
                activeTab === "Expense" ? "#ffd700" : "#D9D9D9", // Active tab color
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "500",
                color: activeTab === "Expense" ? "#FCA311" : "#3C3C43",
              }}
            >
              Expense
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleTabChange("Vendors")}
            style={{
              flex: 1,
              paddingVertical: 10,
              alignItems: "center",
              borderBottomWidth: 2, // Underline for the active tab
              borderBottomColor:
                activeTab === "Vendors" ? "#ffd700" : "#D9D9D9", // Active tab color
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "500",
                color: activeTab === "Vendors" ? "#FCA311" : "#3C3C43",
              }}
            >
              Vendors
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content based on Active Tab */}
        <View className="p-0 m-2  h-[421px]">
          {activeTab === "Expense" ? <Expense /> : <Vendors />}
        </View>
      </View>
    </SafeAreaView>
  );
}

export default Budget;

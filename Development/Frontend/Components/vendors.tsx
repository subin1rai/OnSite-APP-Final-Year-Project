import React, { useEffect, useState } from "react";
import { ScrollView, Text, View, ActivityIndicator } from "react-native";
import * as SecureStore from "expo-secure-store";
import apiHandler from "@/context/ApiHandler";
import { useProjectStore } from "@/store/projectStore";
import { Ionicons } from "@expo/vector-icons";

const Vendors = () => {
  const { selectedProject } = useProjectStore();
  const [vendorData, setVendorData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchVendorData = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync("AccessToken");
      const response = await apiHandler.post("/budget/vendors", {id: selectedProject?.id}, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setVendorData(response.data);
    } catch (error) {
      setVendorData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProject?.id) {
      fetchVendorData();
    }
  }, [selectedProject]);

  const NoDataView = () => (
    <View className="flex-1 justify-center items-center p-6">
      <Ionicons 
        name="document-text-outline" 
        size={80} 
        color="#CCCCCC" 
        style={{ marginBottom: 16 }}
      />
      <Text className="text-lg text-center text-gray-600">
        No vendor data available for this project.
      </Text>
      <Text className="text-sm text-center text-gray-500 mt-2">
        Vendor information will appear here once available.
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FF9500" />
        </View>
      ) : vendorData && vendorData.vendor && vendorData.totalAmount !== undefined ? (
        <ScrollView>
          <View className="flex flex-row bg-white justify-between items-center px-4 mx-4 rounded-md mt-4 py-3 shadow-sm">
            <View className="gap-2">
              <Text className="font-semibold text-2xl">
                {vendorData.vendor.name || "Unnamed Vendor"}
              </Text>
              <Text className="font-medium text-md text-[#3C3C43]">
                {vendorData.vendor.email || "No email"}
              </Text>
              {/* Add phone number if available */}
              {vendorData.vendor.phone && (
                <Text className="text-md text-[#3C3C43]">
                  {vendorData.vendor.phone}
                </Text>
              )}
            </View>
            <View>
              <Text className="text-[16px] font-medium text-[#FF3B30]">
                NRP. {vendorData.totalAmount.toLocaleString()}
              </Text>
            </View>
          </View>
        </ScrollView>
      ) : (
        <NoDataView />
      )}
    </View>
  );
};

export default Vendors;
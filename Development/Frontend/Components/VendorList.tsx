import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";
import apiHandler from "@/context/ApiHandler";
import { useVendorStore, Vendor } from "@/store/vendorStore";
import * as SecureStore from "expo-secure-store";

interface VendorListProps {
  handleCloseBottomSheet: () => void;
}

const VendorList: React.FC<VendorListProps> = ({ handleCloseBottomSheet }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { setSelectedVendor } = useVendorStore();

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await apiHandler.get("/vendor",
        {
          headers: {
            Authorization: `Bearer ${await SecureStore.getItemAsync("AccessToken")}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response.data);
      setVendors(response?.data?.vendors || []);
    } catch (error) {
      console.error("Error fetching vendors:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#FCA311" />
      </View>
    );
  }

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
      {/* Search Input */}
      <View style={{ marginBottom: 16 }}>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 4,
            paddingHorizontal: 16,
            paddingVertical: 12,
            color: "#000",
          }}
          placeholder="Search vendor..."
          placeholderTextColor="#999"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      {/* Vendors FlatList */}
      <FlatList
        data={vendors.filter((v) =>
          v.VendorName?.toLowerCase().includes(searchTerm.toLowerCase())
        )}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item: v }) => (
          <TouchableOpacity
            onPress={() => {
              setSelectedVendor(v);
              handleCloseBottomSheet();
            }}
            style={{
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: "#eee",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "600" }}>
              {v.VendorName}
            </Text>
            <Text style={{ color: "#666" }}>{v.contact}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <Text style={{ color: "#999", marginTop: 16 }}>
            No vendors found.
          </Text>
        )}
      />
    </View>
  );
};

export default VendorList;

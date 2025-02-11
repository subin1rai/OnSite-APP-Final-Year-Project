import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";
import apiHandler from "@/context/ApiHandler";
import { images } from "@/constants";
import { useProjectStore } from "@/store/projectStore";
import * as SecureStore from "expo-secure-store";
import { useBottomSheetStore } from "@/store/buttomSheet";

const AddWorkers = () => {
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWorkers, setSelectedWorkers] = useState<number[]>([]);
  const { selectedProject } = useProjectStore();
  const { closeBottomSheet } = useBottomSheetStore();


  // Fetch all workers from your API
  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const response = await apiHandler.get("/worker");
      setWorkers(response?.data?.workers || []);
    } catch (error) {
      console.error("Error fetching workers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const toggleWorkerSelection = (workerId: number) => {
    setSelectedWorkers((prev) => {
      if (prev.includes(workerId)) {
        return prev.filter((id) => id !== workerId);
      } else {

        return [...prev, workerId];
      }
    });
  };

  // Filter workers by search term
  const filteredWorkers = workers.filter((w) =>
    w.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Render each worker item
  const renderWorkerItem = ({ item: w }: { item: any }) => {
    const isSelected = selectedWorkers.includes(w.id);

    return (
      <View className="flex-row items-center mb-4">
        {/* Checkbox Area */}
        <TouchableOpacity
          // Toggle the worker selection on press
          onPress={() => toggleWorkerSelection(w.id)}
          style={{
            width: 20,
            height: 20,
            marginRight: 10,
            borderRadius: 4,
            borderWidth: 2,
            borderColor: isSelected? "white" : "#999",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: isSelected ? "#FCA311" : "transparent",
          }}
        >
          {/* Optional checkmark or styling if needed */}
          {isSelected && (
            <Text style={{ color: "#fff", fontWeight: "bold" }}>✓</Text>
          )}
        </TouchableOpacity>
        {/* Worker profile image */}
        <Image
          source={w.profile ? { uri: w.profile } : images.imageProfile}
          style={{ width: 40, height: 40, borderRadius: 20 }}
        />
        {/* Worker info */}
        <View style={{ marginLeft: 10 }}>
          <Text style={{ fontWeight: "600" }}>{w.name}</Text>
          <Text style={{ color: "#666" }}>{w.designation}</Text>
          <Text style={{ color: "#999" }}>{w.contact}</Text>
        </View>
      </View>
    );
  };

  const handleAddWorkers = async () => {
    if (!selectedProject?.id) {
      console.warn("No project selected. Please select a project first.");
      return;
    }
    const token = await SecureStore.getItemAsync("AccessToken");    
    try {
      for (const workerId of selectedWorkers) {
        await apiHandler.post("/project/addWorker", {
          workerId,
          projectId: selectedProject.id,
        },{
          headers: {
             Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      }
      setSelectedWorkers([]);

    // ✅ Close BottomSheet after adding workers successfully
    closeBottomSheet();
       
    } catch (error) {

      console.error("Error adding workers to project:", error);
    }
  };

  // Show loading indicator if data is still being fetched
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
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
    paddingVertical: 16,
    color: "#000", 
  }}
  placeholder="Search worker..."
  placeholderTextColor="#999"
  value={searchTerm}
  onChangeText={setSearchTerm}
/>

        
      </View>

      {/* Section Title */}
      <View style={{ marginBottom: 8 }}>
        <Text style={{ fontSize: 20, fontWeight: "600" }}>Workers</Text>
      </View>

      {/* Workers FlatList */}
      <FlatList
        data={filteredWorkers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderWorkerItem}
        ListEmptyComponent={() => (
          <Text style={{ color: "#999", marginTop: 16 }}>
            No workers found.
          </Text>
        )}
      />

      {/* Add New Worker Button */}
      <TouchableOpacity
        onPress={handleAddWorkers}
        className="bg-[#FCA311] p-4 flex w-[100%] rounded-md my-4 items-center" 
      >
        <Text style={{ color: "#fff", fontWeight: "600" }}>Add Worker</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddWorkers;

import React, { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import apiHandler from "@/context/ApiHandler";
import { useProjectStore } from "@/store/projectStore";

interface AddTaskProps {
  onWorkerAdded?: () => void;
}

const AddTask: React.FC<AddTaskProps> = ({ onWorkerAdded }) => {
  const { selectedProject } = useProjectStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("inProgress");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !description) {
      Alert.alert("Missing Fields", "Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiHandler.post("/task/add", {
        name,
        description,
        status,
        projectId: selectedProject?.id,
      });

      if (res.status === 201) {
        Alert.alert("Success", "Task added successfully!");
        onWorkerAdded?.();
      }
    } catch (err) {
      console.error("Error adding task", err);
      Alert.alert("Error", "Failed to add task.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ScrollView className="px-4 pt-2" keyboardShouldPersistTaps="handled">
        <View className="mt-2">
          <Text>Task Name</Text>
          <TextInput
            placeholder="Enter Task Name"
            value={name}
            onChangeText={setName}
            className="mt-2 border border-gray-300 rounded-md py-4 px-3 text-gray-700"
            placeholderTextColor="#888"
          />
        </View>

        <View className="mt-4">
          <Text>Description</Text>
          <TextInput
            placeholder="Enter Description"
            value={description}
            onChangeText={setDescription}
            className="mt-2 border border-gray-300 rounded-md py-4 px-3 text-gray-700"
            placeholderTextColor="#888"
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          className="mt-6 bg-[#ffb133] py-4 rounded-md"
        >
          <Text className="text-white text-center text-lg">
            {loading ? "Submitting..." : "Add Task"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

export default AddTask;
import apiHandler from '@/context/ApiHandler';
import { useAttendanceStore } from '@/store/attendanceStore';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';

interface UpdateWorkerSheetProps {
  onClose: () => void;
}

const UpdateWorkerSheet = ({ onClose }: UpdateWorkerSheetProps) => {
  const { selectedWorker, setSelectedWorker, fetchWorkers } = useAttendanceStore();
  const shiftValue = selectedWorker?.shifts;

  const handleShiftPress = (shift: number) => {
    if (selectedWorker) {
      setSelectedWorker({ ...selectedWorker, shifts: shift });
    }
  };

  const getButtonStyle = (shift: number) => {
    const baseStyle = 'py-2 px-6 text-lg font-medium tracking-widest rounded-[6px]';
    return shiftValue === shift
      ? `${baseStyle} bg-[#FCA311] text-white`
      : `${baseStyle} border border-gray-400 text-gray-500`;
  };

  const updateData = async () => {
    try {
      if (!selectedWorker) return;
      const payload = { id: selectedWorker.id, shifts: shiftValue };
      const response = await apiHandler.put("/attendace/updateShift", payload);
      if (!response || !response.data) {
        throw new Error("Failed to update attendance");
      }
      // Refresh the global workers list
      await fetchWorkers();
      // Close the bottom sheet
      onClose();
    } catch (error) {
      console.error("Error updating attendance:", error);
    }
  };

  return (
    <View className="px-4">
      <View className="my-3 flex-row justify-between items-center">
        <Text className="text-xl font-medium">Salary Amount</Text>
        <Text className="text-xl font-medium">NRP. 1000</Text>
      </View>
      <View className="border-b border-gray-300" />
      <Text className="mt-2 text-2xl font-semibold tracking-widest">Shift</Text>
      <View className="flex-row justify-between py-4 items-center">
        <TouchableOpacity onPress={() => handleShiftPress(0.5)} className={getButtonStyle(0.5)}>
          <Text>0.5 Shift</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleShiftPress(1)} className={getButtonStyle(1)}>
          <Text>1.0 Shift</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleShiftPress(1.5)} className={getButtonStyle(1.5)}>
          <Text>1.5 Shift</Text>
        </TouchableOpacity>
      </View>
      <View className="flex-row items-center justify-between pt-8 gap-3">
        <TouchableOpacity
          className="flex-1 bg-[#FCA311] py-4 rounded-lg items-center"
          onPress={updateData}
        >
          <Text className="text-white font-semibold text-lg">Save</Text>
        </TouchableOpacity>
        <TouchableOpacity className="p-3 border border-red-500 rounded-lg items-center justify-center">
          <Ionicons name="trash" size={24} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default UpdateWorkerSheet;

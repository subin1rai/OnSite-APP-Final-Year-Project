import { router } from "expo-router";
import React from "react";
import { TouchableOpacity, Text, View } from "react-native";

// ✅ Define Props Type
interface AddExpensesProps {
  handleCloseBottomSheet: () => void;
}

const AddExpenses: React.FC<AddExpensesProps> = ({ handleCloseBottomSheet }) => {
  const navigateTo = (route: string) => {
    handleCloseBottomSheet(); 
    router.push(route as any);
  };

  return (
    <View>
      <Text className="font-medium text-2xl">Add Transaction</Text>
      <View className="flex-row items-center justify-between px-4 gap-4 mt-4">
        {/* Payment In Button */}
        <TouchableOpacity 
          className="flex-1 bg-green-300 py-4 rounded-lg"
          onPress={() => navigateTo('../(expenses)/paymentIn')}
        >
          <Text className="text-green-70000 text-center text-lg font-medium">
            Payment In
          </Text>
        </TouchableOpacity>

        {/* Payment Out Button */}
        <TouchableOpacity 
          className="flex-1 bg-red-300 py-4 rounded-lg"
          onPress={() => navigateTo('../(expenses)/paymentOut')}
        >
          <Text className="text-red-500 text-center text-lg font-medium">
            Payment Out
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddExpenses;

import React, { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Modal,
} from "react-native";
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import VendorList from "@/Components/VendorList";
import { useVendorStore } from "@/store/vendorStore";
import DateTimePicker from "react-native-ui-datepicker";
import dayjs from "dayjs";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { useRoute } from "@react-navigation/native";
import { useBudgetStore } from "@/store/budgetStore";
import apiHandler from "@/context/ApiHandler";
import { router } from "expo-router";

// Define types
interface Category {
  id: number;
  name: string;
}

interface CategoryListProps {
  handleCloseBottomSheet: () => void;
  onSelectCategory: (category: Category) => void;
}

interface PayloadType {
  budgetId: string;
  vendorId: string;
  amount: number;
  type: string;
  category: string;
  note: string;
}

const CategoryList: React.FC<CategoryListProps> = ({ handleCloseBottomSheet, onSelectCategory }) => {
  const categories: Category[] = [
    { id: 1, name: "Salary" },
    { id: 2, name: "Material" },
    { id: 3, name: "Client" },
  ];

  return (
    <View className="px-4">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-xl font-bold">Select Category</Text>
      </View>
      
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          className="border-b border-gray-200 py-4"
          onPress={() => {
            onSelectCategory(category);
            handleCloseBottomSheet();
          }}
        >
          <Text className="text-lg">{category.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const PaymentIn: React.FC = () => {
  const { selectedVendor } = useVendorStore();
  const { budget } = useBudgetStore();
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Category state
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [bottomSheetContent, setBottomSheetContent] = useState<"vendor" | "category">("vendor");

  // Payment Date state
  const [paymentDate, setPaymentDate] = useState<dayjs.Dayjs>(dayjs());
  const [openPaymentDatePicker, setOpenPaymentDatePicker] = useState<boolean>(false);

  const snapPoints = ["50%"];

  const handleOpenBottomSheet = useCallback((content: "vendor" | "category") => {
    setBottomSheetContent(content);
    bottomSheetRef.current?.expand();
  }, []);

  const handleCloseBottomSheet = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  // Handle category selection
  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
  };

  // Update payment date and close the modal.
  const handlePaymentDateChange = (date: dayjs.Dayjs) => {
    setPaymentDate(date);
    setOpenPaymentDatePicker(false);
  };

  // Handle transaction submission to the API.
  const handleSubmit = async () => {
    if (!selectedVendor) {
      alert("Please select a vendor");
      return;
    }
    if (!amount) {
      alert("Please enter an amount");
      return;
    }
    if (!selectedCategory) {
      alert("Please select a category");
      return;
    }
    if (!budget?.budgets[0].id) {
      alert("Budget ID is missing");
      return;
    }
    
    const payload: PayloadType = {
      budgetId: budget.budgets[0].id.toString(),
      vendorId: selectedVendor.id.toString(),
      amount: parseFloat(amount),
      type: "Credit",
      category: selectedCategory.name,
      note: note,
    };
    
    console.log(payload);
    try {
      const token = await SecureStore.getItemAsync("AccessToken");
      const response = await apiHandler.post("/budget/add-transaction", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      console.log(response.data);
      router.push('../(expenses)/budget');
      return response.data;
    } catch (error) {
      console.error("Error submitting transaction:", error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-white"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView className="flex-1">
          <ScrollView className="flex-1 px-4 pt-2">
            {/* Header with Payment Date */}
            <View className="flex-row justify-between items-center mt-4">
              <Text className="text-2xl font-bold text-gray-800">Payment In</Text>
              <TouchableOpacity
                onPress={() => setOpenPaymentDatePicker(true)}
                className="flex-row items-center bg-gray-100 px-4 py-2 rounded-lg"
              >
                <Ionicons name="calendar" size={18} color="#6B7280" />
                <Text className="ml-2 text-gray-700">
                  {paymentDate.format("DD/MM/YYYY")}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Vendor Selection Field */}
            <View className="mt-6">
              <Text className="text-lg text-gray-600 mb-2">Select Vendor</Text>
              <TouchableOpacity 
                onPress={() => handleOpenBottomSheet("vendor")}
                className="border border-gray-300 rounded-lg px-4 py-3 bg-gray-50"
              >
                <Text className="text-lg text-gray-800">
                  {selectedVendor ? selectedVendor.VendorName : "Select Vendor"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Category Selection Field */}
            <View className="mt-6">
              <Text className="text-lg text-gray-600 mb-2">Category</Text>
              <TouchableOpacity 
                onPress={() => handleOpenBottomSheet("category")}
                className="border border-gray-300 rounded-lg px-4 py-3 bg-gray-50"
              >
                <Text className="text-lg text-gray-800">
                  {selectedCategory ? selectedCategory.name : "Select Category"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Amount Input Field */}
            <View className="mt-6">
              <Text className="text-lg text-gray-600 mb-2">Amount</Text>
              <TextInput
                placeholder="Enter amount"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                className="border border-gray-300 rounded-lg px-4 py-3 text-lg text-gray-800 bg-gray-50"
              />
            </View>

            {/* Note Input Field */}
            <View className="mt-6">
              <Text className="text-lg text-gray-600 mb-2">Note</Text>
              <TextInput
                placeholder="Enter note"
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={3}
                className="border border-gray-300 rounded-lg px-4 py-3 text-lg text-gray-800 bg-gray-50"
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity 
              onPress={handleSubmit} 
              className="mt-8 py-3 rounded-lg bg-[#FCA311] mb-6"
            >
              <Text className="text-center text-white font-bold text-lg">
                Save
              </Text>
            </TouchableOpacity>
          </ScrollView>

          <BottomSheet
            ref={bottomSheetRef}
            index={-1}
            snapPoints={snapPoints}
            enablePanDownToClose={true}
            backdropComponent={(props) => (
              <BottomSheetBackdrop
                {...props}
                opacity={0.5}
                appearsOnIndex={0}
                disappearsOnIndex={-1}
              />
            )}
          >
            <BottomSheetView className="flex-1">
              {bottomSheetContent === "vendor" ? (
                <VendorList handleCloseBottomSheet={handleCloseBottomSheet} />
              ) : (
                <CategoryList 
                  handleCloseBottomSheet={handleCloseBottomSheet} 
                  onSelectCategory={handleSelectCategory}
                />
              )}
            </BottomSheetView>
          </BottomSheet>

          {/* Payment Date Picker Modal */}
          <Modal visible={openPaymentDatePicker} transparent animationType="slide">
            <View className="flex-1 bg-black/50 justify-center items-center">
              <TouchableWithoutFeedback onPress={() => setOpenPaymentDatePicker(false)}>
                <View className="absolute inset-0" />
              </TouchableWithoutFeedback>
              <View className="bg-white p-5 rounded-lg w-11/12 border border-gray-300 shadow-lg">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-lg font-bold">Select Payment Date</Text>
                  <TouchableOpacity onPress={() => setOpenPaymentDatePicker(false)}>
                    <Ionicons name="close" size={24} color="#000" />
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  mode="single"
                  date={paymentDate.toDate()}
                  onChange={(params: { date: DateType }) => {
                    if (params.date) {
                      handlePaymentDateChange(dayjs(params.date));
                    } else {
                      console.warn("Selected date is null");
                    }
                  }}
                />
              </View>
            </View>
          </Modal>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default PaymentIn;
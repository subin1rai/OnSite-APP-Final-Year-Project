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

const PaymentOut = () => {

  const { selectedVendor } = useVendorStore();
  const {budget} = useBudgetStore();
  const [amount, setAmount] = useState("");
    const [addTransaction, setAddTransaction] = useState("");
  const [note, setNote] = useState("");
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Payment Date state
  const [paymentDate, setPaymentDate] = useState(dayjs());
  const [openPaymentDatePicker, setOpenPaymentDatePicker] = useState(false);

  const snapPoints = ["80%"];

  const handleOpenBottomSheet = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

  const handleCloseBottomSheet = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  // Update payment date and close the modal.
  const handlePaymentDateChange = (date: dayjs.Dayjs) => {
    setPaymentDate(date);
    setOpenPaymentDatePicker(false);
  };

  // Handle transaction submission to the API.
  const handleSubmit = async () => {
    console.log(selectedVendor);
    if (!selectedVendor) {
      alert("Please select a vendor");
      return;
    }
    if (!amount) {
      alert("Please enter an amount");
      return;
    }
    if (!budget?.budgets[0].id) {
      alert("Budget ID is missing");
      return;
    }
    const payload = {
      budgetId: budget.budgets[0].id,
      vendorId: selectedVendor.id,
      amount: parseFloat(amount),
      type: "expense",
      note: note,
    };
    console.log(payload)
    try {
       const token = await SecureStore.getItemAsync("AccessToken");
        const response = await apiHandler.post("/budget/add-transaction", payload,{
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })   ;
        console.log(response.data);
        router.push('../(expenses)/budget')
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
          <ScrollView className="flex-1 px-4 pt-6">
            {/* Payment Date Section */}
            <View className="flex-row justify-between items-center mt-4">
              <Text className="text-lg font-semibold">Payment In</Text>
              <TouchableOpacity
                onPress={() => setOpenPaymentDatePicker(true)}
                className="flex-row items-center bg-gray-300 px-4 py-2 rounded-md"
              >
                <Ionicons name="calendar" size={18} color="#6B7280" />
                <Text className="ml-2 text-gray-700">
                  {paymentDate.format("DD/MM/YYYY")}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Vendor Selection Field */}
            <View className="mt-4">
              <Text className="text-lg text-gray-600 mb-3">Select Vendor</Text>
              <TouchableOpacity onPress={handleOpenBottomSheet}>
                <Text className="border border-gray-300 rounded-md px-4 py-4 text-lg">
                  {selectedVendor ? selectedVendor.VendorName : "Select Vendor"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Amount Input Field */}
            <View className="mt-4">
              <Text className="text-lg text-gray-600 mb-3">Amount</Text>
              <TextInput
                placeholder="Enter amount"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                className="border border-gray-300 rounded-md px-4 py-4 text-lg text-gray-700"
              />
            </View>

            {/* Note Input Field */}
            <View className="mt-4">
              <Text className="text-lg text-gray-600 mb-3">Note</Text>
              <TextInput
                placeholder="Enter note"
                value={note}
                onChangeText={setNote}
                multiline
                className="border border-gray-300 rounded-md px-4 py-4 text-lg text-gray-700"
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity onPress={handleSubmit} className="mt-6 py-4 rounded-md bg-[#FCA311]">
              <Text className="text-center text-white font-semibold text-lg">
                Save
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Bottom Sheet for VendorList with backdrop */}
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
              <VendorList handleCloseBottomSheet={handleCloseBottomSheet} />
            </BottomSheetView>
          </BottomSheet>

          {/* Payment Date Picker Modal */}
          <Modal visible={openPaymentDatePicker} transparent animationType="slide">
            <View className="flex-1 bg-black/50 justify-center items-center">
              {/* Touchable overlay to dismiss the modal when tapping outside */}
              <TouchableWithoutFeedback onPress={() => setOpenPaymentDatePicker(false)}>
                <View className="absolute inset-0" />
              </TouchableWithoutFeedback>
              <View className="bg-white p-5 rounded-lg w-11/12 border border-gray-300 shadow-lg">
                <Text className="mb-4 text-lg font-semibold">Select Payment Date</Text>
                <DateTimePicker
                  mode="single"
                  date={paymentDate.toDate()}
                  onChange={(params) => {
                    if (params.date) {
                      handlePaymentDateChange(dayjs(params.date));
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

export default PaymentOut;

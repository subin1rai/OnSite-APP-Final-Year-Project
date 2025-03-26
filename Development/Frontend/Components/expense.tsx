import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Text,
  View,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { FloatingAction } from "react-native-floating-action";
import AddExpenses from "@/Components/AddExpenses";
import apiHandler from "@/context/ApiHandler";
import { useBudgetStore } from "@/store/budgetStore";
import * as SecureStore from "expo-secure-store";
import dayjs from "dayjs";

const Expense = () => {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const { budget } = useBudgetStore();
  const snapPoints = ["40%"];

  const handleOpenBottomSheet = useCallback(() => {
    bottomSheetRef.current?.expand();
    setIsBottomSheetOpen(true);
  }, []);

  const handleCloseBottomSheet = () => {
    bottomSheetRef.current?.close();
    setIsBottomSheetOpen(false);
  };

  const payload = {
    budgetId: budget?.budgets[0]?.id,
  };

  const fetchTransaction = async () => {
    try {
      if (!payload.budgetId) return;
      if (!refreshing) setLoading(true);
      console.log("Budget id:", payload.budgetId);
      const token = await SecureStore.getItemAsync("AccessToken");
      const response = await apiHandler.post("/budget/transaction", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log("Transaction response:", response);
      setTransaction(response.data);
    } catch (error) {
      console.error("Error fetching transaction:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransaction();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTransaction();
  }, []);

  const transactionsList =
    transaction &&
    transaction.transactions &&
    transaction.transactions.Transaction
      ? transaction.transactions.Transaction
      : [];

  const renderTransactionItem = ({ item }: { item: any }) => (
    <View
      key={item.id}
      className="flex flex-row bg-white justify-between items-center px-4 mx-4 rounded-md mt-2 shadow-sm py-3"
    >
      <View className="gap-2">
        <Text className="text-2xl font-semibold">
          {item.vendor?.VendorName || "No Vendor"}
        </Text>
        <Text className="text-neutral-400 font-medium">
          {item.note || "No Note"}
        </Text>
        <Text className="text-sm text-[#3C3C43]">
          {dayjs(item.createdAt).format("DD MMM YYYY, h:mm A")}
        </Text>
      </View>
      <View>
      <Text className={`text-lg font-medium ${item.type === "inHand" ? "text-green-500" : "text-red-500"}`}>
  NRP. {item.amount}
</Text>
      </View>
    </View>
  );

  return (
    <View className="h-full relative">
      <FlatList
        data={transactionsList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTransactionItem}
        ListEmptyComponent={
          !loading ? (
            <View className="px-4 m-auto pt-28">
              <Text className="text-lg ">No transactions found.</Text>
            </View>
          ) : null
        }
        contentContainerStyle={{ paddingVertical: 10 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FF9500"
            colors={["#FF9500"]}
          />
        }
      />
      {loading && transactionsList.length === 0 && (
        <View className="absolute inset-0 justify-center items-center">
          <ActivityIndicator size="large" color="#FF9500" />
        </View>
      )}

      {/* Floating Action Button - Fixed at Bottom */}
      <View className="absolute bottom-1 right-0">
        <FloatingAction
          overrideWithAction
          actions={[
            {
              text: "Add Transaction",
              icon: require("@/assets/icons/ai.png"), 
              name: "add_transaction",
            },
          ]}
          onPressItem={handleOpenBottomSheet} 
          color="#FF9500"
          buttonSize={56}
          overlayColor="rgba(0, 0, 0, 0.5)" 
        />
      </View>

      {/* Bottom Sheet for Adding Transactions */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        onClose={handleCloseBottomSheet}
        containerStyle={{ zIndex: 20, flex: 1 }}
       
      >
        <BottomSheetView className="px-4">
          {isBottomSheetOpen && (
            <AddExpenses handleCloseBottomSheet={handleCloseBottomSheet} />
          )}
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

export default Expense;

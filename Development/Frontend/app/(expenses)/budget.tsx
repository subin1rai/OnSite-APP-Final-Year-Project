// @/screens/Budget.tsx (or wherever your Budget component is located)
import {
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  Platform,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { images } from "@/constants";
import { useEffect, useState, useCallback } from "react";
import Expense from "@/components/expense";
import Vendors from "@/components/vendors";
import apiHandler from "@/context/ApiHandler";
import AuthService from "@/context/AuthContext";
import { router } from "expo-router";
import { useProjectStore } from "@/store/projectStore";
import { useBudgetStore, BudgetType } from "@/store/budgetStore";

type TabName = "Expense" | "Vendors";

const Budget = () => {
  const { selectedProject } = useProjectStore();
  // Use the budget store from Zustand
  const { budget, setBudget } = useBudgetStore();

  const [activeTab, setActiveTab] = useState<TabName>("Expense");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (selectedProject) {
      fetchBudget();
    }
  }, [selectedProject]);

  const fetchBudget = async () => {
    try {
      if (!selectedProject) return;
      const response = await apiHandler.get(`/project/${selectedProject.id}/budget`);
      if (!response || !response.data) throw new Error("Failed to fetch budget");
      // Store the fetched budget in Zustand
      setBudget(response.data);
    } catch (error) {
      console.error("Error fetching budget:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkTokenAndFetchData = async () => {
    const isExpired = await AuthService.isTokenExpired();
    if (isExpired) {
      await AuthService.removeToken();
      router.replace("../(auth)/sign_in");
      return;
    }
  };

  const handleTabChange = (tabName: TabName) => {
    setActiveTab(tabName);
  };

  // Uncomment and use this if you want to support pull-to-refresh
  // const onRefresh = useCallback(async () => {
  //   setRefreshing(true);
  //   try {
  //     await checkTokenAndFetchData();
  //     await fetchBudget();
  //   } finally {
  //     setRefreshing(false);
  //   }
  // }, [selectedProject]);

  if (isLoading) {
    return (
      <SafeAreaView className="bg-[#ffb133]">
        <View className="flex-1 justify-center items-center">
          <Text className="text-white">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const formatCurrency = (amount: number) => `NRP. ${amount.toLocaleString()}`;

  return (
    <SafeAreaView className="bg-[#ffb133]">
      <View>
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
          {budget && (
            <BlurView
              className="z-10 w-[91%] h-[173px] mt-5 mx-auto rounded-lg border border-neutral-200/25"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 5 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
                elevation: Platform.OS === "android" ? 0 : 5,
                overflow: "hidden",
              }}
              tint="light"
              intensity={80}
            >
              <View className="px-4 flex gap-4 mt-4">
                <Text className="text-3xl font-semibold text-white">
                  {budget.ownerName}
                </Text>
                <View className="flex flex-row justify-between">
                  <View>
                    <Text className="font-medium text-2xl text-white">
                      Budget
                    </Text>
                    <Text className="font-medium text-2xl text-[#C17800]">
                      {formatCurrency(budget.budgets[0]?.amount || 0)}
                    </Text>
                  </View>
                  <View>
                    <Text className="font-medium text-2xl text-white">
                      Budget In Hand
                    </Text>
                    <Text className="font-medium text-2xl text-[#079907]">
                      {formatCurrency(budget.budgets[0]?.inHand || 0)}
                    </Text>
                  </View>
                </View>

                <View className="flex flex-row justify-between">
                  <View>
                    <Text className="font-medium text-2xl text-white">
                      Expenses
                    </Text>
                    <Text className="font-medium text-2xl text-[#FF3B30]">
                      {formatCurrency(
                        (budget.budgets[0]?.amount || 0) - (budget.budgets[0]?.inHand || 0)
                      )}
                    </Text>
                  </View>
                  <View>
                    <Text className="font-medium text-2xl text-white">
                      Remaining Amount
                    </Text>
                    <Text className="font-medium text-2xl text-[#FF9500]">
                      {formatCurrency(budget.budgets[0]?.inHand || 0)}
                    </Text>
                  </View>
                </View>
              </View>
            </BlurView>
          )}

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
                  activeTab === "Expense" ? "#ffd700" : "#D9D9D9",
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
                borderBottomWidth: 2,
                borderBottomColor:
                  activeTab === "Vendors" ? "#ffd700" : "#D9D9D9",
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
          <View className="p-0 m-2 h-[500px]">
            {activeTab === "Expense" ? <Expense /> : <Vendors />}
          </View>
        </View>
      </View>
      {/* Uncomment below if you want pull-to-refresh support */}
      {/* <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#FCA311"
          colors={["#FCA311"]}
        /> */}
    </SafeAreaView>
  );
};

export default Budget;

import { SafeAreaView,Text,TouchableOpacity,View,Platform,RefreshControl} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { images } from "@/constants";
import { useEffect, useState, useCallback } from "react";
import Expense from "@/Components/expense";
import Vendors from "@/Components/vendors";
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
  const isAndroid = Platform.OS === "android";
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
      const response = await apiHandler.get(
        `/project/${selectedProject.id}/budget`
      );
      if (!response || !response.data)
        throw new Error("Failed to fetch budget");
      // Store the fetched budget in Zustand
      setBudget(response.data);
    } catch (error) {
      console.error("Error fetching budget:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const totalBudget = budget?.budgets[0]?.amount || 0;
  const inHandAmount = budget?.budgets[0]?.inHand || 0;
  const expensesAmount = totalBudget - inHandAmount;
  const spentPercentage =
    totalBudget > 0 ? Math.round((expensesAmount / totalBudget) * 100) : 0;

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
        <View
          className={`bg-[#ffb133] h-[180px] w-full z-0 flex ${
            isAndroid ? "mt-10" : ""
          }`}
        >
          <View className={`flex-row justify-between mx-4 items-center ${isAndroid ? "mb-4":""}`}>
           <TouchableOpacity onPress={() => router.back()}>
                      <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
            <Text className="text-2xl text-white font-semibold tracking-wider">
              Budget
            </Text>
            <View />
          </View>

          {budget &&
            (isAndroid ? (
              <View
                className="bg-white w-[91%] mx-auto rounded-2xl p-5"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 6,
                  elevation: 8,
                }}
              >
                {/* Header with Owner Name and Budget Icon */}
                <View className="flex-row justify-between items-center mb-4">
                  <Text
                    className={`font-bold text-gray-800 ${
                      isAndroid ? "text-xl" : "text-2xl"
                    }`}
                  >
                    {budget.ownerName}
                  </Text>
                  <View className="bg-[#ffb133] p-2 rounded-full">
                    <Ionicons name="wallet" size={20} color="white" />
                  </View>
                </View>

                {/* Budget Progress */}
                <View className="mb-4">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-600 text-sm">
                      Budget Utilization
                    </Text>
                    <Text className="font-bold text-gray-800">
                      {spentPercentage}%
                    </Text>
                  </View>
                  <View className="bg-gray-200 rounded-full h-2 overflow-hidden">
                    <View
                      className="bg-[#ffb133] h-full"
                      style={{ width: `${spentPercentage}%` }}
                    />
                  </View>
                </View>

                {/* Budget Metrics */}
                <View className="flex-row justify-between">
                  {/* Total Budget */}
                  <View className="items-center flex-1 p-2 bg-gray-50 rounded-xl">
                    <Text className="text-xs text-gray-600 mb-1">
                      Total Budget
                    </Text>
                    <Text
                      className={`font-bold text-[#C17800] ${
                        isAndroid ? "text-base" : "text-lg"
                      }`}
                    >
                      {formatCurrency(totalBudget)}
                    </Text>
                  </View>

                  {/* Budget In Hand */}
                  <View className="items-center flex-1 p-2 bg-gray-50 rounded-xl mx-2">
                    <Text className="text-xs text-gray-600 mb-1">
                      In Hand
                    </Text>
                    <Text
                      className={`font-bold text-[#079907] ${
                        isAndroid ? "text-base" : "text-lg"
                      }`}
                    >
                      {formatCurrency(inHandAmount)}
                    </Text>
                  </View>

                  {/* Expenses */}
                  <View className="items-center flex-1 p-2 bg-gray-50 rounded-xl">
                    <Text className="text-xs text-gray-600 mb-1">Expenses</Text>
                    <Text
                      className={`font-bold text-[#FF3B30] ${
                        isAndroid ? "text-base" : "text-lg"
                      }`}
                    >
                      {formatCurrency(expensesAmount)}
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <BlurView
              className="z-10 w-[91%] mt-5 mx-auto rounded-2xl border border-neutral-200/25 overflow-hidden"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 5 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
                elevation: 5,
              }}
              tint="light"
              intensity={80}
            >
              <View className="p-5">
                {/* Header with Owner Name and Budget Icon */}
                <View className="flex-row justify-between items-center mb-4">
                  <Text 
                    className={`font-bold text-white ${
                      isAndroid ? "text-xl" : "text-2xl"
                    }`}
                  >
                    {budget.ownerName}
                  </Text>
                  <View className="bg-white/20 p-2 rounded-full">
                    <Ionicons name="wallet" size={20} color="white" />
                  </View>
                </View>
        
                {/* Budget Progress */}
                <View className="mb-4">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-black text-base">Budget Utilization</Text>
                    <Text className="font-bold text-black">
                      {spentPercentage}%
                    </Text>
                  </View>
                  <View className="bg-black rounded-full h-2 overflow-hidden">
                    <View 
                      className="bg-white h-full" 
                      style={{ width: `${spentPercentage}%` }}
                    />
                  </View>
                </View>
        
                {/* Budget Metrics */}
                <View className="flex-row justify-between">
                  {/* Total Budget */}
                  <View className="items-center flex-1 p-2 bg-white/10 rounded-xl">
                    <Text className="text-xs text-black mb-1">Total Budget</Text>
                    <Text 
                      className={`font-bold text-[#C17800] ${
                        isAndroid ? "text-base" : "text-lg"
                      }`}
                    >
                      {formatCurrency(totalBudget)}
                    </Text>
                  </View>
        
                  {/* Budget In Hand */}
                  <View className="items-center flex-1 p-2 bg-white/10 rounded-xl mx-2">
                    <Text className="text-xs text-black mb-1">Remaining</Text>
                    <Text 
                      className={`font-bold text-[#079907] ${
                        isAndroid ? "text-base" : "text-lg"
                      }`}
                    >
                      {formatCurrency(inHandAmount)}
                    </Text>
                  </View>
        
                  {/* Expenses */}
                  <View className="items-center flex-1 p-2 bg-white/10 rounded-xl">
                    <Text className="text-xs text-black mb-1">Expenses</Text>
                    <Text 
                      className={`font-bold text-[#FF3B30] ${
                        isAndroid ? "text-base" : "text-lg"
                      }`}
                    >
                      {formatCurrency(expensesAmount)}
                    </Text>
                  </View>
                </View>
              </View>
            </BlurView>
            ))}

          {/* Custom Tabs Navigation */}
<View 
  className="flex-row mx-4 bg-gray-100 rounded-full p-1 mt-4"
  style={{
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  }}
>
  <TouchableOpacity
    onPress={() => handleTabChange("Expense")}
    className={`flex-1 items-center justify-center py-3 rounded-full ${
      activeTab === "Expense" ? "bg-white" : "bg-transparent"
    }`}
  >
    <Text
      style={{
        fontSize: 14,
        fontWeight: Platform.OS === 'ios' ? '500' : '500',
        color: activeTab === "Expense" ? "black" : "gray",
      }}
    >
      Expense
    </Text>
  </TouchableOpacity>
  <TouchableOpacity
    onPress={() => handleTabChange("Vendors")}
    className={`flex-1 items-center justify-center py-3 rounded-full ${
      activeTab === "Vendors" ? "bg-white" : "bg-transparent"
    }`}
  >
    <Text
      style={{

        fontSize: 14,
        fontWeight: Platform.OS === 'ios' ? '500' : '500',
        color: activeTab === "Vendors" ? "black" : "#3C3C43",
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
    </SafeAreaView>
  );
};

export default Budget;

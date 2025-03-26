import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import apiHandler from '@/context/ApiHandler';
import * as SecureStore from "expo-secure-store";

// Define TypeScript interfaces
interface Summary {
  totalBudget: number;
  totalInHand: number;
  totalExpenses: number;
  totalIncome: number;
  netBalance: number;
  budgetBalance: number;
}

interface CategoryTransaction {
  category: string;
  expense: number;
  income: number;
}

interface MonthlyTransaction {
  month: string;
  expense: number;
  income: number;
}

interface Transaction {
  id: number;
  amount: number;
  type: 'Credit' | 'Debit';
  category: string;
  note: string;
  createdAt: string;
  projectId: number;
  projectName: string;
  budgetId: number;
}

interface Project {
  id: number;
  name: string;
  status: string;
  budget: number;
}

interface ReportData {
  summary: Summary;
  transactionsByCategory: CategoryTransaction[];
  transactionsByMonth: MonthlyTransaction[];
  transactions: Transaction[];
  projects: Project[];
}

interface ChartDataset {
  data: number[];
  color?: (opacity: number) => string;
}

interface BarChartData {
  labels: string[];
  datasets: ChartDataset[];
}

interface PieChartItem {
  name: string;
  amount: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

const PRIMARY_COLOR = '#FDB541';

const Report: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'summary' | 'charts'>('summary');
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (): Promise<void> => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync("AccessToken");
      const response = await apiHandler.get("/report",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response || !response.data) throw new Error("Failed to fetch report");
      setReportData(response.data);
    } catch (error) {
      console.error("Error fetching report:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (balance: number): string => {
    return balance >= 0 ? 'text-green-500' : 'text-red-500';
  };

  const renderSummaryCard = (title: string, amount: number, icon: string, colorClass: string) => (
    <View className="bg-white rounded-lg p-4 flex-1 min-w-[45%]">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-gray-500 text-sm">{title}</Text>
        <FontAwesome5 name={icon} size={16} color={colorClass === 'text-green-500' ? '#10B981' : colorClass === 'text-red-500' ? '#EF4444' : '#6B7280'} />
      </View>
      <Text className={`text-xl font-bold ${colorClass}`}>{formatCurrency(amount)}</Text>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <Text className="mt-4 text-gray-600">Loading report data...</Text>
      </View>
    );
  }

  if (!reportData) {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-gray-50">
        <FontAwesome5 name="exclamation-circle" size={40} color="#EF4444" />
        <Text className="mt-4 text-lg font-medium text-gray-800">Failed to load report</Text>
        <Text className="mt-2 text-center text-gray-600">We couldn't load your financial data. Please try again later.</Text>
        <TouchableOpacity 
          className="mt-6 py-3 px-6 rounded-lg"
          style={{ backgroundColor: PRIMARY_COLOR }}
          onPress={fetchData}
        >
          <Text className="text-white font-medium">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { summary, transactionsByCategory, transactionsByMonth, projects } = reportData;

  // Data for charts
  const categoryChartData: PieChartItem[] = transactionsByCategory.map((item, index) => ({
    name: item.category,
    amount: Math.abs(item.income || item.expense),
    color: [
      PRIMARY_COLOR, '#10B981', '#F59E0B', '#EF4444', 
      '#8B5CF6', '#EC4899', '#3B82F6', '#06B6D4'
    ][index % 8],
    legendFontColor: '#7F7F7F',
    legendFontSize: 12,
  }));


  const monthlyChartData: BarChartData = {
    labels: transactionsByMonth.flatMap(item => [`${item.month}\nIncome`, `${item.month}\nExpense`]),
    datasets: [
      {
        data: transactionsByMonth.flatMap(item => [item.income, item.expense]),
        color: (opacity = 1, _index?: number) => {
          // Alternate colors between green (income) and red (expense)
          return _index !== undefined && _index % 2 === 0 
            ? `rgba(16, 185, 129, ${opacity})` // Green for income
            : `rgba(239, 68, 68, ${opacity})`; // Red for expense
        }
      }
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(253, 181, 65, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.6,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="pb-4 px-4 flex-row items-center justify-between">
        <View/>
        <Text className="text-black text-2xl font-semibold">Financial Report</Text>
        <Ionicons name="document-text-outline" size={24} color="black" />
      </View>

      {/* Navigation Tabs */}
      <View className="flex-row bg-gray-50 border-b border-gray-200">
        <TouchableOpacity 
          className={`flex-1 py-3 ${activeTab === 'summary' ? 'border-b-2' : ''}`}
          style={{ borderBottomColor: activeTab === 'summary' ? PRIMARY_COLOR : 'transparent' }}
          onPress={() => setActiveTab('summary')}
        >
          <Text style={{ color: activeTab === 'summary' ? PRIMARY_COLOR : '#6B7280' }} className="text-center font-medium">Summary</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className={`flex-1 py-3 ${activeTab === 'charts' ? 'border-b-2' : ''}`}
          style={{ borderBottomColor: activeTab === 'charts' ? PRIMARY_COLOR : 'transparent' }}
          onPress={() => setActiveTab('charts')}
        >
          <Text style={{ color: activeTab === 'charts' ? PRIMARY_COLOR : '#6B7280' }} className="text-center font-medium">Charts</Text>
        </TouchableOpacity>
      </View>

      {/* Summary Tab */}
      {activeTab === 'summary' && (
        <View className="p-4">
          {/* Project Summary */}
          <View className="bg-white rounded-lg p-4 mb-4">
            <Text className="text-lg font-bold text-gray-800 mb-4">Project Summary</Text>
            <View className="bg-amber-50 p-3 rounded-lg mb-3">
              <Text className="text-gray-800 font-medium">Total Budget</Text>
              <Text style={{ color: PRIMARY_COLOR }} className="text-2xl font-bold mt-1">{formatCurrency(summary.totalBudget)}</Text>
              <View className="h-2 bg-gray-200 rounded-full mt-2">
                <View 
                  className="h-2 rounded-full" 
                  style={{ 
                    width: `${Math.min(100, (summary.totalExpenses / summary.totalBudget) * 100)}%`,
                    backgroundColor: PRIMARY_COLOR 
                  }}
                />
              </View>
              <Text className="text-xs text-gray-500 mt-1">
                {formatCurrency(summary.totalExpenses)} used ({((summary.totalExpenses / summary.totalBudget) * 100).toFixed(1)}%)
              </Text>
            </View>
            <Text className="font-medium text-gray-800">Budget Balance</Text>
            <Text style={{ color: PRIMARY_COLOR }} className="text-xl font-bold">{formatCurrency(summary.budgetBalance)}</Text>
          </View>

          {/* Financial Cards */}
          <Text className="text-lg font-bold text-gray-800 mb-2">Financial Overview</Text>
          <View className="flex-row flex-wrap gap-3 mb-3">
            {renderSummaryCard('Income', summary.totalIncome, 'arrow-up', 'text-green-500')}
            {renderSummaryCard('Expenses', summary.totalExpenses, 'arrow-down', 'text-red-500')}
          </View>
          <View className="flex-row flex-wrap gap-3">
            {renderSummaryCard('Net Balance', summary.netBalance, 'exchange-alt', getStatusColor(summary.netBalance))}
            {renderSummaryCard('In Hand', summary.totalInHand, 'wallet', getStatusColor(summary.totalInHand))}
          </View>
        </View>
      )}

      {/* Charts Tab */}
      {activeTab === 'charts' && (
        <View className="p-4">
          <Text className="text-lg font-bold text-gray-800 mb-4">Monthly Analysis</Text>
          <View className="bg-white rounded-lg p-4 mb-6">
            <Text className="text-gray-600 mb-4">Income vs Expenses</Text>
            <BarChart
              data={monthlyChartData}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              verticalLabelRotation={0}
              showBarTops={false}
              fromZero={true}
              withInnerLines={false}
              yAxisLabel="रु "
              yAxisSuffix=""
              style={{ borderRadius: 8 }}
            />
            <View className="flex-row justify-center mt-4">
              <View className="flex-row items-center mr-4">
                <View className="w-3 h-3 rounded-full bg-green-500 mr-1" />
                <Text className="text-xs text-gray-600">Income</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-red-500 mr-1" />
                <Text className="text-xs text-gray-600">Expenses</Text>
              </View>
            </View>
          </View>

          <Text className="text-lg font-bold text-gray-800 mb-4">Category Breakdown</Text>
          <View className="bg-white rounded-lg p-4">
            <PieChart
              data={categoryChartData}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute={false}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Report;
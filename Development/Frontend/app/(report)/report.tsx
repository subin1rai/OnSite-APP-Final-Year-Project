import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView, Platform, Alert } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import apiHandler from '@/context/ApiHandler';
import * as SecureStore from "expo-secure-store";
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { captureRef } from 'react-native-view-shot';
import { StatusBar } from 'expo-status-bar';

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
  const [exporting, setExporting] = useState<boolean>(false);
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
  const generatePDF = async () => {
    try {
      setExporting(true);
      
      // Generate HTML content for PDF
      const htmlContent = await generateHTMLContent();
      
      // Create PDF file
      const { uri } = await Print.printToFileAsync({ 
        html: htmlContent,
        base64: false
      });
      
    
      if (Platform.OS === 'ios') {
        await Sharing.shareAsync(uri);
      } 
      
      else {
        const pdfName = `financial_report_${new Date().getTime()}.pdf`;
        const destination = FileSystem.documentDirectory + pdfName;
        
        await FileSystem.copyAsync({
          from: uri,
          to: destination
        });
        
        await Sharing.shareAsync(destination, {
          mimeType: 'application/pdf',
          dialogTitle: 'Download Financial Report',
          UTI: 'com.adobe.pdf'
        });
      }
      
      setExporting(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate the report. Please try again.');
      setExporting(false);
    }
  };


  const generateHTMLContent = async () => {
    if (!reportData) return '';
    
    const { summary, transactionsByCategory, transactionsByMonth, projects } = reportData;
    
    // Create charts for PDF using chart.js
    const monthLabels = transactionsByMonth.map(item => item.month);
    const incomeData = transactionsByMonth.map(item => item.income);
    const expenseData = transactionsByMonth.map(item => item.expense);
    
    // Generate pie chart data
    const pieChartColors = [
      '#FDB541', '#10B981', '#F59E0B', '#EF4444', 
      '#8B5CF6', '#EC4899', '#3B82F6', '#06B6D4'
    ];
    
    const pieChartData = transactionsByCategory.map((item, index) => ({
      category: item.category,
      value: Math.abs(item.income || item.expense),
      color: pieChartColors[index % pieChartColors.length]
    }));

    // Current date for the report
    const currentDate = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    return `
      <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Financial Report</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"></script>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      margin: 0;
      padding: 0;
      color: #333;
      background-color: #fff;
      line-height: 1.5;
    }
    .container {
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      border-bottom: 2px solid #2C3E50;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo-area {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .report-title {
      font-size: 28px;
      font-weight: bold;
      color: #2C3E50;
      margin: 0;
    }
    .report-date {
      font-size: 14px;
      color: #7F8C8D;
      margin-top: 5px;
    }
    .section {
      margin-bottom: 40px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 20px;
      color: #2C3E50;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 1px solid #EAEAEA;
    }
    .summary-box {
      background-color: #F8F9FA;
      border-left: 4px solid #3498DB;
      padding: 15px;
      margin-bottom: 20px;
    }
    .metrics-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      margin-bottom: 20px;
    }
    .metric-box {
      flex: 1;
      min-width: calc(50% - 15px);
      background-color: #F8F9FA;
      padding: 15px;
      border-radius: 5px;
    }
    .metric-title {
      font-size: 14px;
      color: #7F8C8D;
      margin: 0 0 5px 0;
    }
    .metric-value {
      font-size: 22px;
      font-weight: bold;
      margin: 0;
    }
    .positive {
      color: #27AE60;
    }
    .negative {
      color: #E74C3C;
    }
    .neutral {
      color: #3498DB;
    }
    .budget-progress {
      margin: 15px 0;
    }
    .progress-bar-container {
      height: 10px;
      background-color: #EAEAEA;
      border-radius: 5px;
      overflow: hidden;
    }
    .progress-bar {
      height: 100%;
      background-color: #3498DB;
    }
    .progress-text {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #7F8C8D;
      margin-top: 5px;
    }
    .chart-container {
      height: 300px;
      margin: 20px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      padding: 12px 15px;
      text-align: left;
      border-bottom: 1px solid #EAEAEA;
    }
    th {
      background-color: #F8F9FA;
      font-weight: bold;
      color: #2C3E50;
    }
    tr:nth-child(even) {
      background-color: #F8F9FA;
    }
    .chart-legend {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 15px;
      margin-top: 15px;
    }
    .legend-item {
      display: flex;
      align-items: center;
    }
    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-right: 5px;
    }
    .page-break {
      page-break-before: always;
    }
      .logoimag{
        height: 100px;
        width: 100px;
      }
    .footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #EAEAEA;
      text-align: center;
      font-size: 12px;
      color: #7F8C8D;
    }
    @media print {
      body {
        font-size: 12pt;
      }
      .section {
        page-break-inside: avoid;
      }
      .page-break {
        page-break-before: always;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="logo-area">
        <div>
          <h1 class="report-title">Financial Report</h1>
          <p class="report-date">${currentDate}</p>
        </div>
        <div >
          <img class="logoimag" src="https://res.cloudinary.com/diag9maev/image/upload/v1743001208/0_dld0zx.png" alt="Company Logo" />
        </div>
      </div>
    </div>
    
    <!-- Executive Summary -->
    <div class="section">
      <h2 class="section-title">Executive Summary</h2>
      <div class="summary-box">
        <p>This report provides a comprehensive overview of the financial status as of ${currentDate}. Key metrics show a ${summary.netBalance >= 0 ? 'positive' : 'negative'} trend with budget utilization at ${((summary.totalExpenses / summary.totalBudget) * 100).toFixed(1)}% and a ${summary.budgetBalance >= 0 ? 'healthy' : 'concerning'} balance maintained.</p>
      </div>
      
      <div class="metrics-grid">
        <div class="metric-box">
          <h3 class="metric-title">Total Budget</h3>
          <p class="metric-value neutral">${formatCurrency(summary.totalBudget)}</p>
          <div class="budget-progress">
            <div class="progress-bar-container">
              <div class="progress-bar" style="width: ${Math.min(100, (summary.totalExpenses / summary.totalBudget) * 100)}%;"></div>
            </div>
            <div class="progress-text">
              <span>${formatCurrency(summary.totalExpenses)} used (${((summary.totalExpenses / summary.totalBudget) * 100).toFixed(1)}%)</span>
              <span>${formatCurrency(summary.budgetBalance)} remaining</span>
            </div>
          </div>
        </div>
        <div class="metric-box">
          <h3 class="metric-title">Net Balance</h3>
          <p class="metric-value ${summary.netBalance >= 0 ? 'positive' : 'negative'}">${formatCurrency(summary.netBalance)}</p>
        </div>
      </div>
    </div>
    
    
    <!-- Projects Overview -->
    <div class="section">
      <h2 class="section-title">Projects Overview</h2>
      <table>
        <thead>
          <tr>
            <th>Project</th>
            <th>Status</th>
            <th>Budget</th>
          </tr>
        </thead>
        <tbody>
          ${projects.map(project => `
            <tr>
              <td>${project.name}</td>
              <td>${project.status}</td>
              <td>${formatCurrency(project.budget)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <p>This report is confidential and intended for internal use only.</p>
      <p>Generated automatically on ${currentDate}. For questions, please contact finance@company.com</p>
    </div>
  </div>

  <script>
    // Monthly Income vs Expenses Chart
    const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');
    new Chart(monthlyCtx, {
      type: 'bar',
      data: {
        labels: ${JSON.stringify(monthLabels)},
        datasets: [
          {
            label: 'Income',
            data: ${JSON.stringify(incomeData)},
            backgroundColor: '#27AE60',
            borderColor: '#27AE60',
            borderWidth: 1
          },
          {
            label: 'Expenses',
            data: ${JSON.stringify(expenseData)},
            backgroundColor: '#E74C3C',
            borderColor: '#E74C3C',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '₹' + value.toLocaleString('en-IN');
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });

    // Category Breakdown Chart
    const categoryCtx = document.getElementById('categoryChart').getContext('2d');
    new Chart(categoryCtx, {
      type: 'doughnut',
      data: {
        labels: ${JSON.stringify(pieChartData.map(item => item.category))},
        datasets: [{
          data: ${JSON.stringify(pieChartData.map(item => item.value))},
          backgroundColor: ${JSON.stringify(pieChartData.map(item => item.color))},
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  </script>
</body>
</html>
    `;
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
          return _index !== undefined && _index % 2 === 0 
            ? `rgba(16, 185, 129, ${opacity})` 
            : `rgba(239, 68, 68, ${opacity})`; 
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
        <TouchableOpacity onPress={generatePDF}>
        <Ionicons name="document-text-outline" size={24} color="black" />
        </TouchableOpacity>
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
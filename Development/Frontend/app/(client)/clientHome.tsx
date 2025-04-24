import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Image,
  RefreshControl,
  TextInput,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import AuthService from "@/context/AuthContext";
import * as SecureStore from "expo-secure-store";
import apiHandler from "@/context/ApiHandler";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { icons } from "@/constants";
import { useProjectStore } from "@/store/projectStore";

interface Transaction {
  id: number;
  amount: number;
  type: "Credit" | "Debit";
  note: string;
  category: string;
  createdAt: string;
}

interface Budget {
  id: number;
  amount: number;
  inHand: number;
  Transaction: Transaction[];
}

interface Project {
  id: number;
  projectName: string;
  ownerName: string;
  location: string;
  startDate: string;
  endDate: string;
  status: string;
  budgets: Budget[];
}
interface User {
  shareid: number;
}

const clientHome = () => {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const screenWidth = Dimensions.get('window').width;
  const fetchUser = async () => {
    const token = await SecureStore.getItemAsync("AccessToken");
    const response = await apiHandler.get("/user/getUser", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    setUser(response.data.user);
  };

  const fetchDetails = async () => {
    try {
      const token = await SecureStore.getItemAsync("AccessToken");
      const response = await apiHandler.get("/client", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const { projects } = response.data;
      if (projects && projects.length > 0) {
        useProjectStore.getState().setSelectedProject(projects[0]);
        setProjects(projects);
        setActiveProject(projects[0]);
      } else {
        setProjects([]);
        setActiveProject(null);
      }
    } catch (error) {
      console.error("Error fetching client projects:", error);
      setProjects([]);
      setActiveProject(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDetails();
  }, []);

  useEffect(() => {
    fetchDetails();
    fetchUser();
    console.log(user);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const calculateDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "ongoing":
      case "onGoing":
        return "bg-green-500";
      case "completed":
        return "bg-blue-500";
      case "delayed":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const getLatestTransactions = (project: Project) => {
    if (!project.budgets || project.budgets.length === 0) return [];

    const transactions = project.budgets[0].Transaction || [];
    return transactions
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  };

  const renderLatestTransactions = () => {
    if (!activeProject) return null;

    const transactions = getLatestTransactions(activeProject);

    if (transactions.length === 0) {
      return (
        <View className="px-4 pb-4 items-center">
          <Text className="text-gray-500">No transactions found</Text>
        </View>
      );
    }

    return (
      <View className="mt-4">
        {transactions.map((transaction) => (
          <View
            key={transaction.id}
            className="flex-row justify-between items-center p-3 border-b border-gray-100"
          >
            <View className="flex-row items-center">
              <View
                className={`w-8 h-8 rounded-full ${
                  transaction.type === "Credit" ? "bg-green-100" : "bg-red-100"
                } items-center justify-center mr-3`}
              >
                <Ionicons
                  name={
                    transaction.type === "Credit" ? "arrow-up" : "arrow-down"
                  }
                  size={16}
                  color={transaction.type === "Credit" ? "#10b981" : "#ef4444"}
                />
              </View>
              <View>
                <Text className="font-medium">{transaction.category}</Text>
                <Text className="text-xs text-gray-500">
                  {transaction.note || "No description"}
                </Text>
              </View>
            </View>
            <View className="flex items-end">
              <Text
                className={`font-bold ${
                  transaction.type === "Credit"
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {transaction.type === "Credit" ? "+" : "-"} Rs.{" "}
                {transaction.amount}
              </Text>
              <Text className="text-xs text-gray-500">
                {new Date(transaction.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderProjectCard = ({ item }: { item: Project }) => {
    const budget = item.budgets[0];
    const total = budget?.amount || 0;
    const inHand = budget?.inHand || 0;
    const used = total - inHand;
    const progress = total ? Math.min(Math.max(used / total, 0), 1) : 0;
    const daysRemaining = calculateDaysRemaining(item.endDate);
    const isActive = activeProject?.id === item.id;

    return (
      <TouchableOpacity
        onPress={() => setActiveProject(item)}
        style={{ width: screenWidth * 0.85 }}
        className={`p-4 mr-4 rounded-lg  ${
          isActive ? "bg-yellow-50 border-2 border-yellow-400" : "bg-white"
        }`}
      >
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text className="text-lg font-bold">{item.projectName}</Text>
            <Text className="text-sm text-gray-600">{item.location}</Text>
          </View>
          <View
            className={`px-2 py-1 rounded-full ${getStatusColor(item.status)}`}
          >
            <Text className="text-xs text-white font-medium">
              {item.status === "onGoing" ? "Ongoing" : item.status}
            </Text>
          </View>
        </View>

        <View className="mt-4">
          <View className="flex-row justify-between mb-1">
            <Text className="text-sm text-gray-500">Budget Progress</Text>
            <Text className="text-sm font-medium">
              {Math.round(progress * 100)}%
            </Text>
          </View>

          <View className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <View
              className="h-full bg-yellow-400 rounded-full"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </View>
        </View>

        <View className="flex-row justify-between mt-4">
          <View>
            <Text className="text-xs text-gray-500">Total Budget</Text>
            <Text className="font-bold">Rs. {total}</Text>
          </View>
          <View>
            <Text className="text-xs text-gray-500">Remaining</Text>
            <Text className={`font-bold ${inHand < 0 ? "text-red-500" : ""}`}>
              Rs. {inHand}
            </Text>
          </View>
        
        </View>
      </TouchableOpacity>
    );
  };

  // Check if loading is true and show loading indicator
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#facc15" />
        <Text className="mt-4 text-gray-600">Loading your projects...</Text>
      </View>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <View className="flex-1 bg-gray-50">
        {/* Header for Empty State */}
        <View className="px-4 pt-12 pb-2">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-xl font-bold">My Projects</Text>
              <Text className="text-gray-700">Welcome to Construction App</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("../(notification)/notification")}
            >
              <Image source={icons.bell} className="w-8 h-8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Empty State Content */}
        <View className="flex-1 justify-center items-center px-6">
          <View className="bg-gray-100 w-full rounded-2xl p-8 items-center">
            {/* Sad Face Icon */}
            <View className="w-20 h-20 rounded-full bg-orange-100 justify-center items-center mb-6">
              <Ionicons name="sad-outline" size={40} color="#f97316" />
            </View>

            {/* No Projects Message */}
            <Text className="text-2xl font-bold text-gray-800 mb-4 text-center">
              No active projects yet!
            </Text>

            <Text className="text-gray-600 text-center mb-6">
              Start by creating or joining a project to begin managing your
              construction progress.
            </Text>

            <Text className="text-gray-600 text-center mb-8">
              Pro Tip: You can invite others using your share ID.
            </Text>

            <Text className="text-black pb-2 font-semibold text-lg">
              Invite Code
            </Text>
            <TouchableOpacity className="bg-[#ffb133] w-full py-3 rounded-xl items-center mb-6">
              <Text className="text-white font-semibold text-2xl tracking-tighter">
                {user?.shareid}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 pt-12 pb-2">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-xl font-bold">My Projects</Text>
            <Text className="text-gray-700">
              Welcome back ! {activeProject?.ownerName}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("../(notification)/notification")}
          >
            <Image source={icons.bell} className="w-8 h-8" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FCA311"]}
            tintColor="#FCA311"
          />
        }
      >
        {/* Projects Horizontal List - Fixed width to be fully responsive */}
        <View className="mt-4 h-[200px] w-full">
          <FlatList
            data={projects}
            renderItem={renderProjectCard}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 16, paddingRight: 6 }}
            style={{ width: '100%' }}
          />
        </View>

        {/* Active Project Details */}
        {activeProject && (
          <View className="mt-6 px-4">
            <View className="bg-white rounded-lg p-4 mb-4">
              <View className="flex-row justify-between items-center mb-3">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-full bg-yellow-100 items-center justify-center mr-3">
                    <Ionicons
                      name="business-outline"
                      size={20}
                      color="#facc15"
                    />
                  </View>
                  <View>
                    <Text className="font-bold text-lg">
                      {activeProject.projectName}
                    </Text>
                    <View
                      className={`px-2 py-0.5 rounded-full ${getStatusColor(
                        activeProject.status
                      )} self-start mt-1`}
                    >
                      <Text className="text-xs text-white font-medium">
                        {activeProject.status === "onGoing"
                          ? "Ongoing"
                          : activeProject.status}
                      </Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  className="p-2 bg-gray-100 rounded-full"
                  onPress={() => router.push("/(threeDmodel)/mainModel")}
                >
                  <Image source={icons.three} className="w-8 h-8" />
                </TouchableOpacity>
              </View>

              <View className="flex-row flex-wrap mt-3 bg-gray-50 p-3 rounded-lg">
                <View className="w-1/2 mb-3 flex-row items-center">
                  <Ionicons name="person-outline" size={16} color="#9ca3af" />
                  <View className="ml-2">
                    <Text className="text-gray-500 text-xs">Owner</Text>
                    <Text className="font-medium">
                      {activeProject.ownerName}
                    </Text>
                  </View>
                </View>
                <View className="w-1/2 mb-3 flex-row items-center">
                  <Ionicons name="location-outline" size={16} color="#9ca3af" />
                  <View className="ml-2">
                    <Text className="text-gray-500 text-xs">Location</Text>
                    <Text className="font-medium">
                      {activeProject.location}
                    </Text>
                  </View>
                </View>
                <View className="w-1/2 mb-1 flex-row items-center">
                  <Ionicons name="calendar-outline" size={16} color="#9ca3af" />
                  <View className="ml-2">
                    <Text className="text-gray-500 text-xs">Start Date</Text>
                    <Text className="font-medium">
                      {formatDate(activeProject.startDate)}
                    </Text>
                  </View>
                </View>
                <View className="w-1/2 mb-1 flex-row items-center">
                  <Ionicons name="flag-outline" size={16} color="#9ca3af" />
                  <View className="ml-2">
                    <Text className="text-gray-500 text-xs">End Date</Text>
                    <Text className="font-medium">
                      {formatDate(activeProject.endDate)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View className="bg-white rounded-lg p-4 mb-6">
              <Text className="font-bold text-lg mb-3">Financial Summary</Text>

              {activeProject.budgets && activeProject.budgets.length > 0 && (
                <View>
                  <View className="flex-row justify-between items-center mb-2">
                    <View className="flex-row items-center">
                      <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-2">
                        <FontAwesome5
                          name="money-bill-wave"
                          size={16}
                          color="#3b82f6"
                        />
                      </View>
                      <Text>Total Budget</Text>
                    </View>
                    <Text className="font-bold">
                      Rs. {activeProject.budgets[0].amount}
                    </Text>
                  </View>

                  <View className="flex-row justify-between items-center mb-2">
                    <View className="flex-row items-center">
                      <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center mr-2">
                        <MaterialIcons
                          name="account-balance-wallet"
                          size={16}
                          color="#10b981"
                        />
                      </View>
                      <Text>Remaining Balance</Text>
                    </View>
                    <Text
                      className={`font-bold ${
                        activeProject.budgets[0].inHand < 0
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                    >
                      Rs. {activeProject.budgets[0].inHand}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            <View className="bg-white rounded-lg p-4 mb-4">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="font-bold text-lg">Recent Transactions</Text>
                <TouchableOpacity>
                  <Text className="text-yellow-500 text-sm">See All</Text>
                </TouchableOpacity>
              </View>
              {renderLatestTransactions()}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default clientHome;
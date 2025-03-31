import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  RefreshControl,
  Image,
  Pressable,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { icons } from "@/constants";
import { useProjectStore } from "@/store/projectStore";
import apiHandler from "@/context/ApiHandler";
import { useTaskStore } from "@/store/taskStore";
const { width } = Dimensions.get("window");

const Project_home = () => {
  const router = useRouter();
  const { selectedProject } = useProjectStore();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const horizontalScrollRef = useRef<ScrollView | null>(null);
  const { tasks, projectProgress, setTasks, setProjectProgress } = useTaskStore();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTasks().then(() => {
      setRefreshing(false);
    });
  }, []);

  // Calculate progress based on completed vs total tasks
  const calculateProgress = useCallback((taskList) => {
    if (!taskList || taskList.length === 0) return 0;
    
    const completedTasks = taskList.filter(task => task.status === "Completed").length;
    const totalTasks = taskList.length;
    
    // Calculate percentage and round to nearest integer
    const percentage = Math.round((completedTasks / totalTasks) * 100);
    return percentage;
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await apiHandler.post("/task", {
        projectId: selectedProject?.id,
      });
      const taskData = response.data || [];
      setTasks(taskData);
      
      // Calculate and set project progress
      const progress = calculateProgress(taskData);
      setProjectProgress(progress);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    }
  };

  useEffect(() => {
    if (selectedProject?.id) {
      fetchTasks();
    }
  }, [selectedProject]);

  const filteredTasksByStatus = (status) => {
    return tasks.filter((task) => task.status === status);
  };
  const activeTaskCount = filteredTasksByStatus("inProgress").length;

  // Function to determine color based on progress
  const getProgressColor = (progress) => {
    if (progress >= 75) return "#10B981"; // Green for high progress
    if (progress >= 50) return "#F59E0B"; // Yellow for medium progress
    if (progress >= 25) return "#F97316"; // Orange for low progress
    return "#EF4444"; // Red for very low progress
  };

  if (!selectedProject) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text>No project data available.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ flex: 1 }}>
        {/* Header & Project Details */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Pressable onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </Pressable>
            <Text style={{ fontSize: 20, fontWeight: "500" }}>
              {selectedProject.projectName}
            </Text>
            <Image source={icons.bell} style={{ width: 32, height: 32 }} />
          </View>

          {/* Enhanced Project Details Card */}
          <View
            style={{
              backgroundColor: "#FEEDCF",
              marginTop: 10,
              padding: 16,
              borderRadius: 12,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            {/* Client Info Section */}
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <View style={{ flex: 3 }}>
                <Text
                  style={{ fontSize: 15, fontWeight: "600", color: "#6B7280" }}
                >
                  Client Name
                </Text>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "bold",
                    marginTop: 4,
                    marginBottom: 12,
                  }}
                >
                  {selectedProject.ownerName}
                </Text>

                <View style={{ marginTop: 4 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                  >
                    <Image
                      source={icons.point}
                      style={{ width: 18, height: 18 }}
                    />
                    <Text
                      style={{ fontSize: 16, marginLeft: 8, color: "#4B5563" }}
                    >
                      {selectedProject.location || "Not specified"}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="calendar" size={16} color="#6B7280" />
                    <Text
                      style={{ fontSize: 16, marginLeft: 8, color: "#4B5563" }}
                    >
                      {selectedProject.startDate
                        ? new Date(
                            selectedProject.startDate
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Not specified"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Fixed Progress Circle */}
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Circular progress indicator */}
                <View
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: 35,
                    borderWidth: 6,
                    justifyContent: "center",
                    alignItems: "center",
                    borderColor: "#F3F4F6",
                    ...(projectProgress >= 0 && { borderLeftColor: getProgressColor(projectProgress) }),
                    ...(projectProgress >= 25 && { borderBottomColor: getProgressColor(projectProgress) }),
                    ...(projectProgress >= 50 && { borderRightColor: getProgressColor(projectProgress) }),
                    ...(projectProgress >= 75 && { borderTopColor: getProgressColor(projectProgress) }),
                    transform: [{ rotate: "45deg" }],
                  }}
                >
                  <View
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 26,
                      backgroundColor: "#FEEDCF",
                      justifyContent: "center",
                      alignItems: "center",
                      transform: [{ rotate: "-45deg" }],
                    }}
                  >
                    <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                      {projectProgress}%
                    </Text>
                  </View>
                </View>
                <Text style={{ marginTop: 8, color: "#4B5563", fontSize: 14 }}>
                  Progress
                </Text>
              </View>
            </View>

            {/* Project status tags */}
            <View style={{ flexDirection: "row", marginTop: 12 }}>
              <View
                style={{
                  backgroundColor: projectProgress >= 50 
                    ? "rgba(236, 253, 245, 0.8)" 
                    : "rgba(254, 226, 226, 0.8)",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  marginRight: 8,
                }}
              >
                <Text
                  style={{ 
                    color: projectProgress >= 50 ? "#065F46" : "#991B1B", 
                    fontSize: 13, 
                    fontWeight: "500" 
                  }}
                >
                  {projectProgress >= 50 ? "On Schedule" : "Behind Schedule"}
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: "rgba(254, 243, 199, 0.8)",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                }}
              >
                <Text
                  style={{ color: "#92400E", fontSize: 13, fontWeight: "500" }}
                >
                  {activeTaskCount} Active Task
                  {activeTaskCount !== 1 ? "s" : ""}
                </Text>
              </View>
            </View>
          </View>

          {/* Actions section */}
          <Text style={{ marginTop: 12, fontSize: 24, fontWeight: "600" }}>
            Action
          </Text>
          <View className="flex-row justify-between mt-4">
            <TouchableOpacity
              className="items-center gap-2 justify-center"
              onPress={() => router.push("../(attendance)/attendance_home")}
            >
              <View className="bg-[#FEEDCF] p-6 rounded-md items-center gap-2">
                <Image source={icons.vendor} className="w-10 h-10" />
              </View>
              <Text>Attendance</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="items-center gap-2"
              onPress={() => router.push("../(threeDmodel)/mainModel")}
            >
              <View className="bg-[#FEEDCF] p-6 rounded-md items-center gap-2">
                <Image source={icons.threed} className="w-10 h-10" />
              </View>
              <Text>3D</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="items-center gap-2"
              onPress={() => router.push("../(expenses)/budget")}
            >
              <View className="bg-[#FEEDCF] p-6 rounded-md items-center gap-2">
                <Image source={icons.budget} className="w-10 h-10" />
              </View>
              <Text>Budget</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="items-center gap-2"
              onPress={() => router.push("/(project)/all_files")}
            >
              <View className="bg-[#FEEDCF] p-6 rounded-md items-center gap-2">
                <Image source={icons.doc} className="w-10 h-10" />
              </View>
              <Text>Document</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Bar and Content remaining code... */}
        <View
          style={{
            backgroundColor: "#F9FAFB",
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 4,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              backgroundColor: "#F3F4F6",
              borderRadius: 8,
              padding: 4,
            }}
          >
            <Pressable
              style={{
                flex: 1,
                paddingVertical: 10,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: activeTab === 0 ? "white" : "transparent",
                borderRadius: 6,
                shadowColor: activeTab === 0 ? "#000" : "transparent",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: activeTab === 0 ? 0.1 : 0,
                shadowRadius: 2,
                elevation: activeTab === 0 ? 1 : 0,
              }}
              onPress={() => {
                setActiveTab(0);
                horizontalScrollRef.current?.scrollTo({ x: 0, animated: true });
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons
                  name="location-outline"
                  size={16}
                  color={activeTab === 0 ? "#000" : "#6B7280"}
                />
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "600",
                    color: activeTab === 0 ? "#000" : "#6B7280",
                    marginLeft: 6,
                  }}
                >
                  Site
                </Text>
              </View>
            </Pressable>
            <Pressable
              style={{
                flex: 1,
                paddingVertical: 10,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: activeTab === 1 ? "white" : "transparent",
                borderRadius: 6,
                shadowColor: activeTab === 1 ? "#000" : "transparent",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: activeTab === 1 ? 0.1 : 0,
                shadowRadius: 2,
                elevation: activeTab === 1 ? 1 : 0,
              }}
              onPress={() => {
                setActiveTab(1);
                horizontalScrollRef.current?.scrollTo({
                  x: width,
                  animated: true,
                });
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons
                  name="list-outline"
                  size={16}
                  color={activeTab === 1 ? "#000" : "#6B7280"}
                />
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "600",
                    color: activeTab === 1 ? "#000" : "#6B7280",
                    marginLeft: 6,
                  }}
                >
                  Tasks
                </Text>
              </View>
            </Pressable>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Enhanced Swipeable Tabs Content */}
          <ScrollView
            ref={horizontalScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const newIndex = Math.round(
                event.nativeEvent.contentOffset.x / width
              );
              setActiveTab(newIndex);
            }}
            style={{ flex: 1 }}
          >
            {/* Site Tab Content */}
            <View
              style={{
                width: width,
                flex: 1,
                backgroundColor: "white",
                padding: 16,
              }}
            >
              {/* Site Details Card */}
              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                  borderWidth: 1,
                  borderColor: "#F3F4F6",
                }}
              >
                <View style={{ flexDirection: "row", marginBottom: 12 }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      backgroundColor: "#E0F2FE",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons name="location" size={20} color="#0284C7" />
                  </View>
                  <View style={{ marginLeft: 12 }}>
                    <Text style={{ fontSize: 16, fontWeight: "600" }}>
                      Site Location
                    </Text>
                    <Text
                      style={{ fontSize: 14, color: "#6B7280", marginTop: 2 }}
                    >
                      {selectedProject.location || "123 Main Street, New York"}
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    height: 1,
                    backgroundColor: "#F3F4F6",
                    marginVertical: 12,
                  }}
                />

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <View>
                    <Text style={{ fontSize: 13, color: "#6B7280" }}>
                      Site Manager
                    </Text>
                    <Text
                      style={{ fontSize: 15, fontWeight: "500", marginTop: 2 }}
                    >
                      {selectedProject.ownerName || "John Smith"}
                    </Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: 13, color: "#6B7280" }}>
                      Site Code
                    </Text>
                    <Text
                      style={{ fontSize: 15, fontWeight: "500", marginTop: 2 }}
                    >
                      {selectedProject.siteCode || "NYC-123"}
                    </Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: 13, color: "#6B7280" }}>Size</Text>
                    <Text
                      style={{ fontSize: 15, fontWeight: "500", marginTop: 2 }}
                    >
                      {selectedProject.size || "2,500 sqft"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Site Photos Section */}
              <View style={{ marginBottom: 16 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: "600" }}>
                    Site Photos
                  </Text>
                  <TouchableOpacity>
                    <Text style={{ fontSize: 14, color: "#4B5563" }}>
                      View All
                    </Text>
                  </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {[1, 2, 3].map((item) => (
                    <View
                      key={item}
                      style={{
                        width: 120,
                        height: 90,
                        backgroundColor: "#F3F4F6",
                        borderRadius: 8,
                        marginRight: 8,
                      }}
                    />
                  ))}
                </ScrollView>
              </View>

              {/* Site Notes */}
              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: 12,
                  padding: 16,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                  borderWidth: 1,
                  borderColor: "#F3F4F6",
                }}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}
                >
                  Site Notes
                </Text>
                <Text
                  style={{ fontSize: 14, color: "#4B5563", lineHeight: 20 }}
                >
                  {selectedProject.notes || 
                    "Last inspection on March 15. Foundation work completed. Electrical wiring in progress. Next inspection scheduled for April 1."}
                </Text>
              </View>
            </View>

            {/* Task Tab Content */}
            <View
              style={{
                width: width,
                flex: 1,
                backgroundColor: "white",
                padding: 16,
              }}
            >
              <View className="flex-row items-center justify-end mb-2 gap-1">
                <TouchableOpacity onPress={() => router.push("/(project)/task")}>
                  <Text className="text-[#FCAC29]">View all</Text>
                </TouchableOpacity>
                <Ionicons name="arrow-forward" color={"#FCAC29"}/>
              </View>
              
              {/* Task stats */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    backgroundColor: "#FEF3C7",
                    borderRadius: 12,
                    padding: 12,
                    marginRight: 8,
                  }}
                >
                  <Text style={{ fontSize: 12, color: "#92400E" }}>
                    In Progress
                  </Text>
                  <Text
                    style={{ fontSize: 20, fontWeight: "bold", marginTop: 4 }}
                  >
                    {filteredTasksByStatus("inProgress").length}
                  </Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    backgroundColor: "#DCFCE7",
                    borderRadius: 12,
                    padding: 12,
                    marginRight: 8,
                  }}
                >
                  <Text style={{ fontSize: 12, color: "#166534" }}>
                    Completed
                  </Text>
                  <Text
                    style={{ fontSize: 20, fontWeight: "bold", marginTop: 4 }}
                  >
                    {filteredTasksByStatus("Completed").length}
                  </Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    backgroundColor: "#FEE2E2",
                    borderRadius: 12,
                    padding: 12,
                  }}
                >
                  <Text style={{ fontSize: 12, color: "#991B1B" }}>
                    Delayed
                  </Text>
                  <Text
                    style={{ fontSize: 20, fontWeight: "bold", marginTop: 4 }}
                  >
                    {filteredTasksByStatus("Delayed").length}
                  </Text>
                </View>
              </View>

              {/* Task List */}
              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: 12,
                  overflow: "hidden",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                  padding: tasks.length === 0 ? 24 : 0,
                  alignItems: tasks.length === 0 ? "center" : "stretch",
                }}
              >
                {tasks.length === 0 ? (
                  <View
                    style={{ alignItems: "center", justifyContent: "center" }}
                  >
                    <Image
                      source={icons.todo}
                      className="h-24 m-auto my-4"
                      resizeMode="contain"
                    />
                    <Text style={{ fontSize: 16, color: "#9CA3AF" }}>
                      No tasks yet.
                    </Text>
                  </View>
                ) : (
                  [...tasks]
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    )
                    .slice(0, 3)
                    .map((task, index) => (
                      <View
                        key={index}
                        style={{
                          padding: 16,
                          borderBottomWidth:
                            index !== 2 && index !== tasks.length - 1 ? 1 : 0,
                          borderBottomColor: "#F3F4F6",
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            marginBottom: 6,
                          }}
                        >
                          <Text style={{ fontSize: 16, fontWeight: "600" }}>
                            {task.name}
                          </Text>
                          <View
                            style={{
                              backgroundColor:
                                task.status === "Completed"
                                  ? "#DCFCE7"
                                  : task.status === "Delayed"
                                  ? "#FEE2E2"
                                  : "#FEF3C7",
                              paddingHorizontal: 8,
                              paddingVertical: 2,
                              borderRadius: 12,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 12,
                                color:
                                  task.status === "Completed"
                                    ? "#166534"
                                    : task.status === "Delayed"
                                    ? "#991B1B"
                                    : "#92400E",
                              }}
                            >
                              {task.status === "inProgress" ? "In Progress" : task.status}
                            </Text>
                          </View>
                        </View>
                        <Text
                          style={{
                            fontSize: 14,
                            color: "#6B7280",
                            marginBottom: 8,
                          }}
                        >
                          {task.description}
                        </Text>
                      </View>
                    ))
                )}
              </View>
            </View>
          </ScrollView>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Project_home;
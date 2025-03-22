import React, { useState, useRef, useCallback } from "react";
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

const { width } = Dimensions.get("window");

const Project_home = () => {
  const router = useRouter();
  const { selectedProject } = useProjectStore();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const horizontalScrollRef = useRef<ScrollView | null>(null);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  if (!selectedProject) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No project data available.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      {/*ScrollView with RefreshControl */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header & Project Details */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
          {/* Header */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Pressable onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </Pressable>
            <Text style={{ fontSize: 20, fontWeight: "500" }}>
              {selectedProject.projectName}
            </Text>
            <Image source={icons.bell} style={{ width: 32, height: 32 }} />
          </View>

          {/* Project Details Card */}
          <View
            style={{
              backgroundColor: "#FEEDCF",
              marginTop: 10,
              padding: 10,
              height: 150,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              borderRadius: 10,
            }}
          >
            <View>
              <Text style={{ fontSize: 16, fontWeight: "600" }}>Client Name</Text>
              <Text style={{ fontSize: 30, fontWeight: "bold" }}>
                {selectedProject.ownerName}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
                <Image source={icons.point} style={{ width: 24, height: 24 }} />
                <Text style={{ fontSize: 18, marginLeft: 8 }}>
                  {selectedProject.location || "Not specified"}
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
                <Ionicons name="calendar" size={18} color="#6B7280" />
                <Text style={{ fontSize: 18, marginLeft: 8 }}>
                  {selectedProject.startDate
                    ? new Date(selectedProject.startDate).toDateString()
                    : "Not specified"}
                </Text>
              </View>
            </View>
            <View style={{ justifyContent: "center" }}>
              <Text>Progress</Text>
            </View>
          </View>

          {/* Actions */}
          <Text style={{ marginTop: 12, fontSize: 24, fontWeight: "600" }}>Action</Text>
          <View className="flex-row justify-between mt-4">
          <TouchableOpacity className="items-center gap-2 justify-center" onPress={()=>router.push('../(attendance)/attendance_home')}>
            <View className="bg-[#FEEDCF] p-6 rounded-md items-center gap-2">
              <Image source={icons.vendor} className="w-10 h-10" />
            </View>
            <Text>Attendance</Text>
          </TouchableOpacity>
          <TouchableOpacity className="items-center gap-2" onPress={()=>router.push('../(threeDmodel)/mainModel')}>
            <View className="bg-[#FEEDCF] p-6 rounded-md items-center gap-2">
              <Image source={icons.threed} className="w-10 h-10" />
            </View>
            <Text>3D</Text>
          </TouchableOpacity>
          <TouchableOpacity className="items-center gap-2"  onPress={()=>router.push('../(expenses)/budget')}>
            <View className="bg-[#FEEDCF] p-6 rounded-md items-center gap-2">
              <Image source={icons.budget} className="w-10 h-10" />
            </View>
            <Text>Budget</Text>
          </TouchableOpacity>
          <TouchableOpacity className="items-center gap-2" onPress={()=>router.push('/(project)/all_files')}>
            <View className="bg-[#FEEDCF] p-6 rounded-md items-center gap-2">
              <Image source={icons.doc} className="w-10 h-10" />
            </View>
            <Text>Document</Text>
          </TouchableOpacity   >
        </View>
        </View>
        {/* Custom Tab Bar */}
        <View style={{ borderBottomWidth: 1, borderBottomColor: "#ccc" }}>
          <View style={{ flexDirection: "row" }}>
            <Pressable
              style={{
                flex: 1,
                paddingVertical: 12,
                alignItems: "center",
                borderBottomWidth: activeTab === 0 ? 2 : 0,
                borderBottomColor: activeTab === 0 ? "black" : "transparent",
              }}
              onPress={() => {
                setActiveTab(0);
                horizontalScrollRef.current?.scrollTo({ x: 0, animated: true });
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: activeTab === 0 ? "bold" : "normal" }}>
                Site
              </Text>
            </Pressable>
            <Pressable
              style={{
                flex: 1,
                paddingVertical: 12,
                alignItems: "center",
                borderBottomWidth: activeTab === 1 ? 2 : 0,
                borderBottomColor: activeTab === 1 ? "black" : "transparent",
              }}
              onPress={() => {
                setActiveTab(1);
                horizontalScrollRef.current?.scrollTo({ x: width, animated: true });
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: activeTab === 1 ? "bold" : "normal" }}>
                Task
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Swipeable Tabs Content */}
        <ScrollView
          ref={horizontalScrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
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
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>This is the Site Tab</Text>
          </View>
          {/* Task Tab Content */}
          <View
            style={{
              width: width,
              flex: 1,
              backgroundColor: "white",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>This is the Task Tab</Text>
          </View>
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Project_home;

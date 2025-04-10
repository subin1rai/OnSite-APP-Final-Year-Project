import {
  FlatList,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState, useCallback, useRef } from "react";
import { icons, images } from "@/constants";
import { all_project } from "@/context/project";
import AuthService from "@/context/AuthContext";
import useUser from "@/context/User";
import Icon from "react-native-vector-icons/MaterialIcons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import ProjectDetails from "@/Components/ProjectDetails";
import { useProjectStore } from "@/store/projectStore";
import apiHandler from "@/context/ApiHandler";
import { useProjectProgressStore } from "@/store/projectProgressStore";

type Project = {
  id: number;
  projectName: string;
  location: string;
  builderId: number;
  createdAt: string;
  updatedAt: string;
  ownerName: string;
  startDate: string;
  endDate: string;
  status: string;
  projectWorkers: any[];
};

const Home = () => {
  const router = useRouter();
  const { user } = useUser();
  const [project, setProject] = useState<Project[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isMulyankanOpen, setIsMulyankanOpen] = useState(false);
  const { setProjectProgress, projectProgressMap } = useProjectProgressStore();
  const { selectedProject } = useProjectStore();
  const snapPoints = ["40%"];
  const mulyankanSnapPoints = ["25%"];
  const bottomSheetRef = useRef<BottomSheet>(null);
  const mulyankanBottomSheetRef = useRef<BottomSheet>(null);

  const handleOpenPress = (project: Project) => {
    useProjectStore.getState().setSelectedProject(project);
    if (!isOpen) {
      bottomSheetRef.current?.expand();
      setIsOpen(true);
    }
  };

  const handleClosePress = () => {
    bottomSheetRef.current?.close();
    setIsOpen(false);
  };

  const handleMulyankanOpen = () => {
    mulyankanBottomSheetRef.current?.expand();
    setIsMulyankanOpen(true);
  };

  const handleMulyankanClose = () => {
    mulyankanBottomSheetRef.current?.close();
    setIsMulyankanOpen(false);
  };

  const getProject = async () => {
    setLoading(true);
    setIsOpen(false);
    try {
      const result = await all_project();
      setProject(result);

      for (const proj of result) {
        try {
          const res = await apiHandler.post("/task", { projectId: proj.id });
          const tasks = res.data || [];
          const completed = tasks.filter(
            (t: any) => t.status === "Completed"
          ).length;
          const progress = Math.round((completed / (tasks.length || 1)) * 100);
          setProjectProgress(proj.id, progress);
        } catch (err) {
          console.error("Failed to fetch tasks for project", proj.id);
          setProjectProgress(proj.id, 0);
        }
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectClick = (selectedProject: Project) => {
    setIsOpen(false);
    useProjectStore.getState().setSelectedProject(selectedProject);
    router.push("/(project)/project_home");
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const isExpired = await AuthService.isTokenExpired();
      if (isExpired) {
        console.log("Token expired. Redirecting to login...");
        await AuthService.removeToken();
        router.replace("/(auth)/sign_in");
        return;
      }
      await getProject();
      setRefreshing(false);
    } catch (error) {
      console.error("Error during refresh:", error);
    }
  }, []);

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 12) return "Good Morning";
    if (hours >= 12 && hours < 17) return "Good Afternoon";
    if (hours >= 17 && hours < 21) return "Good Evening";
    return "Good Night";
  };

  // Update project list when selectedProject changes (to reflect status changes)
  useEffect(() => {
    if (selectedProject && project.length > 0) {
      // Find the project in the list and update it with the new status
      const updatedProjects = project.map((proj) =>
        proj.id === selectedProject.id
          ? { ...proj, status: selectedProject.status }
          : proj
      );

      setProject(updatedProjects);
    }
  }, [selectedProject]);

  useEffect(() => {
    getProject();
    setIsOpen(false);
    setIsMulyankanOpen(false);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white z-0">
      {(isOpen || isMulyankanOpen) && (
        <View
          style={styles.redOverlay}
          onTouchStart={isOpen ? handleClosePress : handleMulyankanClose}
        />
      )}
      <View className="mx-4">
        {/* Header Section */}
        <View className="flex flex-row gap-2 justify-between items-center">
          <View className="flex-row gap-2 items-center">
            {user?.image ? (
              <Image
                source={{ uri: user.image }}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <Image
                source={images.imageProfile}
                className="w-10 h-10 rounded-full"
              />
            )}

            <View>
              <Text className="text-[20px] font-semibold">{getGreeting()}</Text>
              <Text className="text-[18px] font-medium">
                {user?.username || "Loading..."}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => router.push("../(notification)/notification")}
          >
            <Image source={icons.bell} className="w-8 h-8" />
          </TouchableOpacity>
        </View>

        <Text className="pt-4 font-semibold text-[24px]">Action</Text>

        {/* First row of actions */}
        <View className="flex-row justify-between mt-4">
          <TouchableOpacity
            className="items-center gap-2"
            onPress={() => {
              router.push("../(worker)/worker_list");
            }}
          >
            <View className="bg-[#FEEDCF] p-6 rounded-md items-center gap-2">
              <Image source={icons.worker} className="w-10 h-10" />
            </View>
            <Text>Worker</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="items-center gap-2 justify-center"
            onPress={() => {
              router.push("../(vendor)/vendor_list");
            }}
          >
            <View className="bg-[#FEEDCF] p-6 rounded-md items-center gap-2">
              <Image source={icons.vendor} className="w-10 h-10" />
            </View>
            <Text>Vendor</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="items-center gap-2"
            onPress={handleMulyankanOpen}
          >
            <View className="bg-[#FEEDCF] p-6 rounded-md items-center gap-2">
              <Image source={icons.ai} className="w-10 h-10" />
            </View>
            <Text>Mulyankan</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="items-center gap-2"
            onPress={() => {
              router.push("../(report)/report");
            }}
          >
            <View className="bg-[#FEEDCF] p-6 rounded-md items-center gap-2">
              <Image source={icons.report} className="w-10 h-10" />
            </View>
            <Text>Report</Text>
          </TouchableOpacity>
        </View>

        {/* Project Section Header */}
        <View className="flex-row justify-between mt-4 items-center">
          <Text className="pt-4 font-medium text-[24px]">All</Text>
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => router.push("/(project)/create_project")}
          >
            <Icon name="add" size={24} color={"#FCAC29"} />
            <Text className="text-[20px] font-normal text-[#FCAC29]">
              Projects
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Project List */}
      <FlatList
        data={project}
        keyExtractor={(item: Project) => String(item.id)}
        renderItem={({ item, index }: { item: Project; index: number }) => {
          const isLastItem = index === project.length - 1;
          // Check if this is the currently selected project
          const isSelected = selectedProject?.id === item.id;

          // Use the most up-to-date status
          const currentStatus = isSelected
            ? selectedProject.status
            : item.status;

          return (
            <TouchableOpacity onPress={() => handleProjectClick(item)}>
              <View
                className="mx-4"
                style={{
                  marginBottom: isLastItem ? 20 : 0,
                  paddingBottom: isLastItem ? 20 : 0,
                }}
              >
                <View className="flex-row justify-between items-center p-3 border mt-3 rounded-md border-[#E8E8E8] bg-white ">
                  <View>
                    <Text className="text-[20px] font-semibold">
                      {item.projectName}
                    </Text>
                    <Text className="text-[16px] pt-1">
                      {item.location ? item.location : "No location available"}
                    </Text>
                  </View>
                  <View>
                    <View className="flex-row justify-between items-center pb-2">
                      <Text className="text-[22px]">
                        {projectProgressMap[item.id] ?? 0}%
                      </Text>

                      <TouchableOpacity
                        onPress={() => handleOpenPress(item)}
                        className="p-2"
                      >
                        <Image source={icons.ellipsis} className="w-1 h-4" />
                      </TouchableOpacity>
                    </View>
                    <View className="flex-row gap-2 items-center">
                      <View
                        className={`h-3 w-3 rounded-xl ${
                          currentStatus === "OnGoing"
                            ? "bg-blue-500"
                            : currentStatus === "Completed"
                            ? "bg-green-500"
                            : currentStatus === "Pending"
                            ? "bg-yellow-500"
                            : currentStatus === "Cancelled"
                            ? "bg-red-500"
                            : "bg-[#FCA311]"
                        }`}
                      ></View>
                      <Text>{currentStatus}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={() => (
          <Text className="p-40 m-auto">No projects found</Text>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FCA311"
            colors={["#FCA311"]}
          />
        }
      />

      {/* Project BottomSheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        onClose={handleClosePress}
        containerStyle={{ zIndex: 20 }}
      >
        <BottomSheetView>{isOpen && <ProjectDetails />}</BottomSheetView>
      </BottomSheet>

      {/* Mulyankan BottomSheet */}
      <BottomSheet
        ref={mulyankanBottomSheetRef}
        index={-1}
        snapPoints={mulyankanSnapPoints}
        enablePanDownToClose={true}
        onClose={handleMulyankanClose}
        containerStyle={{ zIndex: 20 }}
      >
        <BottomSheetView>
          <View className="p-5">
            <Text className="text-[22px] font-bold text-center mb-6 text-[#333]">
              Mulyankan
            </Text>

            <View className="mb-8">
              <TouchableOpacity
                className="flex-row items-center bg-white p-4 rounded-xl mb-4 border border-gray-100 "
                onPress={() => {
                  handleMulyankanClose();
                  router.push("/(Mulyankan)/housePricePrediction");
                }}
              >
                <View className="bg-[#FEEDCF] p-3 rounded-lg mr-4">
                  <Image source={icons.house} className="w-8 h-8" />
                </View>
                <View className="flex-1">
                  <Text className="text-[18px] font-semibold text-[#333]">
                    House Price
                  </Text>
                  <Text className="text-[14px] text-gray-500 mt-1">
                    Evaluate and predict house price
                  </Text>
                </View>
                <Icon name="chevron-right" size={24} color="#FCAC29" />
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center bg-white p-4 rounded-xl border border-gray-100"
                onPress={() => {
                  handleMulyankanClose();
                  router.push("/(Mulyankan)/ConstructionPrediction");
                }}
              >
                <View className="bg-[#FEEDCF] p-3 rounded-lg mr-4">
                  <Image source={icons.engineer} className="w-8 h-8" />
                </View>
                <View className="flex-1">
                  <Text className="text-[18px] font-semibold text-[#333]">
                    Construction Price
                  </Text>
                  <Text className="text-[14px] text-gray-500 mt-1">
                    Calculate and predict construction price
                  </Text>
                </View>
                <Icon name="chevron-right" size={24} color="#FCAC29" />
              </TouchableOpacity>
            </View>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  redOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 10,
  },
  optionCard: {
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});

export default Home;

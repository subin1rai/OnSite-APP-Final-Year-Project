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
import { useProjectStore } from "@/store/projectStore"; // adjust path accordingly
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

  const snapPoints = ["30%"];
  const bottomSheetRef = useRef<BottomSheet>(null);

  const handleOpenPress = useCallback((index:number) => {
    if (!isOpen) {
      bottomSheetRef.current?.expand();
      setIsOpen(true);
    }
  }, [isOpen]);

  const handleClosePress = () => {
    bottomSheetRef.current?.close();
    setIsOpen(false);
  };

  const getProject = async () => {
    setLoading(true);
    setIsOpen(false);
    try {
      const result = await all_project();
      setProject(result);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectClick = (selectedProject: Project) => {
    setIsOpen(false);
    // Save the project data in the Zustand store.
    console.log(selectedProject);
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

  useEffect(() => {
    getProject();
    setIsOpen(false);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white z-0">
      {isOpen && (
        <View style={styles.redOverlay} onTouchStart={handleClosePress} />
      )}
      <View className="mx-4">
        {/* Header Section */}
        <View className="flex flex-row gap-2 justify-between items-center">
          <View className="flex-row gap-2 items-center">
            <Image source={images.imageProfile} />
            <View>
              <Text className="text-[20px] font-semibold">Good Morning</Text>
              {user ? (
                <Text className="text-[18px] font-medium">{user.username}</Text>
              ) : (
                <Text className="text-[18px] font-medium">Loading...</Text>
              )}
            </View>
          </View>
          <Image source={icons.bell} className="w-8 h-8" />
        </View>

        <Text className="pt-4 font-semibold text-[24px]">Action</Text>

        {/* First row of actions */}
        <View className="flex-row justify-between mt-4">
          <TouchableOpacity className="items-center gap-2" onPress={()=>{router.push('../(worker)/worker_list')}}>
            <View className="bg-[#FEEDCF] p-6 rounded-md items-center gap-2">
              <Image source={icons.worker} className="w-10 h-10" />
            </View>
            <Text>Worker</Text>
          </TouchableOpacity>
          <View className="items-center gap-2 justify-center">
            <View className="bg-[#FEEDCF] p-6 rounded-md items-center gap-2">
              <Image source={icons.vendor} className="w-10 h-10" />
            </View>
            <Text>Vendor</Text>
          </View>
          <View className="items-center gap-2">
            <View className="bg-[#FEEDCF] p-6 rounded-md items-center gap-2">
              <Image source={icons.ai} className="w-10 h-10" />
            </View>
            <Text>Mulyankan</Text>
          </View>
          <View className="items-center gap-2">
            <View className="bg-[#FEEDCF] p-6 rounded-md items-center gap-2">
              <Image source={icons.report} className="w-10 h-10" />
            </View>
            <Text>Report</Text>
          </View>
        </View>

        {/* Second row of actions */}
        <View className="flex-row justify-between mt-4">
          <View className="items-center gap-2">
            <View className="bg-[#FEEDCF] p-6 rounded-md items-center gap-2">
              <Image source={icons.threed} className="w-10 h-10" />
            </View>
            <Text>3D</Text>
          </View>
          <View className="items-center gap-2 justify-center">
            <View className="bg-[#FEEDCF] p-6 rounded-md items-center gap-2">
              <Image source={icons.vendor} className="w-10 h-10" />
            </View>
            <Text>Attendance</Text>
          </View>
          <View className="items-center gap-2">
            <View className="bg-[#FEEDCF] p-6 rounded-md items-center gap-2">
              <Image source={icons.budget} className="w-10 h-10" />
            </View>
            <Text>Budget</Text>
          </View>
          <View className="items-center gap-2">
            <View className="bg-[#FEEDCF] p-6 rounded-md items-center gap-2">
              <Image source={icons.doc} className="w-10 h-10" />
            </View>
            <Text>Document</Text>
          </View>
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
                      <Text className="text-[22px]">0%</Text>
                      <TouchableOpacity
                        onPress={() => handleOpenPress(0)}
                        className="p-2"
                      >
                        <Image source={icons.ellipsis} className="w-1 h-4" />
                      </TouchableOpacity>
                    </View>
                    <View className="flex-row gap-2 items-center">
                      <View className="bg-[#FCA311] h-3 w-3 rounded-xl"></View>
                      <Text>On Going</Text>
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

      {/* BottomSheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1} // Ensure BottomSheet starts closed
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        onClose={handleClosePress}
        containerStyle={{ zIndex: 20 }}
      >
        <BottomSheetView>{isOpen && <ProjectDetails />}</BottomSheetView>
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
});
export default Home;

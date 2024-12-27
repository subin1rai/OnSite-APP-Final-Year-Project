import {
  FlatList,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";
import { Link, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState, useCallback } from "react";
import { icons, images } from "@/constants";
import { jwtDecode } from "jwt-decode";
import { all_project } from "@/context/project";
import AuthService from "@/context/AuthContext";

type Project = {
  id: number;
  projectName: string;
  builderId: number;
  createdAt: string;
  updatedAt: string;
  ownerName: string;
};

const Home = () => {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [project, setProject] = useState<Project[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const getProject = async () => {
    try {
      const result = await all_project();
      console.log(result);
      setProject(result);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const getUserFromToken = (token: string) => {
    try {
      const decodedToken = jwtDecode(token);
      setUser(decodedToken);
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await checkTokenAndFetchData();
    } finally {
      setRefreshing(false);
    }
  }, []);

  const checkTokenAndFetchData = async () => {
    const isExpired = await AuthService.isTokenExpired();
    if (isExpired) {
      await AuthService.removeToken();
      router.replace('../(auth)/sign_in'); // Redirect to login if expired
      return;
    }

    try {
      const accessToken = await SecureStore.getItemAsync("AccessToken");
      setToken(accessToken);
      if (accessToken) {
        getUserFromToken(accessToken);
        await getProject();
      }
    } catch (error) {
      console.error("Error getting token:", error);
    }
  };

  useEffect(() => {
    checkTokenAndFetchData();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        ListHeaderComponent={() => (
          <View className="mx-4">
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
            <View className="flex">
              {/* First row of actions */}
              <View className="flex-row justify-between mt-4">
                <View className="items-center gap-2">
                  <View className="bg-[#FEEDCF] p-6 rounded-md items-center gap-2">
                    <Image source={icons.worker} className="w-10 h-10" />
                  </View>
                  <Text>Worker</Text>
                </View>
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
                  <Text>report</Text>
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
                  <Text>attendance</Text>
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
              <View
                style={{
                  backgroundColor: "white",
                  marginTop: 24,
                  borderRadius: 8,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 3.84,
                  elevation: 5,
                }}
              >
                {/* project */}
                <View className="flex-row items-center pt-4 px-4 justify-between">
                  <Text className="font-semibold text-[24px] pb-2">Project</Text>
                  <Image source={icons.plus} className="w-6 h-6" />
                </View>

                {/* data */}
              </View>
            </View>
          </View>
        )}
        data={project}
        keyExtractor={(item: Project) => String(item.id)}
        renderItem={({ item }: { item: Project }) => (
          <TouchableOpacity style={{ marginBottom: 15 }}>
            <View className="flex items-start px-4 py-2 border-b border-[#EEEEEE] w-[95%] mx-auto">
              <Link
                href={{
                  pathname: "/(project)/project_home",
                  params: {
                    projectId: item.id,
                    projectName: item.projectName,
                    ownerName: item.ownerName,
                  },
                }}
              ><View className="w-full flex justify-center">
                <Text className="text-[18px]">{item.projectName}</Text>
                </View>
              </Link>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <Text className="p-4">No projects found</Text>
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
    </SafeAreaView>
  );
};

export default Home;
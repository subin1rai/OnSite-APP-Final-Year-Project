import {
  FlatList,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Link } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import CustomButton from "@/components/CustomButton";
import { icons, images } from "@/constants";
import { jwtDecode } from "jwt-decode";
import { all_project } from "@/context/project";

// Define Project type based on backend response
type Project = {
  id: number;
  projectName: string;
  builderId: number;
  createdAt: string;
  updatedAt: string;
  ownerName: string;
};

const Home = () => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [project, setProject] = useState<Project[]>([]);

  useEffect(() => {
    const getToken = async () => {
      try {
        const accessToken = await SecureStore.getItemAsync("AccessToken");
        setToken(accessToken);
        if (accessToken) {
          getUserFromToken(accessToken);
          getProject();
        }
      } catch (error) {
        console.error("Error getting token:", error);
      }
    };

    getToken();
  }, []);

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

  return (
    <SafeAreaView className="flex-1 bg-white">
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
          <View className="flex">
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
          </View>
          <View className="flex">
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

            {/* Project Section */}
            <View
              className="bg-white mt-6 rounded-md"
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
              <View className="flex-row items-center pt-4 px-4 justify-between">
                <Text className="font-semibold text-[24px]">Project</Text>
                <Image source={icons.plus} className="w-6 h-6" />
              </View>

              <View className="flex gap-2">
                {project && project.length > 0 ? (
                  <FlatList
                    data={project}
                    keyExtractor={(item: Project) => String(item.id)}
                    renderItem={({ item }: { item: Project }) => (
                      <TouchableOpacity style={{ marginBottom: 15 }}>
                        <View className="flex items-start px-4 py-2 border-b border-[#EEEEEE] w-[95%] mx-auto ">
                          <Link
                            href={{
                              pathname: "/(project)/project_home",
                              params: {
                                projectId: item.id, // Pass projectId
                                projectName: item.projectName, // Pass projectName
                                ownerName: item.ownerName, // Pass ownerName
                              },
                            }}
                          >
                            <Text className="text-[18px]">
                              {item.projectName}
                            </Text>
                          </Link>
                        </View>
                      </TouchableOpacity>
                    )}
                  />
                ) : (
                  <Text className="p-4">No projects found</Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Home;

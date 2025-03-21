import { icons } from "@/constants";
import apiHandler from "@/context/ApiHandler";
import { useProjectStore } from "@/store/projectStore";
import React, { useEffect } from "react";
import { Image, SafeAreaView, Text, View } from "react-native";
import * as SecureStore from "expo-secure-store";

const ProjectSetting = () => {
  const { selectedProject } = useProjectStore();
    const fetchProject = async () => {
        console.log(selectedProject);
            const token = await SecureStore.getItemAsync("AccessToken");
        try {
          const response = await apiHandler.post('/singleProject', {
            projectId:selectedProject,
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          console.log(response.data);
        } catch (error) {
          console.error('Failed to fetch project:', error);
        }
      };
      

  useEffect(() => {
    fetchProject();
  }, []);

  return (
    <SafeAreaView>
      <View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text>Project Name</Text>
          <Image
            source={icons.edit}
            style={{ width: 24, height: 24, marginLeft: 8 }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ProjectSetting;

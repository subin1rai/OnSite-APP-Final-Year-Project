import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  ScrollView,
} from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import apiHandler from "@/context/ApiHandler";
import ChatItem from "@/Components/Chat";
import { icons } from "@/constants";

interface ChatUser {
  id: string;
  username: string;
  image?: string;
}

const Chat: React.FC = () => {
  const [chats, setChats] = useState<ChatUser[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const getUsers = async () => {
    try {
      const token = await SecureStore.getItemAsync("AccessToken");
      if (!token) {
        console.error("No access token found");
        return;
      }

      const response = await apiHandler.get<{ friends: ChatUser[] }>(
        "/chat/getfriends",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("API Response:", response.data);
      setChats(response.data.friends || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getUsers();
  }, []);

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={styles.header}>
        <Text className="text-2xl pl-4 font-semibold">Chats</Text>
        <View style={styles.headerIcons}>
          <MaterialIcons
            onPress={() => router.push("../(chat)/usersScreen")}
            name="person-outline"
            size={32}
            color="black"
          />
          <TouchableOpacity onPress={() => router.push("../(chat)/allRequest")}>
            <Image source={icons.conversation} className="w-8 h-8" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.chatContainer}
        contentContainerStyle={
          chats.length === 0 ? styles.emptyContentContainer : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FCA311"]}
            tintColor="#FCA311"
          />
        }
      >
        {chats.length > 0 ? (
          chats.map((item) => <ChatItem item={item} key={item.id} />)
        ) : (
          <View style={styles.emptyStateContainer}>
            <View style={styles.sadFaceIcon}>
              <MaterialIcons
                name="sentiment-dissatisfied"
                size={28}
                color="#f97316"
              />
            </View>

            <Text style={styles.emptyStateTitle}>Ready To Chat?</Text>
            <Text style={styles.emptyStateDescription}>
              You haven't started any conversations yet. Connect with builders
              or team members anytime to discuss your project.
            </Text>

            <Text style={styles.emptyStateTip}>
              Pro Tip: You can start a chat directly from the Projects.
            </Text>

            <TouchableOpacity
              style={styles.startBookingButton}
              onPress={() => router.push("../(chat)/usersScreen")}
            >
              <Text style={styles.startBookingButtonText}>Start Chatting</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  chatContainer: {
    flex: 1,
  },
  emptyContentContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  emptyStateContainer: {
    backgroundColor: "#f1f5f9",
    marginHorizontal: 16,
    marginVertical: 40,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
  },
  sadFaceIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff3e0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyStateDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 16,
  },
  emptyStateTip: {
    fontSize: 15,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 20,
  },
  startBookingButton: {
    backgroundColor: "#ffb133",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  startBookingButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default Chat;

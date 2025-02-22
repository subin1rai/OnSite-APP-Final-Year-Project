import { images } from "@/constants";
import { useRouter } from "expo-router";
import React from "react";
import { View, Text, Image, StyleSheet, Pressable } from "react-native";

// Define types for props
interface ChatItemProps {
  item: {
    id: string;
    username: string;
    profileImage?: string;
  };
}

const ChatItem: React.FC<ChatItemProps> = ({ item }) => {
  const router = useRouter(); 

  return (
    <Pressable
      style={styles.chatItem}
      onPress={() =>
        router.push({
          pathname: "../(chat)/chatRoom",
          params: { receiver_id: item.id, username: item.username },
        })
      }
    >
      <View>
        <Image
          style={styles.profileImage}
          source={item.profileImage ? { uri: item.profileImage } : images.imageProfile}
        />
      </View>
      <View>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.subtext}>Chat with {item.username}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    fontSize: 18,
    fontWeight: "600",
  },
  subtext: {
    fontSize: 14,
    color: "gray",
  },
});

export default ChatItem;

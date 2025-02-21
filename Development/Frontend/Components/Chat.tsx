import { images } from "@/constants";
import React, { useState } from "react";
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
   const [messages, setMessages] = useState([]);
  return (
    <Pressable style={styles.chatItem} className="">
        <View>
            <Image
                style={styles.profileImage}
                source={images.imageProfile}
            />
        </View>
        <View>
            <Text className="text-xl font-semibold">{item.username}</Text>
            <Text  className="text-base text-gray-500">Chat with {item.username}</Text>
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
  chatText: {
    fontSize: 16,
  },
});

export default ChatItem;

import {
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { router } from 'expo-router';
import * as SecureStore from "expo-secure-store";
import apiHandler from '@/context/ApiHandler';
import ChatItem from '@/Components/Chat';
import { icons } from '@/constants';


interface ChatUser {
  id: string;
  username: string;
  image?: string;
}

const Chat: React.FC = () => {
  const [chats, setChats] = useState<ChatUser[]>([]);
  
  const getUsers = async () => {
    try {
      const token = await SecureStore.getItemAsync("AccessToken");
      if (!token) {
        console.error("No access token found");
        return;
      }
  
      const response = await apiHandler.get<{ friends: ChatUser[] }>("/chat/getfriends", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      console.log("API Response:", response.data); 
      setChats(response.data.friends || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };
  

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={styles.header}>
        <Text className='text-2xl pl-4 font-semibold'>Chats</Text>
        <View style={styles.headerIcons}>
          <MaterialIcons
            onPress={() => router.push('../(chat)/usersScreen')}
            name="person-outline"
            size={32}
            color="black"
          />
         <TouchableOpacity onPress={() => router.push('../(chat)/allRequest')}>
          <Image source={icons.conversation} className='w-8 h-8'/>
         </TouchableOpacity>
        </View>
      </View>

      <View style={styles.chatContainer}>
        {chats.length > 0 ? (
          chats.map((item) => (
            <ChatItem item={item} key={item.id} />
          ))
        ) : (
          <View style={styles.noChats}>
            <Text style={styles.noChatsText}>No Chats yet</Text>
            <Text style={styles.noChatsSubtext}>Start messaging a friend</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chatContainer: {
    padding: 10,
  },
  noChats: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noChatsText: {
    textAlign: 'center',
    color: 'gray',
  },
  noChatsSubtext: {
    marginTop: 4,
    color: 'gray',
  },
});

export default Chat;
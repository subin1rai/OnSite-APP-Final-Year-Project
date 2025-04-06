import {
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  ScrollView,
} from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
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
  const [refreshing, setRefreshing] = useState(false);
  
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

      <ScrollView 
        style={styles.chatContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#FCA311']} 
            tintColor="#FCA311"
          />
        }
      >
        {chats.length > 0 ? (
          chats.map((item) => (
            <ChatItem item={item} key={item.id} />
          ))
        ) : (
          <View style={styles.noChats}>
            <MaterialIcons name="chat-bubble-outline" size={70} color="#FCA311" />
            <Text style={styles.noChatsText}>No Chats Yet</Text>
            <Text style={styles.noChatsSubtext}>Start messaging a friend</Text>
            <TouchableOpacity 
              style={styles.startChatButton}
              onPress={() => router.push('../(chat)/usersScreen')}
            >
              <Text style={styles.startChatButtonText}>Find Friends</Text>
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
    flex: 1,
    padding: 10,
  },
  noChats: {
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  noChatsText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
  noChatsSubtext: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
    color: 'gray',
  },
  startChatButton: {
    marginTop: 24,
    backgroundColor: '#FCA311',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  startChatButtonText: {
    color: 'white',
    fontWeight: '600',
  }
});

export default Chat;
import {
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { router } from 'expo-router';

const Chat = () => {
  const [chats, setChats] = useState([
  ]);

  useEffect(() => {
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={styles.header}>
       
        <Text style={styles.headerTitle}>Chats</Text>
        <View style={styles.headerIcons}>
          
          <MaterialIcons
          onPress={()=>{
            router.push('../(chat)/usersScreen');
          }}
            name="person-outline"
            size={26}
            color="black"
          />
          
          <MaterialIcons
           onPress={()=>{
            router.push('../(chat)/allRequest');
          }}
            name="person-outline"
            size={26}
            color="black"
          />
        </View>
      </View>

      <View style={styles.chatContainer}>
        {chats.length > 0 ? (
          chats.map((item) => <Text key={item.id}>{item.username}</Text>)
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
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
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
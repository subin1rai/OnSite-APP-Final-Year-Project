import apiHandler from '@/context/ApiHandler';
import React, { useState, useEffect, useRef } from 'react';
import { 
  SafeAreaView, 
  Text, 
  View, 
  FlatList, 
  RefreshControl, 
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Animated,
  Dimensions
} from 'react-native';
import * as SecureStore from "expo-secure-store";
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { Swipeable } from 'react-native-gesture-handler';

const THEME_COLOR = "#FCAC29";
const SCREEN_WIDTH = Dimensions.get('window').width;

const Notification = () => {
  const [notifications, setNotifications] = useState<{ id: number; message: string; createdAt: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const scrollY = new Animated.Value(0);
  const swipeableRefs = useRef(new Map());

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync("AccessToken");
      const response = await apiHandler.get("/notification", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data && response.data.notifications) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.log("Error fetching notifications:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Today, show time
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      // Yesterday
      return 'Yesterday';
    } else if (diffDays < 7) {
      // Within a week
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[date.getDay()];
    } else {
      // Older than a week
      return date.toLocaleDateString();
    }
  };

  // Get notification icon based on message content
  const getNotificationIcon = (message: string) => {
    if (message.toLowerCase().includes('transaction') || message.toLowerCase().includes('amount') || message.toLowerCase().includes('credit')) {
      return 'business-outline';
    } else if (message.toLowerCase().includes('project') || message.toLowerCase().includes('construction')) {
      return 'business-outline';
    } else if (message.toLowerCase().includes('complete') || message.toLowerCase().includes('finished')) {
      return 'checkmark-circle-outline';
    } else if (message.toLowerCase().includes('schedule') || message.toLowerCase().includes('meeting')) {
      return 'calendar-outline'; 
    } else {
      return 'notifications-outline';
    }
  };
  
  const deleteNotification = async (id: number) => {
    try {
      const token = await SecureStore.getItemAsync("AccessToken");
    
      await apiHandler.delete(`/notification/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      // Update local state
      setNotifications(notifications.filter(notification => notification.id !== id));
    } catch (error) {
      console.log("Error deleting notification:", error);
    }
  };

  // Render a visual indication behind the notification while swiping
  const renderRightActions = (progress:any, dragX:any, id:any) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <View 
        className="flex-1 bg-[#FEEDCF] justify-center items-center opacity-80 rounded-2xl mr-4"
        style={{ marginTop: 12 }}
      />
    );
  };

  const renderNotificationItem = ({ item, index }: { item: { id: number; message: string; createdAt: string }, index: number }) => {
    const scale = scrollY.interpolate({
      inputRange: [-1, 0, (index * 90), (index * 90 + 90)],
      outputRange: [1, 1, 1, 0.98],
      extrapolate: 'clamp'
    });
    
    const opacity = scrollY.interpolate({
      inputRange: [-1, 0, (index * 90), (index * 90 + 40)],
      outputRange: [1, 1, 1, 0.7],
      extrapolate: 'clamp'
    });

    const iconName = getNotificationIcon(item.message);
    
    return (
      <Animated.View style={{ transform: [{ scale }], opacity }}>
        <Swipeable
          ref={(ref) => {
            if (ref && !swipeableRefs.current.has(item.id)) {
              swipeableRefs.current.set(item.id, ref);
            }
          }}
          friction={1.5}
          overshootRight={false}
          renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item.id)}
          onSwipeableOpen={() => deleteNotification(item.id)}
          rightThreshold={SCREEN_WIDTH * 0.35}>
          <TouchableOpacity 
            className="mx-4 mt-3 overflow-hidden rounded-2xl"
            activeOpacity={0.7}
          >
            <View className="flex-row bg-white p-5 rounded-2xl border border-gray-100">
              <View className="w-12 h-12 rounded-full justify-center items-center mr-4" style={{ backgroundColor: `${THEME_COLOR}15` }}>
                <Ionicons name={iconName} size={24} color={THEME_COLOR} />
              </View>
              <View className="flex-1">
                <Text className="text-gray-800 text-sm leading-5 font-medium">{item.message}</Text>
                <View className="flex-row items-center mt-2">
                  <Text className="text-gray-400 text-xs">{formatDate(item.createdAt)}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Swipeable>
      </Animated.View>
    );
  };

  // Enhanced empty state with animation
  const EmptyNotificationView = () => (
    <View className="flex-1 justify-center items-center px-10">
      <Animated.View 
        className="items-center"
        style={{
          transform: [{
            translateY: scrollY.interpolate({
              inputRange: [-100, 0, 100],
              outputRange: [-15, 0, 15],
              extrapolate: 'clamp'
            })
          }]
        }}
      >
        <View className="w-32 h-32 rounded-full justify-center items-center mb-8" style={{ backgroundColor: `${THEME_COLOR}15` }}>
          <Ionicons name="notifications-off-outline" size={64} color={THEME_COLOR} />
        </View>
        <Text className="text-2xl font-bold text-gray-800 mb-2">No notifications yet</Text>
        <Text className="text-gray-500 text-center leading-5 max-w-xs">
          Your construction project updates and important alerts will appear here when available.
        </Text>
        <TouchableOpacity 
          className="mt-6 bg-white border border-gray-200 rounded-full px-6 py-3 flex-row items-center"
          onPress={fetchNotifications}
        >
          <Ionicons name="refresh" size={18} color={THEME_COLOR} />
          <Text className="ml-2 font-medium" style={{ color: THEME_COLOR }}>Refresh</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {loading && !refreshing ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={THEME_COLOR} />
        </View>
      ) : (
        <Animated.FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={notifications.length === 0 ? {flex: 1} : {paddingVertical: 12, paddingBottom: 24}}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[THEME_COLOR]}
              tintColor={THEME_COLOR}
              progressBackgroundColor="#FFFFFF"
            />
          }
          ListEmptyComponent={EmptyNotificationView}
        />
      )}
    </SafeAreaView>
  );
};

export default Notification;
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Slot, Tabs } from 'expo-router';
import { SafeAreaView, StatusBar, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';

export default function TabLayout() {
  return (
    <GestureHandlerRootView className='flex-1'>
      <Drawer>
        <View className='p-4 border-b border-gray-600'>
          <Text className='text-lg text-black font-bold'>Subin Rai</Text>
        </View>
        {/* <Drawer.Screen
          name="index" // This is the name of the page and must match the url from root
          options={{
            drawerLabel: 'Home',
            title: 'overview',
          }}
        />
        <Drawer.Screen
          name="user/[id]" // This is the name of the page and must match the url from root
          options={{
            drawerLabel: 'User',
            title: 'overview',
          }}
        /> */}
        <Tabs
          screenOptions={{
            // tabBarActiveTintColor: 'blue',
            headerShown: false,
            // tabBarStyle: { paddingBottom: 0, height: 50 },  // You can adjust height
          }}
        >
          <Tabs.Screen
            name="home"
            options={{
              title: 'Home',
              tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
            }}
          />
          <Tabs.Screen
            name="budget"
            options={{
              title: 'Budget',
              tabBarIcon: ({ color }) => <FontAwesome size={28} name="cog" color={color} />,
            }}
          />
        </Tabs>
      </Drawer>
    </GestureHandlerRootView>
  );
}

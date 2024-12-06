import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Slot, Tabs } from 'expo-router';
import { SafeAreaView, StatusBar, Text, View } from 'react-native';

export default function TabLayout() {
  return (
     <SafeAreaView className="flex-1 bg-white">
     <Slot/>

      <StatusBar barStyle="dark-content" backgroundColor="white" translucent={false} />
      <View>
        <Link href="/(tabs)/home">
        <Text>Home</Text>
        </Link>
        <Link href="/(tabs)/budget">Budget</Link>
      </View>
     </SafeAreaView>
  );
}

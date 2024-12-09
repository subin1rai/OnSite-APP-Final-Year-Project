import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native'; // Ensure StyleSheet is imported
import expenses from '../(expenses)/expense';
import vendors from '../(expenses)/vendors';

const Tab = createMaterialTopTabNavigator();

const Tabs = () => {
  return (
    <SafeAreaView style={{flex:1, backgroundColor:"white"}}>
      <Tab.Navigator>
        <Tab.Screen name="Expense" component={expenses} />
        <Tab.Screen name="Vendor" component={vendors} />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

export default Tabs;
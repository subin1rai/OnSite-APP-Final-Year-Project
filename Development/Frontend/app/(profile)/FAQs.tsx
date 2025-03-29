import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Animated } from 'react-native';
import { useState, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';

const faqs = [
  {
    question: "How do I track my project?",
    answer: "You can view progress, budgets, and milestones from your dashboard. Our intuitive interface makes it easy to see real-time updates and progress reports without having to contact your builder directly.",
  },
  {
    question: "Can I contact the builder directly?",
    answer: "Yes, use the built-in chat feature to reach out to your builder. Our messaging system ensures all communications are saved and accessible throughout your project's timeline for better accountability and clarity.",
  },
  {
    question: "How is the budget calculated?",
    answer: "It's calculated based on the estimates and actual spending from the builder. We track all expenses, changes, and additional costs in real-time to give you a transparent view of where your money is going.",
  },
  {
    question: "What happens if there are delays?",
    answer: "Your builder will notify you through the app about any delays, including the reasons and estimated new timeline. You'll always be kept in the loop about your project status.",
  },
  {
    question: "Can I make changes to the project?",
    answer: "Yes, you can request changes through the app. Your builder will review them and provide updated cost and timeline implications before proceeding.",
  },
];

const FAQs = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const animatedValues = useRef(faqs.map(() => new Animated.Value(0))).current;
  
  const toggleFAQ = (index: any) => {
    // Toggle animation
    Animated.timing(animatedValues[index], {
      toValue: activeIndex === index ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
    
    // Toggle active state
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
    
        <Text className="text-black opacity-80 mt-2 px-4">
          Find answers to commonly asked questions
        </Text>
      
      <ScrollView 
        className="flex-1 px-5 pt-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {faqs.map((faq, index) => {
          const animatedHeight = animatedValues[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1000], // Large number to ensure full height
          });
          
          const animatedRotate = animatedValues[index].interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '180deg'],
          });
          
          const isActive = activeIndex === index;
          
          return (
            <View 
              key={index} 
              className={`mb-4 rounded-xl overflow-hidden shadow-sm ${isActive ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100'} border`}
            >
              <TouchableOpacity
                onPress={() => toggleFAQ(index)}
                className="flex-row justify-between items-center p-4"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center flex-1">
                  <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${isActive ? 'bg-blue-500' : 'bg-gray-300'}`}>
                    <Text className="text-white font-bold">{index + 1}</Text>
                  </View>
                  <Text className={`text-base flex-1 ${isActive ? 'font-bold text-blue-800' : 'font-medium text-gray-800'}`}>
                    {faq.question}
                  </Text>
                </View>
                
                <Animated.View style={{ transform: [{ rotate: animatedRotate }] }}>
                  <Ionicons
                    name="chevron-down"
                    size={22}
                    color={isActive ? "#3b82f6" : "#6b7280"}
                  />
                </Animated.View>
              </TouchableOpacity>
              
              <Animated.View style={{ height: isActive ? 'auto' : 0, overflow: 'hidden' }}>
                <View className="px-4 pb-4 pt-1">
                  <View className="border-t border-gray-200 mb-3" />
                  <Text className="text-gray-700 leading-5 ml-11">
                    {faq.answer}
                  </Text>
                </View>
              </Animated.View>
            </View>
          );
        })}
        
        <View className="mt-8 p-5 bg-gray-50 rounded-lg border border-gray-200">
          <Text className="text-base font-bold text-gray-800 mb-2">Still have questions?</Text>
          <Text className="text-gray-600 mb-3">
            If you couldn't find the answer you were looking for, please don't hesitate to contact our support team.
          </Text>
          <TouchableOpacity 
            className="bg-[#FCA311] py-3 rounded-lg shadow-sm"
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-center">Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default FAQs;
import CustomButton from "@/components/CustomButton";
import { onboarding } from "@/constants";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Text, TouchableOpacity, Image, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";
import * as SecureStore from "expo-secure-store";

const Onboarding = () => {
  const swiperRef = useRef<Swiper>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // NEW: Loading state
  const isLastSlide = activeIndex === onboarding.length - 1;

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const hasSeenOnboarding = await SecureStore.getItemAsync("HasSeenOnboarding");
      if (hasSeenOnboarding) {
        router.replace("../(tabs)/home");
      } else {
        setIsLoading(false); // Stop loading when check is complete
      }
    };
    checkOnboardingStatus();
  }, []);

  const completeOnboarding = async () => {
    await SecureStore.setItemAsync("HasSeenOnboarding", "true");
    router.replace("../(auth)/sign_up");
  };

  // Display loading indicator while checking onboarding status
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#FCA311" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header Section */}
      <View className="flex-row justify-between items-start px-4">
        {/* Logo */}
        <Image
          source={require("../../assets/images/icon.png")}
          style={{ width: 60, height: 60 }}
        />
        {/* Skip Button */}
        <TouchableOpacity
          onPress={completeOnboarding}
          className="px-5 py-2"
        >
          <Text className="text-black text-md font-semibold">Skip</Text>
        </TouchableOpacity>
      </View>
      <Swiper
        ref={swiperRef}
        loop={false}
        dot={
          <View className="w-[8px] h-[8px] mx-1 bg-[#E2E8F0] rounded-full" />
        }
        activeDot={
          <View className="w-[32px] h-[8px] mx-1 bg-[#FCA311] rounded-full" />
        }
        onIndexChanged={(index) => setActiveIndex(index)}
      >
        {onboarding.map((item, index) => (
          <View key={index} className="flex items-center justify-center p-5 mt-16">
            <Image
              source={item.image}
              className="w-full h-[300px]"
              resizeMode="contain"
            />
            <View className="flex flex-row items-center justify-center w-full mt-10">
              <Text className="text-black text-3xl font-bold mx-10 mt-4 text-center">
                {item.title}
              </Text>
            </View>
            <Text className={`text-md font-semibold text-center text-[#858585]  ${isLastSlide ? "mx-6" : ""} mt-4`}>
              {item.description}
            </Text>
          </View>
        ))}
      </Swiper>
      <CustomButton
        title={isLastSlide ? "Get Started" : "Next"}
        onPress={() =>
          isLastSlide
            ? completeOnboarding()
            : swiperRef.current?.scrollBy(1)
        }
        className="w-[85%] mt-5 mb-5 mx-auto"
      />
    </SafeAreaView>
  );
};

export default Onboarding;
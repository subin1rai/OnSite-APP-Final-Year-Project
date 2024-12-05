import CustomButton from "@/components/CustomButton";
import { onboarding } from "@/constants";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { Text, TouchableOpacity, Image, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";

const Onboarding = () => {
  const swiperRef = useRef<Swiper>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isLastSlide = activeIndex === onboarding.length - 1;
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
          onPress={() => {
            router.replace("../(auth)/sign_up");
          }}
          className="px-5 py-2 "
        >
          {/* Skip Text */}
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
        {onboarding.map((item) => (
          <View className="flex items-center justify-center p-5 mt-16">
            <Image
              source={item.image}
              className="w-full h-[300px]"
              resizeMode="contain"
            />
            <View className="flex flex-row items-center justify-center w-full mt-10">
              <Text className="text-blac text-3xl font-bold mx-10 mt-4 text-center">
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
            ? router.replace("../(auth)/sign_up")
            : swiperRef.current?.scrollBy(1)
        }
        className="w-[85%] mt-5 mb-5 mx-auto"
      />
    </SafeAreaView>
  );
};

export default Onboarding;

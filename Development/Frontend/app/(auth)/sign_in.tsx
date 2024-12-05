import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import { icons, images } from "@/constants";
import { Link } from "expo-router";
import { useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";

const SignIn = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const onSignUpPress = async () => {
    console.log(form);
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="relative w-full h-[250px]">
          <Image
            source={images.construction}
            className="z-0 w-full h-[250px]"
          />
          <Text className="text-2xl font-bold text-white absolute bottom-5 left-5">
          welcome
          </Text>
        </View>

        {/* input field */}
        <View className="p-5">
          <InputField
            label="Email"
            placeholder="Enter email"
            icon={icons.email}
            value={form.email}
            onChangeText={(value) => setForm({ ...form, email: value })}
          />
          <InputField
            label="Password"
            placeholder="Enter password"
            secureTextEntry={true}
            icon={icons.lock}
            value={form.password}
            onChangeText={(value) => setForm({ ...form, password: value })}
          />

          <CustomButton 
            title="Log In"
            onPress={onSignUpPress}
            className="mt-6"
          />

            <Link href="/(auth)/sign_in" className="text-lg text-center text-general-200 mt-10">
            <Text>Already have an account?</Text>
            <Text className="text-yellow-500"> log In</Text>
            </Link>
            
        </View>
      </View>
    </ScrollView>
  );
};

export default SignIn;

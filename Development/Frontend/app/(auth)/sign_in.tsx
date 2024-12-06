// Import required components and libraries
import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import { icons, images } from "@/constants";
import { Link } from "expo-router";
import { useState } from "react";
import { Image, ScrollView, Text, View, Alert } from "react-native";
import { useRouter } from "expo-router";
import { user_login } from "@/context/user_api";
import * as SecureStore from "expo-secure-store";

const SignIn = () => {
  const router = useRouter();
  
  // State to manage form data
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  // Handle sign in button press
  const onSignInPress = async () => {
    // Validate form fields
    if (!form.email || !form.password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    // Validate email format
    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // if (!emailRegex.test(form.email)) {
    //   Alert.alert("Error", "Please enter a valid email address");
    //   return;
    // }

    try {
      const result = await user_login(form.email, form.password);
      console.log(result);
      console.log("status code : " ,result.status);
      if (result?.status == 200) {
        await SecureStore.setItemAsync("AccessToken", result.token);
        router.replace("../(tabs)/home");
      
      } else {
        Alert.alert("Error", "Invalid credentials");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Login failed. Please try again.");
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        {/* Header section with background image */}
        <View className="relative w-full h-[250px]">
          <Image
            source={images.construction}
            className="z-0 w-full h-[250px]"
          />
          <Text className="text-2xl font-bold text-white absolute bottom-5 left-5">
            welcome
          </Text>
        </View>

        {/* Form section */}
        <View className="p-5">
          {/* Email input field */}
          <InputField
            label="Email"
            placeholder="Enter email"
            icon={icons.email}
            value={form.email}
            onChangeText={(value) => setForm({ ...form, email: value })}
          />
          {/* Password input field */}
          <InputField
            label="Password"
            placeholder="Enter password"
            secureTextEntry={true}
            icon={icons.lock}
            value={form.password}
            onChangeText={(value) => setForm({ ...form, password: value })}
          />

          {/* Sign in button */}
          <CustomButton
            title="Log In"
            onPress={onSignInPress}
            className="mt-6"
          />
          {/* Divider with "Or" text */}
          <View className="flex flex-row justify-center items-center mt-4 gap-x-3">
            <View className="flex-1 h-[1px] bg-general-100" />
            <Text className="text-lg">Or</Text>
            <View className="flex-1 h-[1px] bg-general-100" />
          </View>
          {/* Link to sign up page */}
          <Link
            href="/(auth)/sign_up"
            className="text-lg text-center text-general-200 mt-10"
          >
            <Text>Don't have an account?</Text>
            <Text className="text-yellow-500"> Sign Up</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignIn;

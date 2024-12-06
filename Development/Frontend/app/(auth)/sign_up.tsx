import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import { icons, images } from "@/constants";
import { Link } from "expo-router";
import { useState } from "react";
import { Image, ScrollView, Text, View, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { signUp_user } from "@/context/user_api";
import * as SecureStore from "expo-secure-store";

const SignUp = () => {
  const router = useRouter();

  // State to manage form data
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Handle sign up button press
  const onSignUpPress = async () => {
    try {
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Validation Error", 
        text2: "Please fill in all fields.",
      });
      return;
    }
    // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        Toast.show({
          type: "error",
          text1: "Validation Error",
          text2: "Please enter a valid email address",

        });
        return;
      }

    if (form.password !== form.confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Passwords do not match.",
      });
      return;
    }

      const result = await signUp_user(form.name, form.email, form.password , form.confirmPassword);
      if (result?.status == 201) {
        await SecureStore.setItemAsync("AccessToken", result.token);
        console.log(result.token);
        Toast.show({
          type: "success", 
          text1: "Success",
          text2: "Account created successfully! Please login.",
          visibilityTime: 1000,
          onHide: () => {
            router.replace("../(auth)/sign_in");
          }
        });
      } else {
        Alert.alert("Error", "Invalid credentials");
      }
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Something went wrong. Please try again.",
      });
    }
  
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView className="flex-1 bg-white">
        <View className="flex-1 bg-white">
          {/* Header section with background image */}
          <View className="relative w-full h-[250px]">
            <Image
              source={images.construction}
              className="z-0 w-full h-[250px]"
            />
            <Text className="text-2xl font-bold text-white absolute bottom-5 left-5">
              Create Your Account
            </Text>
          </View>

          {/* Form section */}
          <View className="p-5">
            {/* Name input field */}
            <InputField
              label="Name"
              placeholder="Enter name"
              icon={icons.person}
              value={form.name}
              onChangeText={(value) => setForm({ ...form, name: value })}
            />
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
            {/* Confirm password input field */}
            <InputField
              label="Confirm Password"
              placeholder="Enter confirm password"
              secureTextEntry={true}
              icon={icons.lock}
              value={form.confirmPassword}
              onChangeText={(value) =>
                setForm({ ...form, confirmPassword: value })
              }
            />

            {/* Sign up button */}
            <CustomButton
              title="Sign Up"
              onPress={onSignUpPress}
              className="mt-6"
            />

            {/* Divider with "Or" text */}
            <View className="flex flex-row justify-center items-center mt-4 gap-x-3">
              <View className="flex-1 h-[1px] bg-general-100" />
              <Text className="text-lg">Or</Text>
              <View className="flex-1 h-[1px] bg-general-100" />
            </View>

            {/* Link to sign in page */}
            <Link
              href="/(auth)/sign_in"
              className="text-lg text-center text-general-200 mt-2"
            >
              <Text>Already have an account?</Text>
              <Text className="text-yellow-500"> Log In</Text>
            </Link>
          </View>
        </View>

        {/* Toast component */}
        <Toast />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUp;

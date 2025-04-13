import {
  ImageBackground,
  ScrollView,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import Toast from "react-native-toast-message";

import CustomButton from "@/Components/CustomButton";
import InputField from "@/Components/InputField";
import { icons, images } from "@/constants";
import { signUp_user } from "@/context/user_api";

const SignUp = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const onSignUpPress = async () => {
    try {
      if (
        !form.name ||
        !form.email ||
        !form.password ||
        !form.confirmPassword
      ) {
        Toast.show({
          type: "error",
          text1: "Validation Error",
          text2: "Please fill in all fields.",
        });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        Toast.show({
          type: "error",
          text1: "Validation Error",
          text2: "Please enter a valid email address.",
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

      const result = await signUp_user(
        form.name,
        form.email,
        form.password,
        form.confirmPassword
      );
      if (result?.status == 201) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Account created successfully! Please login.",
          visibilityTime: 1000,
          onHide: () => {
            router.replace("../(auth)/sign_in");
          },
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
      <ScrollView
        className="flex-1 bg-white"
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Image */}
        <ImageBackground
          source={images.construction}
          style={{ height: 250, width: "100%" }}
        ></ImageBackground>

        {/* Form Section */}
        <View className="px-4 pt-4 pb-12 bg-white -mt-6 rounded-t-3xl">
          <View className="flex-1 justify-end pb-2">
            <Text className="text-black text-3xl font-bold">
              Create Your Account
            </Text>
            <Text className="text-black text-base mt-1">
              Sign up to get started
            </Text>
          </View>

          <InputField
            label="Name"
            placeholder="Enter name"
            placeholderTextColor="gray"
            icon={icons.person}
            value={form.name}
            onChangeText={(value: string) => setForm({ ...form, name: value })}
          />
          <InputField
            label="Email"
            placeholder="Enter email"
            placeholderTextColor="gray"
            icon={icons.email}
            value={form.email}
            onChangeText={(value: string) => setForm({ ...form, email: value })}
          />
          <InputField
            label="Password"
            placeholder="Enter password"
            placeholderTextColor="gray"
            secureTextEntry={true}
            icon={icons.lock}
            value={form.password}
            onChangeText={(value: string) =>
              setForm({ ...form, password: value })
            }
          />
          <InputField
            label="Confirm Password"
            placeholder="Enter confirm password"
            placeholderTextColor="gray"
            secureTextEntry={true}
            icon={icons.lock}
            value={form.confirmPassword}
            onChangeText={(value: string) =>
              setForm({ ...form, confirmPassword: value })
            }
          />

          <CustomButton
            title="Sign Up"
            onPress={onSignUpPress}
            className="mt-6"
          />

          {/* OR Divider */}
          <View className="flex-row items-center justify-center mt-6 gap-3">
            <View className="h-px bg-gray-300 flex-1" />
            <Text className="text-gray-500 text-base">Or</Text>
            <View className="h-px bg-gray-300 flex-1" />
          </View>

          {/* Link to Login */}
          <TouchableOpacity
            onPress={() => router.replace("/(auth)/sign_in")}
            className="flex-row justify-center mt-4"
          >
            <Text className="text-gray-500 text-base">
              Already have an account?
            </Text>
            <Text className="text-yellow-500 text-base ml-1 font-medium">
              Log In
            </Text>
          </TouchableOpacity>
        </View>

        {/* Toast Message */}
        <Toast />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUp;

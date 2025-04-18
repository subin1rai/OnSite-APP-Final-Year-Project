import {ImageBackground,ScrollView,Text,View,TouchableOpacity,KeyboardAvoidingView,Platform} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { icons, images } from "@/constants";
import InputField from "@/Components/InputField";
import CustomButton from "@/Components/CustomButton";
import * as SecureStore from "expo-secure-store";
import { user_login } from "@/context/user_api";

const SignIn = () => {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });

  const onSignInPress = async () => {
    if (!form.email || !form.password) {
      alert("Please fill in all fields");
      return;
    }
    try {
      const result = await user_login(form.email, form.password);
      if (result?.status === 200) {
        await SecureStore.setItemAsync("AccessToken", result.token);
        if (result.user.role === "client") {
          router.replace("../(client)/clientHome");
        } else {
          router.replace("../(tabs)/home");
        }
      } else {
        alert("Invalid credentials");
      }
    } catch (error) {
      alert("Login failed");
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-white"
      bounces={false}
      showsVerticalScrollIndicator={false}
    >
      <ImageBackground
        source={images.construction}
        style={{ height: 250, width: "100%" }}
      ></ImageBackground>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="px-4 pt-4 pb-12 bg-white rounded-t-3xl -mt-6"
      >
        <View className="flex-1 justify-end  pb-2">
          <Text className="text-black text-3xl font-bold">Welcome</Text>
          <Text className="text-gray-500 text-base mt-1">
            Please sign in to continue
          </Text>
        </View>
        <InputField
          label="Email"
          placeholder="Enter email"
          icon={icons.email}
          value={form.email}
          onChangeText={(value: string) => setForm({ ...form, email: value })}
        />
        <InputField
          label="Password"
          placeholder="Enter password"
          icon={icons.lock}
          secureTextEntry={true}
          value={form.password}
          onChangeText={(value: string) =>
            setForm({ ...form, password: value })
          }
        />
        <TouchableOpacity
          className="self-end mt-2"
          onPress={() => {
            router.push("/(auth)/forgetPassword");
          }}
        >
          <Text className="text-[#ffb133] font-medium">Forgot password?</Text>
        </TouchableOpacity>

        <CustomButton
          title="Sign Up"
          onPress={onSignInPress}
          className="mt-6"
        />

        {/* OR Divider */}
        <View className="flex-row items-center justify-center mt-6 gap-3">
          <View className="h-px bg-gray-300 flex-1" />
          <Text className="text-gray-500 text-base">Or</Text>
          <View className="h-px bg-gray-300 flex-1" />
        </View>

        {/* Link */}
        <TouchableOpacity
          onPress={() => router.replace("/(auth)/sign_up")}
          className="flex-row justify-center mt-4"
        >
          <Text className="text-gray-500 text-base">
            Don’t have an account?
          </Text>
          <Text className="text-yellow-500 text-base ml-1 font-medium">
            Sign in
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </ScrollView>
  );
};

export default SignIn;

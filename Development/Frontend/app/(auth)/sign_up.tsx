// Import required components and libraries
import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import { icons, images } from "@/constants";
import { Link } from "expo-router";
import { useState } from "react";
import { Image, ScrollView, Text, View, Alert } from "react-native";
import { useRouter } from "expo-router";

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
            Create Your Account
          </Text>
        </View>

        {/* Form section */}
        <View className="p-5">
          {/* name input field */}
          <InputField
            label="name"
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
            <Text className="text-yellow-500"> log In</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignUp;

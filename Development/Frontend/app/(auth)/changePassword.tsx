import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { icons } from "@/constants";
import apiHandler from "@/context/ApiHandler";
import SuccessModal from "@/Components/SuccessModel";
import ErrorModal from "@/Components/ErrorModel";

const ChangePassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { email } = useLocalSearchParams();
  const router = useRouter();

  // Password validation indicators
  const hasMinLength = password.length >= 8;

  const handleResetPassword = async () => {
    // Validate passwords
    if (!password) {
      setErrorMessage("Please enter a new password");
      setErrorModalVisible(true);
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters");
      setErrorModalVisible(true);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      setErrorModalVisible(true);
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiHandler.post("/user/resetpassword", {
        email,
        password,
        confirmPassword
      });

      if (response.status === 200) {
        setIsLoading(false);
        setSuccessModalVisible(true);
      } else {
        throw new Error("Failed to reset password");
      }
    } catch (error) {
      setIsLoading(false);
      setErrorMessage("Failed to reset password. Please try again.");
      setErrorModalVisible(true);
    }
  };

  const handleSuccessModalClose = () => {
    setSuccessModalVisible(false);
    router.replace("/(auth)/sign_in");
  };

  const handleErrorModalClose = () => {
    setErrorModalVisible(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-white"
      >
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View className="flex-1 px-6 pt-16 pb-8 items-center mt-24">
            {/* Lock Icon */}
            <View className="w-20 h-20 bg-orange-200 p-4 rounded-full justify-center items-center mb-8">
              <Image source={icons.fingerprint} className="w-10 h-10" />
            </View>

            {/* Title */}
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              Set new password
            </Text>

            {/* Subtitle */}
            <Text className="text-gray-500 text-center mb-8">
              Must be at least 8 characters.
            </Text>

            {/* Password Input */}
            <View className="w-full mb-6">
              <Text className="text-gray-700 font-medium mb-2">Password</Text>
              <TextInput
                secureTextEntry
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                className="border border-gray-300 rounded-lg px-4 py-3 w-full"
                autoCapitalize="none"
              />
            </View>

            {/* Confirm Password Input */}
            <View className="w-full mb-8">
              <Text className="text-gray-700 font-medium mb-2">
                Confirm password
              </Text>
              <TextInput
                secureTextEntry
                placeholder="••••••••"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                className="border border-gray-300 rounded-lg px-4 py-3 w-full"
                autoCapitalize="none"
              />
            </View>

            {/* Reset Password Button */}
            <TouchableOpacity
              className={`w-full py-4 items-center rounded-lg mb-6 bg-[#ffb133]`}
              onPress={handleResetPassword}
              disabled={isLoading}
            >
              <Text className="text-white font-semibold text-base">
                {isLoading ? "Resetting..." : "Reset password"}
              </Text>
            </TouchableOpacity>

            {/* Back to Login */}
            <TouchableOpacity
              className="flex-row items-center mt-4"
              onPress={() => router.replace("/(auth)/sign_in")}
            >
              <Text className="text-gray-600">← Back to log in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Success Modal */}
        <SuccessModal
          visible={successModalVisible}
          title="Password Reset Successful"
          message="Your password has been reset successfully. You can now log in with your new password."
          onClose={handleSuccessModalClose}
        />

        {/* Error Modal */}
        <ErrorModal
          visible={errorModalVisible}
          title="Error"
          message={errorMessage}
          onClose={handleErrorModalClose}
        />
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default ChangePassword;

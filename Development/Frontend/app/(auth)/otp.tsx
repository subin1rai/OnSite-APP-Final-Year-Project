import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from "react-native";
import { useLocalSearchParams, usePathname, useRouter } from "expo-router";
import { icons } from "@/constants";
import apiHandler from "@/context/ApiHandler";
import SuccessModal from "@/Components/SuccessModel";
import ErrorModal from "@/Components/ErrorModel";

const VerificationCode = () => {
  const [code, setCode] = useState(["", "", "", ""]);
  const { email } = useLocalSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleCodeChange = (text: string, index: number) => {
    if (text.length > 1) {
      // Handle paste of the entire code
      const pastedCode = text.slice(0, 4).split("");
      const newCode = [...code];

      for (let i = 0; i < pastedCode.length; i++) {
        if (i + index < 4) {
          newCode[i + index] = pastedCode[i];
        }
      }

      setCode(newCode);

      // Focus last input or next empty input
      const lastNonEmptyIndex = newCode.findIndex((c) => c === "");
      if (lastNonEmptyIndex !== -1) {
        inputRefs.current[lastNonEmptyIndex]?.focus();
      } else {
        inputRefs.current[3]?.blur();
        Keyboard.dismiss();
      }
    } else {
      // Handle single digit input
      const newCode = [...code];
      newCode[index] = text;
      setCode(newCode);

      // Auto focus to next input
      if (text !== "" && index < 3) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  // Handle backspace key
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace") {
      // If current field is empty, focus previous field
      if (code[index] === "" && index > 0) {
        const newCode = [...code];
        newCode[index - 1] = "";
        setCode(newCode);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleContinue = async () => {
    const verificationCode = code.join("");
    if (verificationCode.length !== 4) {
      setErrorMessage("Please enter the complete verification code");
      setErrorModalVisible(true);
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiHandler.post("/user/verifyotp", {
        email,
        otp: verificationCode,
      });

      if (response.status === 200) {
        setIsLoading(false);
        setSuccessModalVisible(true);
      }
    } catch (error) {
      setIsLoading(false);
      setErrorMessage("Verification failed. Please try again.");
      setErrorModalVisible(true);
    }
  };

  // Handle success modal close and navigation
  const handleSuccessModalClose = () => {
    setSuccessModalVisible(false);
    router.replace({
        pathname: '/(auth)/changePassword',
        params: { email: email }
    });
  };

  // Handle error modal close
  const handleErrorModalClose = () => {
    setErrorModalVisible(false);
  };

  const handleResend = async () => {
    try {
      setIsLoading(true);
      const response = await apiHandler.post("/user/requestotp", { email });
  
      if (response.status === 200) {
        setIsLoading(false);
        setCode(["", "", "", ""]);
        inputRefs.current[0]?.focus();
  
        Alert.alert(
          "Code Resent",
          "A new verification code has been sent to your email."
        );
      }
    } catch (error) {
      setIsLoading(false);
      setErrorMessage("Failed to resend code. Please try again.");
      setErrorModalVisible(true);
    }
  };
  

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-white"
      >
        <View className="flex-1 items-center justify-center px-6 py-6">
          {/* Email Icon */}
          <View className="w-24 h-24 bg-blue-100 rounded-full justify-center items-center mb-8 mt-12">
            <Image source={icons.fingerprint} className="w-12 h-12" />
          </View>

          {/* Title */}
          <Text className="text-2xl font-semibold text-gray-900 mb-4">
            Password reset
          </Text>

          {/* Subtitle with email */}
          <Text className="text-base text-gray-500 mb-8 text-center">
            We sent a code to{" "}
            <Text className="font-semibold text-gray-900">{email}</Text>
          </Text>

         {/* Verification Code Input */}
         <View className="flex-row justify-center w-full mb-8">
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={{ width: 44, height: 44 }}
                className={`border ${
                  digit ? "border-blue-500 bg-gray-50" : "border-gray-300"
                } rounded-lg text-3xl font-semibold text-center mx-2 text-gray-900`}
                value={digit}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={4}
                selectTextOnFocus={true}
              />
            ))}
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            className={`w-full rounded-lg py-4 items-center mb-6 ${
              isLoading ? "bg-[#ffc66d]" : "bg-[#ffb133]"
            }`}
            onPress={handleContinue}
            disabled={isLoading}
          >
            <Text className="text-white text-base font-semibold">
              {isLoading ? "Verifying..." : "Continue"}
            </Text>
          </TouchableOpacity>

          {/* Resend Code */}
          <View className="flex-row mb-8">
            <Text className="text-gray-500 text-sm">
              Didn't receive the email?{" "}
            </Text>
            <TouchableOpacity onPress={handleResend} disabled={isLoading}>
              <Text className="text-[#ffb133] text-sm font-medium">
                Click to resend
              </Text>
            </TouchableOpacity>
          </View>

          {/* Back to Login */}
          <TouchableOpacity
            className="mt-4"
            onPress={() => router.replace("/(auth)/sign_in")}
          >
            <Text className="text-gray-500 text-base">← Back to log in</Text>
          </TouchableOpacity>
        </View>

        {/* Custom Success Modal */}
        <SuccessModal
          visible={successModalVisible}
          title="Verification Successful"
          message="Your code has been verified successfully."
          onClose={handleSuccessModalClose}
        />

        {/* Custom Error Modal */}
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

export default VerificationCode;
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { icons } from '@/constants';
import apiHandler from '@/context/ApiHandler';
import ErrorModal from '@/Components/ErrorModel';
import SuccessModal from '@/Components/SuccessModel';


const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleResetPassword = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
      setErrorMessage('Please enter your email address');
      setErrorModalVisible(true);
      return;
    }

    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address');
      setErrorModalVisible(true);
      return;
    }

    setIsLoading(true);
   
    try {
        const response = await apiHandler.post('/user/requestotp', {email});
        if(response.status === 200) {           
            setTimeout(() => {
              setIsLoading(false);
              setSuccessModalVisible(true);
            }, 1000);
        }
     
    } catch (error: any) {
        setIsLoading(false);
        const message = error.response?.data?.message || "Failed to connect to server";
        setErrorMessage(`${message}. Please try again.`);
        setErrorModalVisible(true);
      }
  };

  // Handle success modal close and navigation
  const handleSuccessModalClose = () => {
    setSuccessModalVisible(false);
    router.replace({
        pathname: '/(auth)/otp',
        params: { email: email }
    });
  };

  // Handle error modal close
  const handleErrorModalClose = () => {
    setErrorModalVisible(false);
  };

  // Dismiss keyboard when tapping outside the input
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView 
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            <View className="flex-1 bg-white px-6 pt-28 pb-8">
              <View className="items-center justify-start">
                {/* Fingerprint Icon */}
                <View className="w-24 h-24 bg-blue-100 rounded-full justify-center items-center mb-8 mt-12">
                  <Image source={icons.fingerprint} className="w-12 h-12" />
                </View>

                {/* Title and Subtitle */}
                <Text className="text-3xl font-bold text-gray-800 mb-4">
                  Forgot Password?
                </Text>
                <Text className="text-gray-600 text-center mb-10 px-4">
                  No worries, we'll send you reset instructions.
                </Text>

                {/* Email Input */}
                <View className="w-full mb-8">
                  <Text className="text-gray-700 mb-2 font-medium">Email</Text>
                  <TextInput 
                    placeholder="Enter your email"
                    placeholderTextColor="gray"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="border border-gray-300 rounded-lg px-4 py-4 text-base w-full"
                  />
                </View>

                {/* Reset Password Button */}
                <TouchableOpacity 
                  onPress={handleResetPassword}
                  disabled={isLoading}
                  className={`w-full rounded-lg py-4 items-center mb-6 ${isLoading ? 'bg-[#ffc66d]' : 'bg-[#ffb133]'}`}
                >
                  <Text className="text-white text-lg font-semibold">
                    {isLoading ? 'Sending...' : 'Reset Password'}
                  </Text>
                </TouchableOpacity>

                {/* Back to Login */}
                <TouchableOpacity 
                  onPress={() => router.replace('/(auth)/sign_in')}
                  className="flex-row items-center"
                >
                  <Text className="text-gray-600 text-base">← Back to log in</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      {/* Custom Success Modal */}
      <SuccessModal
        visible={successModalVisible}
        title="Reset Instructions Sent"
        message="We've sent password reset instructions to your email."
        onClose={handleSuccessModalClose}
      />

      {/* Custom Error Modal */}
      <ErrorModal
        visible={errorModalVisible}
        title="Error"
        message={errorMessage}
        onClose={handleErrorModalClose}
      />
    </View>
  );
};

export default ForgotPassword;
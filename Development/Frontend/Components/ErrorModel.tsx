import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

interface ErrorModalProps {
  visible: boolean;
  message: string;
  title?: string;
  onClose: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ visible, message, title, onClose }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/40">
        <View className="bg-white w-4/5 rounded-xl p-6 items-center shadow-lg">
          {/* Error Icon */}
          <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-4">
            <AntDesign name="close" size={32} color="#ef4444" />
          </View>
          
          {/* Title */}
          <Text className="text-xl font-bold text-gray-800 mb-2">
            {title || "Error"}
          </Text>
          
          {/* Message */}
          <Text className="text-gray-600 text-center mb-6">
            {message}
          </Text>
          
          {/* Button */}
          <TouchableOpacity
            className="bg-[#ffb133] w-full py-3 rounded-lg items-center"
            onPress={onClose}
          >
            <Text className="text-white font-semibold text-base">
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ErrorModal;
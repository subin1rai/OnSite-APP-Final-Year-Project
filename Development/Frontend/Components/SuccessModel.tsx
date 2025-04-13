import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

interface SuccessModalProps {
  visible: boolean;
  message: string;
  title: string;
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ visible, message, title, onClose }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/40">
        <View className="bg-white w-4/5 rounded-xl p-6 items-center shadow-lg">
          {/* Success Icon */}
          <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4">
            <AntDesign name="check" size={32} color="#22c55e" />
          </View>
          
          {/* Title */}
          <Text className="text-xl font-bold text-gray-800 mb-2">
            {title}
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
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default SuccessModal;
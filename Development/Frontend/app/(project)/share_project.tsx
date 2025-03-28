import apiHandler from '@/context/ApiHandler';
import { useProjectStore } from '@/store/projectStore';
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Keyboard,
  Modal,
  StatusBar,
  SafeAreaView,
  TouchableWithoutFeedback
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface ProjectData {
    projectName: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    budget: {
      amount: number;
    }[];
}

const ShareProject = () => {
    const { selectedProject } = useProjectStore();
    const [code, setCode] = useState<string[]>(['', '', '', '', '']);
    const [showSuccess, setShowSuccess] = useState<boolean>(false);
    const inputRefs = useRef<(TextInput | null)[]>([]);
    
    // Initialize refs array
    useEffect(() => {
        inputRefs.current = inputRefs.current.slice(0, 5);
    }, []);

    // Handle code input change
    const handleCodeChange = (text: string, index: number): void => {
        if (text.length > 1) {
            // Handle paste of full code
            const pastedCode = text.slice(0, 5).split('');
            const newCode = [...code];

            pastedCode.forEach((char, i) => {
                if (i + index < 5) {
                    newCode[i + index] = char;
                }
            });

            setCode(newCode);
            const lastIndex = Math.min(index + pastedCode.length, 4);
            inputRefs.current[lastIndex]?.focus();
            Keyboard.dismiss();
        } else {
            // Handle single digit input
            const newCode = [...code];
            newCode[index] = text;
            setCode(newCode);
            if (text !== '' && index < 4) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    // Handle backspace navigation
    const handleKeyPress = (e: any, index: number): void => {
        if (e.nativeEvent.key === 'Backspace' && code[index] === '' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleInvite = async () => {
        const inviteCode = code.join('');
        if (inviteCode.length === 5) {
            try {
                const response = await apiHandler.put('/shareProject', {
                    projectId: selectedProject?.id,
                    shareId: inviteCode
                });
                
                // Show success alert
                setShowSuccess(true);
            
                
            } catch (error) {
                console.log("Error adding user");
            }
        }
    };

    const closeSuccess = () => {
        setShowSuccess(false);
        setCode(['', '', '', '', '']);
    };

    // Function to dismiss keyboard when tapping outside
    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    return (
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <SafeAreaView className="flex-1 bg-gray-50">
                <StatusBar backgroundColor="#f9fafb" barStyle="dark-content" />

                {/* Main Input UI */}
                <View className="flex-1 px-6 pt-8">
                    <View className="flex-row items-center mb-8">
                        <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3">
                            <Ionicons name="people" size={20} color="#FDB541" />
                        </View>
                        <Text className="text-xl font-bold text-gray-800">Invite Client in project</Text>
                    </View>

                    <View className="bg-white rounded-3xl p-5 mb-6" style={{ elevation: 2 }}>
                        <Text className="text-gray-500 mb-5">
                            Enter the 5-digit invitation code to add a client to {selectedProject?.projectName || 'your project'}
                        </Text>
                        
                        <View className="flex-row justify-between items-center mb-8">
                            {code.map((digit, index) => (
                                <View 
                                    key={index} 
                                    className={`rounded-2xl h-14 w-14 border-2 ${digit ? 'border-[#FDB541] bg-[#fbe7c8]' : 'border-gray-200 bg-gray-50'} justify-center items-center`}
                                >
                                    <TextInput
                                        ref={ref => inputRefs.current[index] = ref}
                                        className="text-center text-xl font-semibold text-black"
                                        style={{ height: 56, width: 56 }}
                                        keyboardType="number-pad"
                                        maxLength={1}
                                        value={digit}
                                        onChangeText={(text) => handleCodeChange(text, index)}
                                        onKeyPress={(e) => handleKeyPress(e, index)}
                                        selectionColor="#FDB541"
                                    />
                                </View>
                            ))}
                        </View>
                        
                        <TouchableOpacity 
                            className={`bg-[#FDB541] rounded-xl py-4 items-center ${code.join('').length !== 5 ? 'opacity-50' : ''}`}
                            onPress={handleInvite}
                            disabled={code.join('').length !== 5}
                            style={{ elevation: 1 }}
                        >
                            <Text className="text-white font-semibold">Send Invitation</Text>
                        </TouchableOpacity>
                    </View>
                    
                    <View className="flex-row items-center mt-auto mb-6">
                        <Ionicons name="information-circle-outline" size={18} color="#6B7280" />
                        <Text className="text-gray-500 text-sm ml-2">
                            You can find invitation codes in your team settings
                        </Text>
                    </View>
                </View>

                {/* Success Alert Modal */}
                <Modal
                    transparent={true}
                    visible={showSuccess}
                    animationType="fade"
                    onRequestClose={closeSuccess}
                >
                    <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                        <View className="w-10/12 bg-white rounded-2xl overflow-hidden" style={{ elevation: 5 }}>
                            {/* Success color bar */}
                            <View className="h-2 bg-[#4CAF50]" />
                            
                            <View className="p-5">
                                <View className="flex-row items-center mb-4">
                                    <View className="w-12 h-12 rounded-full bg-[#E8F5E9] items-center justify-center mr-3">
                                        <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-lg font-bold text-gray-800">Success</Text>
                                        <Text className="text-gray-600">Client has been added to the project</Text>
                                    </View>
                                </View>
                                
                                <View className="flex-row justify-end mt-2">
                                
                                    <TouchableOpacity 
                                        className="py-2 px-5 rounded-lg bg-gray-100"
                                        onPress={closeSuccess}
                                    >
                                        <Text className="text-gray-700 font-medium">Close</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
};

export default ShareProject;
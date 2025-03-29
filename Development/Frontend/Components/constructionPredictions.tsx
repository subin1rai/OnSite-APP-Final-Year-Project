import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    Alert,
    Keyboard,
    TouchableWithoutFeedback,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    Modal,
    FlatList
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import apiHandler from "@/context/ApiHandler";

// Add onPredictionComplete callback to pass the prediction result back to parent
const ConstructionPredictions = ({ onPredictionComplete, initialArea = "", initialLocation = "" }) => {
    // Numeric fields
    const [area, setArea] = useState(initialArea || "");
    const [floors, setFloors] = useState("");
    const [bedrooms, setBedrooms] = useState("");
    const [bathrooms, setBathrooms] = useState("");

    // Categorical fields
    const [houseType, setHouseType] = useState("apartment");
    const [foundationType, setFoundationType] = useState("RCC");
    const [materialQuality, setMaterialQuality] = useState("standard");
    const [location, setLocation] = useState(initialLocation || "Kathmandu");
    const [roofType, setRoofType] = useState("RCC");
    const [parking, setParking] = useState("yes");
    const [additionalFeature, setAdditionalFeature] = useState("none");

    // Modal visibility states
    const [houseTypeModalVisible, setHouseTypeModalVisible] = useState(false);
    const [foundationTypeModalVisible, setFoundationTypeModalVisible] = useState(false);
    const [materialQualityModalVisible, setMaterialQualityModalVisible] = useState(false);
    const [locationModalVisible, setLocationModalVisible] = useState(false);
    const [roofTypeModalVisible, setRoofTypeModalVisible] = useState(false);
    const [parkingModalVisible, setParkingModalVisible] = useState(false);
    const [additionalFeatureModalVisible, setAdditionalFeatureModalVisible] = useState(false);
    const [resultModalVisible, setResultModalVisible] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);
    const [predictionValue, setPredictionValue] = useState(0);

    // Available options arrays (unchanged)
    const houseTypes = ["apartment", "modern", "traditional"];
    const foundationTypes = ["RCC", "normal", "pile"];
    const materialQualities = ["low", "standard", "premium"];
    const locations = ["Bhaktapur", "Kathmandu", "Lalitpur", "Pokhara", "Terai"];
    const roofTypes = ["RCC", "flat", "metal", "sloped"];
    const parkingOptions = ["yes", "no"];
    const additionalFeatures = ["none", "basement", "garden", "solar panels", "swimming pool"];

    const formatNumber = (num) => {
        if (num === undefined || num === null) return "0";
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    const validateInputs = () => {
        const numericFields = [
            { value: area, name: "Total Area" },
            { value: floors, name: "Floors" },
            { value: bedrooms, name: "Bedrooms" },
            { value: bathrooms, name: "Bathrooms" }
        ];

        for (const field of numericFields) {
            if (!field.value || field.value.trim() === "") {
                Alert.alert("Validation Error", `${field.name} is required`);
                return false;
            }
            
            if (isNaN(Number(field.value))) {
                Alert.alert("Validation Error", `${field.name} must be a number`);
                return false;
            }
            
            if (Number(field.value) <= 0) {
                Alert.alert("Validation Error", `${field.name} must be greater than zero`);
                return false;
            }
        }
        
        return true;
    };

    const prepareOneHotEncodedData = () => {
        const oneHotData = {};
        
        // Set all options to 0
        houseTypes.forEach(type => {
            oneHotData[`House Type_${type}`] = 0;
        });
        
        foundationTypes.forEach(type => {
            oneHotData[`Foundation Type_${type}`] = 0;
        });
        
        materialQualities.forEach(quality => {
            oneHotData[`Material Quality_${quality}`] = 0;
        });
        
        locations.forEach(loc => {
            oneHotData[`Location_${loc}`] = 0;
        });
        
        roofTypes.forEach(type => {
            oneHotData[`Roof Type_${type}`] = 0;
        });
        
        parkingOptions.forEach(option => {
            oneHotData[`Parking_${option}`] = 0;
        });
        
        additionalFeatures.forEach(feature => {
            oneHotData[`Additional Features_${feature}`] = 0;
        });
        
        // Set selected values to 1
        oneHotData[`House Type_${houseType}`] = 1;
        oneHotData[`Foundation Type_${foundationType}`] = 1;
        oneHotData[`Material Quality_${materialQuality}`] = 1;
        oneHotData[`Location_${location}`] = 1;
        oneHotData[`Roof Type_${roofType}`] = 1;
        oneHotData[`Parking_${parking}`] = 1;
        oneHotData[`Additional Features_${additionalFeature}`] = 1;
        
        return oneHotData;
    };

    const handlePrediction = async () => {
        Keyboard.dismiss(); 
        
        if (!validateInputs()) return;
        
        setLoading(true);
        try {
            // Prepare numeric data
            const numericData = {
                "Total Area (sq. ft.)": parseInt(floors) * parseFloat(area),
                "Floors": parseInt(floors),
                "Bedrooms": parseInt(bedrooms),
                "Bathrooms": parseInt(bathrooms)
            };
            const oneHotData = prepareOneHotEncodedData();
            
            // Combine all data
            const requestData = {
                ...numericData,
                ...oneHotData
            };
            
            console.log("Sending Construction Data:", requestData);

            const responseData = await apiHandler.post("/construction", requestData);
            setResponse(responseData.data);
            
            if (responseData.data && responseData.data.error) {
                Alert.alert("Prediction Error", responseData.data.error);
            } else if (!responseData.data || responseData.data.construction_predicted_price === undefined) {
                Alert.alert("Prediction Error", "Unexpected response format from server.");
            } else {
                // Get the prediction value
                const predictedPrice = responseData.data.construction_predicted_price;
                setPredictionValue(predictedPrice);
                
                // Create building summary
                const buildingSummary = {
                    area: area,
                    totalArea: parseInt(floors) * parseFloat(area),
                    location: location,
                    houseType: houseType.charAt(0).toUpperCase() + houseType.slice(1),
                    materialQuality: materialQuality.charAt(0).toUpperCase() + materialQuality.slice(1),
                    bedrooms: bedrooms,
                    bathrooms: bathrooms,
                    floors: floors
                };
                
                // Pass the prediction back to the parent component if callback exists
                if (onPredictionComplete) {
                    onPredictionComplete(predictedPrice, buildingSummary);
                } else {
                    // Otherwise show the modal
                    setResultModalVisible(true);
                }
            }
        } catch (error) {
            console.error("API Error:", error);
            Alert.alert("Prediction Error", "Failed to get prediction. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    // Component UI remains the same...
    const DropdownItem = ({ item, selected, onPress }) => (
        <TouchableOpacity 
            className={`py-3 px-1 border-b border-gray-100 flex-row justify-between items-center ${selected ? 'bg-yellow-50' : ''}`}
            onPress={onPress}
        >
            <Text className={`text-base ${selected ? 'text-yellow-600 font-medium' : 'text-gray-800'}`}>
                {typeof item === 'string' ? (
                    item.charAt(0).toUpperCase() + item.slice(1)
                ) : (
                    typeof item === 'object' && 'label' in item ? item.label : String(item)
                )}
            </Text>
            {selected && (
                <Ionicons name="checkmark-circle" size={20} color="#F59E0B" />
            )}
        </TouchableOpacity>
    );

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="flex-1">
                <View className="px-4 pb-4">
                    <Text className="text-xl font-bold text-gray-800 mb-4">Construction Cost Calculator</Text>
                </View>
                
                <ScrollView 
                    className="flex-1 px-4" 
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Rest of the component JSX as before... */}
                    
                    {/* Building Dimensions */}
                    <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
                        <Text className="text-lg font-semibold text-gray-800 mb-3">Building Specifications</Text>
                        
                        <View className="mb-3">
                            <Text className="text-sm font-medium text-gray-600 mb-1.5">Total Area (sq. ft)</Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-300 rounded-xl p-3 text-base text-gray-800"
                                value={area}
                                onChangeText={setArea}
                                keyboardType="numeric"
                                placeholder="Enter total area"
                            />
                        </View>

                        <View className="flex-row flex-wrap justify-between">
                            <View className="w-[48%] mb-3">
                                <Text className="text-sm font-medium text-gray-600 mb-1.5">Floors</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-300 rounded-xl p-3 text-base text-gray-800"
                                    value={floors}
                                    onChangeText={setFloors}
                                    keyboardType="numeric"
                                    placeholder="0"
                                />
                            </View>
                            
                            <View className="w-[48%] mb-3">
                                <Text className="text-sm font-medium text-gray-600 mb-1.5">Bedrooms</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-300 rounded-xl p-3 text-base text-gray-800"
                                    value={bedrooms}
                                    onChangeText={setBedrooms}
                                    keyboardType="numeric"
                                    placeholder="0"
                                />
                            </View>
                            
                            <View className="w-[48%] mb-3">
                                <Text className="text-sm font-medium text-gray-600 mb-1.5">Bathrooms</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-300 rounded-xl p-3 text-base text-gray-800"
                                    value={bathrooms}
                                    onChangeText={setBathrooms}
                                    keyboardType="numeric"
                                    placeholder="0"
                                />
                            </View>
                            
                            <View className="w-[48%] mb-3">
                                <Text className="text-sm font-medium text-gray-600 mb-1.5">Parking</Text>
                                <TouchableOpacity 
                                    className="bg-gray-50 border border-gray-300 rounded-xl p-3 flex-row justify-between items-center"
                                    onPress={() => setParkingModalVisible(true)}
                                >
                                    <Text className="text-base text-gray-800">{parking === "yes" ? "Yes" : "No"}</Text>
                                    <Ionicons name="chevron-down" size={20} color="#64748B" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Building Details */}
                    <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
                        <Text className="text-lg font-semibold text-gray-800 mb-3">Building Details</Text>

                        <View className="mb-3">
                            <Text className="text-sm font-medium text-gray-600 mb-1.5">House Type</Text>
                            <TouchableOpacity 
                                className="bg-gray-50 border border-gray-300 rounded-xl p-3 flex-row justify-between items-center"
                                onPress={() => setHouseTypeModalVisible(true)}
                            >
                                <Text className="text-base text-gray-800">{houseType.charAt(0).toUpperCase() + houseType.slice(1)}</Text>
                                <Ionicons name="chevron-down" size={20} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <View className="mb-3">
                            <Text className="text-sm font-medium text-gray-600 mb-1.5">Foundation Type</Text>
                            <TouchableOpacity 
                                className="bg-gray-50 border border-gray-300 rounded-xl p-3 flex-row justify-between items-center"
                                onPress={() => setFoundationTypeModalVisible(true)}
                            >
                                <Text className="text-base text-gray-800">{foundationType}</Text>
                                <Ionicons name="chevron-down" size={20} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <View className="mb-3">
                            <Text className="text-sm font-medium text-gray-600 mb-1.5">Material Quality</Text>
                            <TouchableOpacity 
                                className="bg-gray-50 border border-gray-300 rounded-xl p-3 flex-row justify-between items-center"
                                onPress={() => setMaterialQualityModalVisible(true)}
                            >
                                <Text className="text-base text-gray-800">{materialQuality.charAt(0).toUpperCase() + materialQuality.slice(1)}</Text>
                                <Ionicons name="chevron-down" size={20} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <View className="mb-3">
                            <Text className="text-sm font-medium text-gray-600 mb-1.5">Location</Text>
                            <TouchableOpacity 
                                className="bg-gray-50 border border-gray-300 rounded-xl p-3 flex-row justify-between items-center"
                                onPress={() => setLocationModalVisible(true)}
                            >
                                <Text className="text-base text-gray-800">{location}</Text>
                                <Ionicons name="chevron-down" size={20} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <View className="mb-3">
                            <Text className="text-sm font-medium text-gray-600 mb-1.5">Roof Type</Text>
                            <TouchableOpacity 
                                className="bg-gray-50 border border-gray-300 rounded-xl p-3 flex-row justify-between items-center"
                                onPress={() => setRoofTypeModalVisible(true)}
                            >
                                <Text className="text-base text-gray-800">{roofType}</Text>
                                <Ionicons name="chevron-down" size={20} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <View className="mb-3">
                            <Text className="text-sm font-medium text-gray-600 mb-1.5">Additional Features</Text>
                            <TouchableOpacity 
                                className="bg-gray-50 border border-gray-300 rounded-xl p-3 flex-row justify-between items-center"
                                onPress={() => setAdditionalFeatureModalVisible(true)}
                            >
                                <Text className="text-base text-gray-800">
                                    {additionalFeature === "none" ? "None" : 
                                        additionalFeature.charAt(0).toUpperCase() + additionalFeature.slice(1)}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color="#64748B" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="mb-6">
                        <TouchableOpacity 
                            className="bg-[#FCA311] py-4 rounded-xl items-center mb-4"
                            onPress={handlePrediction}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text className="text-white font-semibold text-base">Calculate Construction Cost</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* House Type Modal */}
                    <Modal
                        animationType="fade"
                        transparent={true}
                        visible={houseTypeModalVisible}
                        onRequestClose={() => setHouseTypeModalVisible(false)}
                    >
                        <View className="flex-1 bg-black/50 justify-end">
                            <View className="bg-white rounded-t-3xl p-5 max-h-[70%]">
                                <View className="flex-row justify-between items-center mb-4 pb-2 border-b border-gray-200">
                                    <Text className="text-lg font-semibold text-gray-800">Select House Type</Text>
                                    <TouchableOpacity onPress={() => setHouseTypeModalVisible(false)}>
                                        <Ionicons name="close" size={24} color="#64748B" />
                                    </TouchableOpacity>
                                </View>
                                
                                <FlatList
                                    data={houseTypes}
                                    keyExtractor={(item) => item}
                                    renderItem={({ item }) => (
                                        <DropdownItem
                                            item={item}
                                            selected={houseType === item}
                                            onPress={() => {
                                                setHouseType(item);
                                                setHouseTypeModalVisible(false);
                                            }}
                                        />
                                    )}
                                    className="max-h-[400px]"
                                />
                            </View>
                        </View>
                    </Modal>

                    {/* Foundation Type Modal */}
                    <Modal
                        animationType="fade"
                        transparent={true}
                        visible={foundationTypeModalVisible}
                        onRequestClose={() => setFoundationTypeModalVisible(false)}
                    >
                        <View className="flex-1 bg-black/50 justify-end">
                            <View className="bg-white rounded-t-3xl p-5 max-h-[70%]">
                                <View className="flex-row justify-between items-center mb-4 pb-2 border-b border-gray-200">
                                    <Text className="text-lg font-semibold text-gray-800">Select Foundation Type</Text>
                                    <TouchableOpacity onPress={() => setFoundationTypeModalVisible(false)}>
                                        <Ionicons name="close" size={24} color="#64748B" />
                                    </TouchableOpacity>
                                </View>
                                
                                <FlatList
                                    data={foundationTypes}
                                    keyExtractor={(item) => item}
                                    renderItem={({ item }) => (
                                        <DropdownItem
                                            item={item}
                                            selected={foundationType === item}
                                            onPress={() => {
                                                setFoundationType(item);
                                                setFoundationTypeModalVisible(false);
                                            }}
                                        />
                                    )}
                                    className="max-h-[400px]"
                                />
                            </View>
                        </View>
                    </Modal>

                    {/* Material Quality Modal */}
                    <Modal
                        animationType="fade"
                        transparent={true}
                        visible={materialQualityModalVisible}
                        onRequestClose={() => setMaterialQualityModalVisible(false)}
                    >
                        <View className="flex-1 bg-black/50 justify-end">
                            <View className="bg-white rounded-t-3xl p-5 max-h-[70%]">
                                <View className="flex-row justify-between items-center mb-4 pb-2 border-b border-gray-200">
                                    <Text className="text-lg font-semibold text-gray-800">Select Material Quality</Text>
                                    <TouchableOpacity onPress={() => setMaterialQualityModalVisible(false)}>
                                        <Ionicons name="close" size={24} color="#64748B" />
                                    </TouchableOpacity>
                                </View>
                                
                                <FlatList
                                    data={materialQualities}
                                    keyExtractor={(item) => item}
                                    renderItem={({ item }) => (
                                        <DropdownItem
                                            item={item}
                                            selected={materialQuality === item}
                                            onPress={() => {
                                                setMaterialQuality(item);
                                                setMaterialQualityModalVisible(false);
                                            }}
                                        />
                                    )}
                                    className="max-h-[400px]"
                                />
                            </View>
                        </View>
                    </Modal>

                    {/* Location Modal */}
                    <Modal
                        animationType="fade"
                        transparent={true}
                        visible={locationModalVisible}
                        onRequestClose={() => setLocationModalVisible(false)}
                    >
                        <View className="flex-1 bg-black/50 justify-end">
                            <View className="bg-white rounded-t-3xl p-5 max-h-[70%]">
                                <View className="flex-row justify-between items-center mb-4 pb-2 border-b border-gray-200">
                                    <Text className="text-lg font-semibold text-gray-800">Select Location</Text>
                                    <TouchableOpacity onPress={() => setLocationModalVisible(false)}>
                                        <Ionicons name="close" size={24} color="#64748B" />
                                    </TouchableOpacity>
                                </View>
                                
                                <FlatList
                                    data={locations}
                                    keyExtractor={(item) => item}
                                    renderItem={({ item }) => (
                                        <DropdownItem
                                            item={item}
                                            selected={location === item}
                                            onPress={() => {
                                                setLocation(item);
                                                setLocationModalVisible(false);
                                            }}
                                        />
                                    )}
                                    className="max-h-[400px]"
                                />
                            </View>
                        </View>
                    </Modal>

                    {/* Roof Type Modal */}
                    <Modal
                        animationType="fade"
                        transparent={true}
                        visible={roofTypeModalVisible}
                        onRequestClose={() => setRoofTypeModalVisible(false)}
                    >
                        <View className="flex-1 bg-black/50 justify-end">
                            <View className="bg-white rounded-t-3xl p-5 max-h-[70%]">
                                <View className="flex-row justify-between items-center mb-4 pb-2 border-b border-gray-200">
                                    <Text className="text-lg font-semibold text-gray-800">Select Roof Type</Text>
                                    <TouchableOpacity onPress={() => setRoofTypeModalVisible(false)}>
                                        <Ionicons name="close" size={24} color="#64748B" />
                                    </TouchableOpacity>
                                </View>
                                
                                <FlatList
                                    data={roofTypes}
                                    keyExtractor={(item) => item}
                                    renderItem={({ item }) => (
                                        <DropdownItem
                                            item={item}
                                            selected={roofType === item}
                                            onPress={() => {
                                                setRoofType(item);
                                                setRoofTypeModalVisible(false);
                                            }}
                                        />
                                    )}
                                    className="max-h-[400px]"
                                />
                            </View>
                        </View>
                    </Modal>

                    {/* Parking Modal */}
                    <Modal
                        animationType="fade"
                        transparent={true}
                        visible={parkingModalVisible}
                        onRequestClose={() => setParkingModalVisible(false)}
                    >
                        <View className="flex-1 bg-black/50 justify-end">
                            <View className="bg-white rounded-t-3xl p-5 max-h-[70%]">
                                <View className="flex-row justify-between items-center mb-4 pb-2 border-b border-gray-200">
                                    <Text className="text-lg font-semibold text-gray-800">Select Parking Option</Text>
                                    <TouchableOpacity onPress={() => setParkingModalVisible(false)}>
                                        <Ionicons name="close" size={24} color="#64748B" />
                                    </TouchableOpacity>
                                </View>
                                
                                <FlatList
                                    data={parkingOptions.map(option => ({
                                        value: option,
                                        label: option === "yes" ? "Yes" : "No"
                                    }))}
                                    keyExtractor={(item) => item.value}
                                    renderItem={({ item }) => (
                                        <DropdownItem
                                            item={item}
                                            selected={parking === item.value}
                                            onPress={() => {
                                                setParking(item.value);
                                                setParkingModalVisible(false);
                                            }}
                                        />
                                    )}
                                    className="max-h-[400px]"
                                />
                            </View>
                        </View>
                    </Modal>

                    {/* Additional Features Modal */}
                    <Modal
                        animationType="fade"
                        transparent={true}
                        visible={additionalFeatureModalVisible}
                        onRequestClose={() => setAdditionalFeatureModalVisible(false)}
                    >
                        <View className="flex-1 bg-black/50 justify-end">
                            <View className="bg-white rounded-t-3xl p-5 max-h-[70%]">
                                <View className="flex-row justify-between items-center mb-4 pb-2 border-b border-gray-200">
                                    <Text className="text-lg font-semibold text-gray-800">Select Additional Feature</Text>
                                    <TouchableOpacity onPress={() => setAdditionalFeatureModalVisible(false)}>
                                        <Ionicons name="close" size={24} color="#64748B" />
                                    </TouchableOpacity>
                                </View>
                                
                                <FlatList
                                    data={additionalFeatures}
                                    keyExtractor={(item) => item}
                                    renderItem={({ item }) => (
                                        <DropdownItem
                                            item={item === "none" ? "None" : item.charAt(0).toUpperCase() + item.slice(1)}
                                            selected={additionalFeature === item}
                                            onPress={() => {
                                                setAdditionalFeature(item);
                                                setAdditionalFeatureModalVisible(false);
                                            }}
                                        />
                                    )}
                                    className="max-h-[400px]"
                                />
                            </View>
                        </View>
                    </Modal>

                    {/* Result Modal */}
                    <Modal
                        animationType="fade"
                        transparent={true}
                        visible={resultModalVisible}
                        onRequestClose={() => setResultModalVisible(false)}
                    >
                        <View className="flex-1 bg-black/60 justify-center items-center px-5">
                            <View className="bg-white rounded-3xl p-6 w-full max-w-md">
                                <View className="items-center">
                                    <View className="bg-yellow-100 p-4 rounded-full mb-4">
                                        <Ionicons name="home" size={36} color="#d97706" />
                                    </View>
                                    
                                    <Text className="text-xl font-bold text-gray-800 mb-2">Estimated Construction Cost</Text>
                                    <Text className="text-3xl font-bold text-yellow-600 mb-3">
                                        {formatNumber(predictionValue)}
                                    </Text>
                                    
                                    <Text className="text-sm text-gray-500 text-center mb-6">
                                        This is an estimate based on the provided specifications and market data analysis.
                                    </Text>
                                    
                                    <View className="bg-gray-100 rounded-xl p-4 w-full mb-6">
                                        <Text className="text-sm font-medium text-gray-800 mb-2">Building Summary</Text>
                                        <View className="flex-row justify-between">
                                            <Text className="text-xs text-gray-600">Rooms:</Text>
                                            <Text className="text-xs font-medium text-gray-800">{bedrooms} Bed, {bathrooms} Bath</Text>
                                        </View>
                                    </View>
                                    
                                    <TouchableOpacity 
                                        className="bg-[#FCA311] py-4 px-6 rounded-xl w-full items-center"
                                        onPress={() => setResultModalVisible(false)}
                                    >
                                        <Text className="text-white font-semibold">Close</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </ScrollView>
            </View>
        </TouchableWithoutFeedback>
    );
};

export default ConstructionPredictions;

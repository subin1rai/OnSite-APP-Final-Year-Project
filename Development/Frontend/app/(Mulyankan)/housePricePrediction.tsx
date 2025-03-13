import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity,
  ScrollView, 
  SafeAreaView,
  ActivityIndicator,
  Modal,
  FlatList,
  Pressable
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import apiHandler from "@/context/ApiHandler";

const HousePricePrediction = () => {
  const [landArea, setLandArea] = useState("");
  const [roadAccess, setRoadAccess] = useState("");
  const [floor, setFloor] = useState("");
  const [bedroom, setBedroom] = useState("");
  const [bathroom, setBathroom] = useState("");
  const [cars, setCars] = useState("");
  const [bikes, setBikes] = useState("");

  const [location, setLocation] = useState("Baneswhor, Kathmandu");
  const [facing, setFacing] = useState("East");
  
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [facingModalVisible, setFacingModalVisible] = useState(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  
  const [loading, setLoading] = useState(false);

  const locations = [
   "Chitwan",
    "Kathmandu", 
    "Lalitpur"
  ];
  
  const facings = [
    "East", 
    "West", 
    "North", 
    "South", 
    "North-East", 
    "South-East", 
    "South-West", 
    "North-West"
  ];
  
  const [prediction, setPrediction] = useState(null);

  const getPrediction = async () => {
    setLoading(true);
    
    try {
      const response = await apiHandler.post("/predict", {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          "LAND AREA": parseFloat(landArea) || 0,
          "ROAD ACCESS": parseFloat(roadAccess) || 0,
          "FLOOR": parseInt(floor) || 0,
          "BEDROOM": parseInt(bedroom) || 0,
          "BATHROOM": parseInt(bathroom) || 0,
          "CARS": parseInt(cars) || 0,
          "BIKES": parseInt(bikes) || 0,
          ["LOCATION_" + location]: 1,
          ["FACING_" + facing.replace("-", "_").replace(" ", "_")]: 1
        }),
      });

      const data = response.data;
      setPrediction(data.predicted_price);
      setResultModalVisible(true);
    } catch (error) {
      console.error("Prediction error:", error);
      alert("Failed to get prediction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num:number) => {
    return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0";
  };

  const resetForm = () => {
    setLandArea("");
    setRoadAccess("");
    setFloor("");
    setBedroom("");
    setBathroom("");
    setCars("");
    setBikes("");
    setLocation("Baneswhor, Kathmandu");
    setFacing("East");
    setPrediction(null);
  };

  // Custom dropdown item component
  const DropdownItem = ({ item, selected, onPress }: { item: string; selected: boolean; onPress: () => void }) => (
    <TouchableOpacity 
      className={`py-3 px-1 border-b border-gray-100 flex-row justify-between items-center ${selected ? 'bg-blue-50' : ''}`}
      onPress={onPress}
    >
      <Text className={`text-base ${selected ? 'text-blue-600 font-medium' : 'text-gray-800'}`}>
        {item}
      </Text>
      {selected && (
        <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />
      )}
    </TouchableOpacity>
  );

  // House features section (floor, bedroom, bathroom, etc.)
  const renderHouseFeatures = () => (
    <View className="bg-white rounded-2xl p-4 mx-4 mb-4 shadow-sm">
      <Text className="text-lg font-semibold text-gray-800 mb-3">House Features</Text>
      
      <View className="flex-row flex-wrap justify-between">
        <View className="w-[48%] mb-3">
          <Text className="text-sm font-medium text-gray-600 mb-1.5">Floors</Text>
          <TextInput
            className="bg-gray-50 border border-gray-300 rounded-xl p-3 text-base text-gray-800"
            value={floor}
            onChangeText={setFloor}
            keyboardType="numeric"
            placeholder="0"
          />
        </View>
        
        <View className="w-[48%] mb-3">
          <Text className="text-sm font-medium text-gray-600 mb-1.5">Bedrooms</Text>
          <TextInput
            className="bg-gray-50 border border-gray-300 rounded-xl p-3 text-base text-gray-800"
            value={bedroom}
            onChangeText={setBedroom}
            keyboardType="numeric"
            placeholder="0"
          />
        </View>
        
        <View className="w-[48%] mb-3">
          <Text className="text-sm font-medium text-gray-600 mb-1.5">Bathrooms</Text>
          <TextInput
            className="bg-gray-50 border border-gray-300 rounded-xl p-3 text-base text-gray-800"
            value={bathroom}
            onChangeText={setBathroom}
            keyboardType="numeric"
            placeholder="0"
          />
        </View>
        
        <View className="w-[48%] mb-3">
          <Text className="text-sm font-medium text-gray-600 mb-1.5">Car Parking</Text>
          <TextInput
            className="bg-gray-50 border border-gray-300 rounded-xl p-3 text-base text-gray-800"
            value={cars}
            onChangeText={setCars}
            keyboardType="numeric"
            placeholder="0"
          />
        </View>
        
        <View className="w-[48%] mb-3">
          <Text className="text-sm font-medium text-gray-600 mb-1.5">Bike Parking</Text>
          <TextInput
            className="bg-gray-50 border border-gray-300 rounded-xl p-3 text-base text-gray-800"
            value={bikes}
            onChangeText={setBikes}
            keyboardType="numeric"
            placeholder="0"
          />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* Property Dimensions */}
        <View className="bg-white rounded-2xl p-4 mx-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Property Dimensions</Text>
          
          <View className="mb-3">
            <Text className="text-sm font-medium text-gray-600 mb-1.5">Land Area (sq. ft)</Text>
            <TextInput
              className="bg-gray-50 border border-gray-300 rounded-xl p-3 text-base text-gray-800"
              value={landArea}
              onChangeText={setLandArea}
              keyboardType="numeric"
              placeholder="Enter land area"
            />
          </View>

          <View className="mb-3">
            <Text className="text-sm font-medium text-gray-600 mb-1.5">Road Access (Feet)</Text>
            <TextInput
              className="bg-gray-50 border border-gray-300 rounded-xl p-3 text-base text-gray-800"
              value={roadAccess}
              onChangeText={setRoadAccess}
              keyboardType="numeric"
              placeholder="Enter road access"
            />
          </View>
        </View>

        {renderHouseFeatures()}

        <View className="bg-white rounded-2xl p-4 mx-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Location & Facing</Text>

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
            <Text className="text-sm font-medium text-gray-600 mb-1.5">Facing Direction</Text>
            <TouchableOpacity 
              className="bg-gray-50 border border-gray-300 rounded-xl p-3 flex-row justify-between items-center"
              onPress={() => setFacingModalVisible(true)}
            >
              <Text className="text-base text-gray-800">{facing}</Text>
              <Ionicons name="chevron-down" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-4 mb-6">
          <TouchableOpacity 
            className="bg-blue-600 py-4 rounded-xl items-center mb-3"
            onPress={getPrediction}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">Predict Price</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            className="bg-gray-200 py-4 rounded-xl items-center"
            onPress={resetForm}
          >
            <Text className="text-gray-600 font-semibold text-base">Reset Form</Text>
          </TouchableOpacity>
        </View>

        <Modal
          animationType="none"
          transparent={true}
          visible={locationModalVisible}
          onRequestClose={() => setLocationModalVisible(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-3xl p-5 max-h-[70%]">
              <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-gray-200">
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

        {/* Facing Direction Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={facingModalVisible}
          onRequestClose={() => setFacingModalVisible(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-3xl p-5 max-h-[70%]">
              <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-gray-200">
                <Text className="text-lg font-semibold text-gray-800">Select Facing Direction</Text>
                <TouchableOpacity onPress={() => setFacingModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={facings}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <DropdownItem
                    item={item}
                    selected={facing === item}
                    onPress={() => {
                      setFacing(item);
                      setFacingModalVisible(false);
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
          visible={resultModalVisible && prediction !== null}
          onRequestClose={() => setResultModalVisible(false)}
        >
          <View className="flex-1 bg-black/60 justify-center items-center px-5">
            <View className="bg-white rounded-3xl p-6 w-full max-w-md">
              <View className="items-center">
                <View className="bg-green-100 p-4 rounded-full mb-4">
                  <Ionicons name="home" size={36} color="#15803D" />
                </View>
                
                <Text className="text-xl font-bold text-gray-800 mb-2">Estimated Property Value</Text>
                <Text className="text-3xl font-bold text-green-700 mb-3">
                  Rs. {formatNumber(prediction ?? 0)}
                </Text>
                
                <Text className="text-sm text-gray-500 text-center mb-6">
                  This is an estimate based on the provided information and market data analysis.
                </Text>
                
                <View className="bg-gray-100 rounded-xl p-4 w-full mb-6">
                  <Text className="text-sm font-medium text-gray-800 mb-2">Property Summary</Text>
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-xs text-gray-600">Location:</Text>
                    <Text className="text-xs font-medium text-gray-800">{location}</Text>
                  </View>
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-xs text-gray-600">Land Area:</Text>
                    <Text className="text-xs font-medium text-gray-800">{landArea} sq. ft</Text>
                  </View>
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-xs text-gray-600">Facing:</Text>
                    <Text className="text-xs font-medium text-gray-800">{facing}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-gray-600">Rooms:</Text>
                    <Text className="text-xs font-medium text-gray-800">{bedroom || 0} Bed, {bathroom || 0} Bath</Text>
                  </View>
                </View>
                
                <TouchableOpacity 
                  className="bg-blue-600 py-4 px-6 rounded-xl w-full items-center"
                  onPress={() => setResultModalVisible(false)}
                >
                  <Text className="text-white font-semibold">Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HousePricePrediction;
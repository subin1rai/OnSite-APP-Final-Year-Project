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
  StyleSheet,
  Pressable
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import apiHandler from "@/context/ApiHandler";

const HousePricePrediction = () => {
  // State for input fields
  const [landArea, setLandArea] = useState("");
  const [roadAccess, setRoadAccess] = useState("");
  const [floor, setFloor] = useState("");
  const [bedroom, setBedroom] = useState("");
  const [bathroom, setBathroom] = useState("");
  const [cars, setCars] = useState("");
  const [bikes, setBikes] = useState("");

  // State for custom dropdowns
  const [location, setLocation] = useState("Baneswhor, Kathmandu");
  const [facing, setFacing] = useState("East");
  
  // Modal visibility states
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [facingModalVisible, setFacingModalVisible] = useState(false);
  
  // Loading state
  const [loading, setLoading] = useState(false);

  // Available locations and directions
  const locations = [
    "Baneswhor, Kathmandu", 
    "Bafal, Kathmandu", 
    "Balambu, Kathmandu"
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

  // Prediction result
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
          ["LOCATION_" + location.replace(", ", "_")]: 1,
          ["FACING_" + facing.replace("-", "_").replace(" ", "_")]: 1
        }),
      });

      const data = response.data;
      setPrediction(data.predicted_price);
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
  const DropdownItem = ({ item, selected, onPress }: { item: string, selected: boolean, onPress: () => void }) => (
    <TouchableOpacity 
      style={[
        styles.dropdownItem, 
        selected && styles.dropdownItemSelected
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.dropdownItemText,
        selected && styles.dropdownItemTextSelected
      ]}>
        {item}
      </Text>
      {selected && (
        <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />
      )}
    </TouchableOpacity>
  );

  // House features section (floor, bedroom, bathroom, etc.)
  const renderHouseFeatures = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>House Features</Text>
      
      <View style={styles.featuresGrid}>
        <View style={styles.featureItem}>
          <Text style={styles.label}>Floors</Text>
          <TextInput
            style={styles.input}
            value={floor}
            onChangeText={setFloor}
            keyboardType="numeric"
            placeholder="0"
          />
        </View>
        
        <View style={styles.featureItem}>
          <Text style={styles.label}>Bedrooms</Text>
          <TextInput
            style={styles.input}
            value={bedroom}
            onChangeText={setBedroom}
            keyboardType="numeric"
            placeholder="0"
          />
        </View>
        
        <View style={styles.featureItem}>
          <Text style={styles.label}>Bathrooms</Text>
          <TextInput
            style={styles.input}
            value={bathroom}
            onChangeText={setBathroom}
            keyboardType="numeric"
            placeholder="0"
          />
        </View>
        
        <View style={styles.featureItem}>
          <Text style={styles.label}>Car Parking</Text>
          <TextInput
            style={styles.input}
            value={cars}
            onChangeText={setCars}
            keyboardType="numeric"
            placeholder="0"
          />
        </View>
        
        <View style={styles.featureItem}>
          <Text style={styles.label}>Bike Parking</Text>
          <TextInput
            style={styles.input}
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
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Property Dimensions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Property Dimensions</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Land Area (sq. ft)</Text>
            <TextInput
              style={styles.input}
              value={landArea}
              onChangeText={setLandArea}
              keyboardType="numeric"
              placeholder="Enter land area"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Road Access (Feet)</Text>
            <TextInput
              style={styles.input}
              value={roadAccess}
              onChangeText={setRoadAccess}
              keyboardType="numeric"
              placeholder="Enter road access"
            />
          </View>
        </View>

        {/* House Features */}
        {renderHouseFeatures()}

        {/* Location & Facing Custom Dropdowns */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Location & Facing</Text>

          {/* Location Custom Dropdown */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <TouchableOpacity 
              style={styles.dropdownButton}
              onPress={() => setLocationModalVisible(true)}
            >
              <Text style={styles.dropdownButtonText}>{location}</Text>
              <Ionicons name="chevron-down" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Facing Custom Dropdown */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Facing Direction</Text>
            <TouchableOpacity 
              style={styles.dropdownButton}
              onPress={() => setFacingModalVisible(true)}
            >
              <Text style={styles.dropdownButtonText}>{facing}</Text>
              <Ionicons name="chevron-down" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.predictButton}
            onPress={getPrediction}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.predictButtonText}>Predict Price</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.resetButton}
            onPress={resetForm}
          >
            <Text style={styles.resetButtonText}>Reset Form</Text>
          </TouchableOpacity>
        </View>

        {/* Prediction Result */}
        {prediction && (
          <View style={styles.resultCard}>
            <View style={styles.resultIconContainer}>
              <Ionicons name="home" size={32} color="#15803D" />
            </View>
            <Text style={styles.resultLabel}>Estimated Property Value</Text>
            <Text style={styles.resultValue}>Rs. {formatNumber(prediction)}</Text>
            <Text style={styles.resultDisclaimer}>
              This is an estimate based on the provided information.
            </Text>
          </View>
        )}

        {/* Location Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={locationModalVisible}
          onRequestClose={() => setLocationModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Location</Text>
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
                style={styles.modalList}
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
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Facing Direction</Text>
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
                style={styles.modalList}
              />
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },
  header: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 8,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#475569",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: "#1E293B",
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  featureItem: {
    width: "48%",
    marginBottom: 12,
  },
  dropdownButton: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownButtonText: {
    fontSize: 16,
    color: "#1E293B",
  },
  buttonContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  predictButton: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  predictButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  resetButton: {
    backgroundColor: "#E2E8F0",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  resetButtonText: {
    color: "#64748B",
    fontSize: 16,
    fontWeight: "600",
  },
  resultCard: {
    backgroundColor: "#ECFDF5",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  resultIconContainer: {
    backgroundColor: "#D1FAE5",
    padding: 12,
    borderRadius: 50,
    marginBottom: 12,
  },
  resultLabel: {
    fontSize: 16,
    color: "#065F46",
    fontWeight: "600",
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#064E3B",
    marginBottom: 8,
  },
  resultDisclaimer: {
    fontSize: 12,
    color: "#64748B",
    fontStyle: "italic",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
  },
  modalList: {
    maxHeight: 400,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownItemSelected: {
    backgroundColor: "#EFF6FF",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#1E293B",
  },
  dropdownItemTextSelected: {
    color: "#2563EB",
    fontWeight: "500",
  },
});

export default HousePricePrediction;
import CustomButton from "@/Components/CustomButton";
import {
  Image,
  SafeAreaView,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  Linking,
  FlatList,
  TextInput
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { useEffect, useState, useCallback, useRef } from "react";
import apiHandler from "@/context/ApiHandler";
import { icons, images } from "@/constants";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";

interface User {
  id: number;
  email: string;
  image: string | null;
  username: string;
}

interface AmbulanceService {
  name: string;
  phone: string;
  location: string;
  district: string;
}

const Profile = () => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [ambulanceServices, setAmbulanceServices] = useState<AmbulanceService[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  // Bottom sheet reference and snap points
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = ["85%"]; // Increased height for better visibility

  // Handle opening and closing the bottom sheet
  const handleOpenEmergency = () => {
    bottomSheetRef.current?.expand();
    setIsOpen(true);
  };

  const handleCloseEmergency = () => {
    bottomSheetRef.current?.close();
    setIsOpen(false);
  };

  // Custom backdrop component for bottom sheet
  const renderBackdrop = useCallback(
    (props:any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  useEffect(() => {
    const getToken = async () => {
      try {
        const accessToken = await SecureStore.getItemAsync("AccessToken");
        setToken(accessToken);
      } catch (error) {
        console.error("Error getting token:", error);
      }
    };
    getToken();
  }, []);

  const getUser = async () => {
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync("AccessToken");
      if (!token) return;

      const response = await apiHandler.get("/user/getUser", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data && response.data.user) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  };

  // Pull-to-Refresh Functionality
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await getUser();
    } catch (error) {
      console.error("Error during refresh:", error);
    }
    setRefreshing(false);
  }, []);

  useEffect(() => {
    getUser();
    prepareAmbulanceData();
  }, []);

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("AccessToken");
    setToken(null);
    router.replace("../../(auth)/sign_in");
  };

  const prepareAmbulanceData = () => {
    // This is the static data from your file, formatted into proper objects
    const rawData = [
      { name: "Nepal Ambulance Service", phone: "01-4427833,102", location: "Ghattekulo Marg, Kathmandu", district: "Kathmandu" },
      { name: "Akhil Nepal Chiya Majdur Sangh", phone: "9814952000", location: "Jhapa", district: "Jhapa" },
      { name: "Ambulance Lalitpur Municipality", phone: "9841202641,01-5527003", location: "Pulchowk, Lalitpur", district: "Lalitpur" },
      { name: "Ambulance Service Siddhartha Club", phone: "061530200,061521433", location: "Siddhartha Chowk, Pokhara", district: "Pokhara" },
      { name: "Sanjivini Ayurvedic Prakritik Chikitsaylaya", phone: "9848554800", location: "Chitwan", district: "Chitwan" },
      { name: "B. P. Smriti Hospital", phone: "9841447710", location: "Basundhara, Kathmandu", district: "Kathmandu" },
      { name: "laxmi run data smriti sewa samaj", phone: "9804910985", location: "Birtamod, Jhapa", district: "Jhapa" },
      { name: "Bhakti Parsad Smiriti Ambulance", phone: "9814910410,9842633974", location: "Jhapa", district: "Jhapa" },
      { name: "Bishal Bazar Ambulance Sewa", phone: "01-4244121", location: "Bishalbazar, Kathmandu", district: "Kathmandu" },
      { name: "Chetansheel", phone: "9842266231", location: "Morang", district: "Morang" },
      { name: "CIWEC Hospital", phone: "97411479583,9841614037,01-4435232", location: "Lazimpat, Kathmandu", district: "Kathmandu" },
      { name: "District Redcross,Bidur", phone: "98434333030,010-560070", location: "Nuwakot", district: "Nuwakot" },
      { name: "Dr. Iwamura Memorial Hospital", phone: "9860025333", location: "Sallaghari, Bhaktapur", district: "Bhaktapur" },
      { name: "Golden Hospital Pvt.Ltd.", phone: "9816391881", location: "Morang", district: "Morang" },
      { name: "Grande International Hospital", phone: "9801202545,01-5159266", location: "Dhapashi, Kathmandu", district: "Kathmandu" },
      { name: "HAMS Hospital", phone: "01-4786111", location: "Dhumbarai, Kathmandu", district: "Kathmandu" },
      { name: "Kathmandu Medical & Teaching Hospital (kishor Kumar Pandey)", phone: "9843203119", location: "Sinamangal, Kathmandu", district: "Kathmandu" },
      { name: "krishwor Bhadur Simriti Sewa", phone: "9841898941,9841639732", location: "Dhading", district: "Dhading" },
      { name: "Kirtipur Ambulance", phone: "01-4330200", location: "Kirtipur, Kathmandu", district: "Kathmandu" },
      { name: "Laxmi Ambulance (Dev Limbu)", phone: "9803639155", location: "Jhapa", district: "Jhapa" },
      { name: "Manmohan Community Hospital", phone: "9741009201,9841383460,9843694484", location: "Pharping, Dakshinkali, Kathmandu", district: "Kathmandu" },
      { name: "Model Hospital", phone: "9846311804", location: "Kaski", district: "Kaski" },
      { name: "Morang Hospital (Santosh Rai)", phone: "9805306779", location: "Patharishanischare-1, Morang", district: "Morang" },
      { name: "Nepal Ambulance Sewa", phone: "102", location: "Kathmandu", district: "Kathmandu" },
      { name: "Nepal Cancer Hospital & Research Center Pvt.Ltd", phone: "01-5251312,01-5251498", location: "Harisiddhi, Lalitpur", district: "Lalitpur" },
      { name: "Nepal Red Cross Society", phone: "01-4228094", location: "Kathmandu", district: "Kathmandu" },
      { name: "Nepal Red Cross Society(Ghauladuwa)", phone: "9815980500", location: "Jhapa", district: "Jhapa" },
      { name: "NKFMH Ambulance", phone: "9841257048", location: "Thimi, Bhaktapur", district: "Bhaktapur" },
      { name: "Norvic International Hospital", phone: "9803222222, 9801111111", location: "Thapathali, Kathmandu", district: "Kathmandu" },
      { name: "Padmakumari Smriti Pratisthan", phone: "9855059500", location: "Nuwakot", district: "Nuwakot" },
      { name: "Panchakanya Ambulance", phone: "9804984335", location: "Jhapa", district: "Jhapa" },
      { name: "Paropakar", phone: "01-4260859", location: "Kathmandu", district: "Kathmandu" },
      { name: "Rai Samaj", phone: "9849288691", location: "Kathmandu", district: "Kathmandu" },
      { name: "Red Cross Ambulance, Kohalpur", phone: "81541300", location: "Kohalpur, Banke", district: "Banke" },
      { name: "Redcross Ambulance Service", phone: "023-550100", location: "Surunga, Jhapa", district: "Jhapa" },
      { name: "Shiva Sakti Yuba Sewa", phone: "01- 4478111", location: "Kathmandu", district: "Kathmandu" },
      { name: "Siddhartha Club", phone: "061-530200", location: "Kaski", district: "Kaski" },
      { name: "Siddhi Memorial Hospital", phone: "9741204991", location: "Bhimsensthan, Bhaktapur", district: "Bhaktapur" },
      { name: "Sitaram Thyunjung", phone: "9860025333", location: "Kathmandu", district: "Kathmandu" },
      { name: "Vayodha Hospital", phone: "9802019561,01-4281666,01-2111333", location: "Balkhu Chowk, Kathmandu", district: "Kathmandu" },
      { name: "Vinayak Hospital", phone: "9803452545,01-4383152", location: "Gongabu Chowk, Kathmandu", district: "Kathmandu" },
      { name: "Green City Hospital", phone: "01-4981133", location: "Basundhara, Kathmandu", district: "Kathmandu" },
      { name: "Green City Hospital", phone: "01-4981133", location: "Basundhara, Kathmandu", district: "Dharan" }
      
    ];
    
    setAmbulanceServices(rawData);
    
    // Extract unique districts and add "All" option at the beginning
    const uniqueDistricts = ["All", ...Array.from(new Set(rawData.map(item => item.district))).sort()];
    setDistricts(uniqueDistricts);
  };

  // Handle calling the ambulance
  const handleCallAmbulance = (phoneNumber: string) => {
    // Split multiple phone numbers and take the first one
    const firstNumber = phoneNumber.split(',')[0].trim();
    
    // Check if the platform supports tel: links
    Linking.canOpenURL(`tel:${firstNumber}`)
      .then(supported => {
        if (supported) {
          return Linking.openURL(`tel:${firstNumber}`);
        } else {
          Alert.alert('Phone Dialer Not Available', 'Your device does not support phone calls');
        }
      })
      .catch(error => {
        console.error('Error trying to call: ', error);
        Alert.alert('Error', 'Could not make the call');
      });
  };

  // Filter ambulance services based on district and search query
  const filteredAmbulanceServices = ambulanceServices
    .filter(service => selectedDistrict === 'All' || service.district === selectedDistrict)
    .filter(service => 
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.district.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Render individual ambulance service item
  const renderAmbulanceItem = ({ item }: { item: AmbulanceService }) => (
    <View className="p-4 bg-white rounded-xl mb-3 shadow-sm border border-gray-100">
      <View className="flex-row justify-between">
        <View className="flex-1">
          <Text className="text-lg font-semibold">{item.name}</Text>
          <Text className="text-gray-600 mt-1">{item.location}</Text>
          <Text className="text-gray-500 text-sm mt-1">{item.phone}</Text>
        </View>
        <TouchableOpacity 
          className="justify-center px-5"
          onPress={() => handleCallAmbulance(item.phone)}
        >
          <View className="bg-red-500 p-3 rounded-full">
            <Ionicons name="call" size={24} color="white" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FCAC29" />
        </View>
      ) : (
        <ScrollView
          className="mx-6 mt-4"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FCA311" />
          }
        >
          {/* Profile Image */}
          <View className="flex-row items-center gap-4">
            {user?.image ? (
              <Image source={{ uri: user.image }} className="w-24 h-24 rounded-2xl" />
            ) : (
              <Image source={images.imageProfile} className="w-24 h-24 rounded-2xl" />
            )}

            {/* User Info */}
            <View>
              <Text className="text-2xl font-semibold mt-3">{user?.username || "User"}</Text>
              <Text className="text-gray-500">{user?.email || "No Email"}</Text>
            </View>
          </View>

          <View className="border-b border-gray-300 my-8" />

          {/* Edit Profile Button */}
          <TouchableOpacity
            className="flex-row items-center gap-4"
            onPress={() => router.push("/(profile)/editProfile")}
          >
            <View className="p-4 bg-blue-50 rounded-lg">
              <Image source={icons.person} className="w-6 h-6" />
            </View>
            <View className="flex-1 flex-row items-center justify-between py-2">
              <Text className="text-lg font-medium text-gray-600">Edit Profile</Text>
              <Ionicons name="chevron-forward" size={24} color="gray" />
            </View>
          </TouchableOpacity>

          {/* Settings */}
          <TouchableOpacity className="flex-row items-center mt-4 gap-4">
            <View className="p-4 bg-blue-50 rounded-lg">
              <Ionicons name="settings" size={24} color="black" />
            </View>
            <View className="flex-1 flex-row items-center justify-between py-2">
              <Text className="text-lg font-medium text-gray-600">Settings</Text>
              <Ionicons name="chevron-forward" size={24} color="gray" />
            </View>
          </TouchableOpacity>

          {/* FAQs */}
          <TouchableOpacity 
            className="flex-row items-center mt-4 gap-4" 
            onPress={() => router.push("/(profile)/FAQs")}
          >
            <View className="p-4 bg-blue-50 rounded-lg">
              <Ionicons name="options" size={24} color="black" />
            </View>
            <View className="flex-1 flex-row items-center justify-between py-2">
              <Text className="text-lg font-medium text-gray-600">FAQs</Text>
              <Ionicons name="chevron-forward" size={24} color="gray" />
            </View>
          </TouchableOpacity>

          {/* Emergency */}
          <TouchableOpacity 
            className="flex-row items-center mt-4 gap-4"
            onPress={handleOpenEmergency}
          >
            <View className="p-4 bg-red-100 rounded-lg">
              <Image source={icons.emergency} className="w-8 h-8" />
            </View>
            <View className="flex-1 flex-row items-center justify-between py-2">
              <Text className="text-lg font-medium text-red-600">Emergency</Text>
              <Ionicons name="chevron-forward" size={24} color="gray" />
            </View>
          </TouchableOpacity>

          {/* Logout */}
          <TouchableOpacity 
            className="flex-row items-center mt-4 gap-4" 
            onPress={handleLogout}
          >
            <View className="p-4 bg-blue-50 rounded-lg">
              <MaterialIcons name="logout" size={24} color="red" />
            </View>
            <View className="flex-1 flex-row items-center justify-between py-2">
              <Text className="text-lg font-medium text-gray-600">Log out</Text>
              <Ionicons name="chevron-forward" size={24} color="gray" />
            </View>
          </TouchableOpacity>

          {/* Support Message */}
          <View className="p-6 bg-[#FEEDCF] rounded-lg my-8 items-center gap-4">
            <Text className="text-lg font-medium text-[#FCAC29]">
              Feel Free to Ask, We are ready to Help
            </Text>
          </View>

          <View className="border-t border-gray-300 py-4">
            <Text className="text-center text-gray-500">Version 1.0.0</Text>
          </View>
        </ScrollView>
      )}

      {/* Bottom Sheet for Emergency Services */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        onClose={handleCloseEmergency}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: "#FCAC29", width: 50 }}
        backgroundStyle={{ backgroundColor: "white" }}
        style={{ 
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -3,
          },
          shadowOpacity: 0.27,
          shadowRadius: 4.65,
          elevation: 6,
        }}
      >
        <BottomSheetView style={{ flex: 1, padding: 16 }}>
          {/* Header */}
          <View className="flex-row justify-between items-center pb-4 border-b border-gray-200">
            <Text className="text-2xl font-bold text-red-600">Emergency Services</Text>
            <TouchableOpacity onPress={handleCloseEmergency}>
              <Ionicons name="close-circle" size={28} color="gray" />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <TextInput
            className="bg-gray-100 p-3 rounded-xl mt-4 mb-2"
            placeholder="Search ambulance services..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          
          {/* District Filters */}
          <View className="mt-2 mb-4">
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ alignItems: 'center' }}>
              {districts.map((district) => (
                <TouchableOpacity 
                  key={district}
                  style={{
                    marginRight: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 24,
                    backgroundColor: selectedDistrict === district ? '#EF4444' : '#E5E7EB',
                    height: 45,
                    justifyContent: 'center'
                  }}
                  onPress={() => setSelectedDistrict(district)}
                >
                  <Text 
                    style={{
                      color: selectedDistrict === district ? 'white' : '#4B5563',
                      fontWeight: '500'
                    }}
                  >
                    {district}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Ambulance List */}
          <FlatList
            data={filteredAmbulanceServices}
            renderItem={renderAmbulanceItem}
            keyExtractor={(item, index) => `${item.name}-${index}`}
            showsVerticalScrollIndicator={false}
            className="mt-2"
            contentContainerStyle={{ paddingBottom: 40 }}
            ListEmptyComponent={
              <View className="items-center justify-center p-10">
                <MaterialIcons name="search-off" size={50} color="lightgray" />
                <Text className="text-gray-400 mt-2 text-center">No ambulance services found</Text>
              </View>
            }
          />
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
};

export default Profile;
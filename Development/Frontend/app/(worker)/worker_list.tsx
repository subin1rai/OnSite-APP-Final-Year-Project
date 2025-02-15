import { images } from '@/constants';
import apiHandler from '@/context/ApiHandler';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, FlatList, Image, RefreshControl, SafeAreaView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Define Worker Type
interface Worker {
    id: number;
    name: string;
    contact: string;
    profile?: string;
    designation?: string;
    salary: number;
}

const WorkerList = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [searchText, setSearchText] = useState<string>(""); // ✅ Search text state
    const [filteredWorkers, setFilteredWorkers] = useState<Worker[]>([]); // ✅ Filtered workers list

    // Fetch Worker Data
    const fetchWorkers = async () => {
        try {
            const response = await apiHandler.get('/worker');
            setWorkers(response.data.workers); // ✅ Extracting correct workers array
            setFilteredWorkers(response.data.workers); // ✅ Initialize filtered list
        } catch (error) {
            setError("Failed to load workers");
        } finally {
            setLoading(false);
        }
    };

    // Fetch data when the component mounts
    useEffect(() => {
        fetchWorkers();
    }, []);

    // Set StatusBar Color to Yellow
    useEffect(() => {
        StatusBar.setBackgroundColor("#ffb133");
        StatusBar.setBarStyle("light-content");
    }, []);

    // Pull-to-Refresh Handler
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchWorkers(); // Re-fetch workers
        setRefreshing(false);
    }, []);

    // Search Handler
    useEffect(() => {
        if (searchText.trim() === "") {
            setFilteredWorkers(workers); // Reset list if search is empty
        } else {
            const filtered = workers.filter(worker =>
                worker.name.toLowerCase().includes(searchText.toLowerCase())
            );
            setFilteredWorkers(filtered);
        }
    }, [searchText, workers]);

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <SafeAreaView className="bg-[#ffb133]">
                <View className="bg-[#ffb133] flex-row justify-between items-center px-4 pb-[10px] ">
                    <Ionicons name="arrow-back" size={24} color="white" />
                    <Text className="text-white text-2xl font-medium tracking-widest">Workers</Text>
                    <TouchableOpacity>
                        <Ionicons name="add" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* Body */}
            <View className="flex-1 bg-white">

                {/* Search Bar */}
                <View className="mx-4 my-3 bg-gray-200 rounded-full flex-row items-center px-4 py-2">
                    <Ionicons name="search" size={22} color="#333" />

                    <TextInput
                        className="flex-1 px-3 h-10 text-xl text-gray-900"
                        placeholder="Search workers..."
                        value={searchText}
                        onChangeText={setSearchText}
                        placeholderTextColor="#888"
                    />

                    {searchText.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchText("")}>
                            <Ionicons name="close-circle" size={22} color="#999" />
                        </TouchableOpacity>
                    )}
                </View>


                {/* Loading Indicator */}
                {loading && <ActivityIndicator size="large" color="#ffb133" className="mt-6" />}
                {error && <Text className="text-red-500 text-center mt-6">{error}</Text>}

                {/* Worker List with Pull-to-Refresh */}
                {!loading && !error && (
                    <FlatList
                        data={filteredWorkers} // ✅ Uses filtered data
                        keyExtractor={(item) => item.id.toString()}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor="#FCA311"
                                colors={["#FCA311"]}
                            />
                        }
                        renderItem={({ item }) => (
                            <View className="py-3 px-4 flex-row justify-between items-center mx-4 mt-3 bg-white rounded-md shadow-sm ">
                                <View className="flex-row gap-4 items-center">
                                    <Image
                                        source={{ uri: item.profile || images.imageProfile }}
                                        className="h-12 w-12 rounded-full"
                                    />
                                    <View>
                                        <Text className="text-[12px] text-gray-500">{item.designation || "Worker"}</Text>
                                        <Text className="text-xl font-medium">{item.name}</Text>
                                        <Text className="text-sm text-gray-500">{item.contact}</Text>
                                    </View>
                                </View>
                                <Text className="text-xl text-red-500">रु {item.salary}</Text>
                            </View>
                        )}
                        ItemSeparatorComponent={() => <View className="border-b border-gray-300 mx-4" />}
                    />
                )}
            </View>
        </View>
    );
};

export default WorkerList;

import React, { useState, useEffect } from 'react';
import { Text, View, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import apiHandler from '../../context/ApiHandler';
import { useProjectStore } from '@/store/projectStore';

interface all_filesProps {
  workerId: string;
}

const all_files: React.FC<all_filesProps> = ({workerId }) => {
  const [documents, setDocuments] = useState([]);
    const { selectedProject } = useProjectStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const projectId = selectedProject?.id;

  // Fetch documents from the API
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await apiHandler.post("/allDocument", 
        { projectId},
        { 
          headers: { "Content-Type": "application/json" } 
        }
      );
      
      if (response.data.success) {
        setDocuments(response.data.data);
      } else {
       console.log("error")
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      setError(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchDocuments();
    }
  }, [projectId]);

  const getIconSource = (type:any) => {
    switch (type) {
      case 'pdf':
        return require('../../assets/icons/pdf-icon.png');
      default:
        return require('../../assets/icons/file-icon.png');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      className="flex-row items-center p-4 border-b border-gray-200"
      onPress={() => console.log(`Opening document: ${item.id}`)}
    >
      <View className="flex-row items-center flex-1">
        <Image 
          source={getIconSource(item.files && item.files.length > 0 ? item.files[0].fileType : null)} 
          className="w-10 h-10 mr-3"
        />
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-800">{item.title || "Untitled Document"}</Text>
          <Text className="text-sm text-gray-500">{formatDate(item.createdAt)}</Text>
          {item.files && item.files.length > 0 && (
            <Text className="text-xs text-gray-400">{item.files.length} file(s)</Text>
          )}
        </View>
      </View>
      
      <TouchableOpacity 
        className="p-2"
        onPress={() => console.log(`Menu opened for document: ${item.id}`)}
      >
        <Text className="text-xl">⋮</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">      
      {/* Search Bar */}
      <View className="bg-gray-100 mx-4 my-3 p-3 rounded-lg flex-row items-center">
        <Text className="text-gray-400 mr-2">🔍</Text>
        <Text className="text-gray-400">Search documents...</Text>
      </View>
      
      {/* Document List */}
      <FlatList
        data={documents}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        className="flex-1"
        onRefresh={fetchDocuments}
        refreshing={loading}
        ListEmptyComponent={
          <View className="items-center justify-center p-10">
            <Text className="text-gray-500">No documents found for this project</Text>
          </View>
        }
      />
    </View>
  );
};

export default all_files;
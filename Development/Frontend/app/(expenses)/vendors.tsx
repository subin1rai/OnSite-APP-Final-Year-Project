import { images } from '@/constants';
import React from 'react'
import { Image, ScrollView, Text, View } from 'react-native'

const Vendors = () => {
  return (
    <ScrollView>
    {/* <View className="bg-white px-4 py-2 "> */}
    <View className="flex flex-row bg-white justify-between items-center px-4 mx-4 rounded-md mt-2 py-2">
      <View className="gap-4 py-3 flex-row items-center">
        <View>
          <Image source={images.imageProfile}/>
        </View>
        <View className="">
          <View>
          <Text className="font-semibold text-2xl">AK Breakes</Text>
          </View>
          <View>
          <Text className="font-normal text-md text-[#3C3C43]">9810439543</Text>
          </View>
        </View>
       
      </View>
      <View className="">
        <Text className="text-[16px] font-medium text-[#FF3B30]">NRP. 50000</Text>
      </View>
    </View>
    </ScrollView>
  )
}

export default Vendors;

import { Ionicons } from '@expo/vector-icons';
import React from 'react'
import { TouchableOpacity } from 'react-native';
import { Text, View } from 'react-native'

const UpdateWorkerSheet = () => {
  return (
    <View className='px-4'>
      <View className='my-3 flex-row justify-between items-center'>
        <Text className='text-xl font-medium'>Salary Amount</Text>
        <Text className='text-xl font-medium'>NRP. 1000</Text>
      </View>
      <View className="border-b border-gray-300  " />
      <Text className='mt-2 text-2xl font-semibold tracking-widest'>Shift</Text>

      <View className='flex-row justify-between py-4 items-center'>
        <TouchableOpacity className=''>
            <Text className='border border-gray-400 py-2 px-6 text-gray-500 tracking-widest text-lg font-medium rounded-[6px]'>0.5 Shift</Text>
        </TouchableOpacity>
        <TouchableOpacity className=''>
            <Text className='py-3 px-6 text-lg font-medium text-white bg-[#FCA311]  tracking-widest rounded-[6px]'>1.0 Shift</Text>
        </TouchableOpacity>
        <TouchableOpacity className=''>
            <Text className='border border-gray-500 py-2 px-6 text-gray-500  text-lg font-medium  tracking-widest rounded-[6px]'>1.5 Shift</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center justify-between pt-8 gap-3">
      <TouchableOpacity className="flex-1 bg-[#FCA311] py-4 rounded-lg items-center">
        <Text className="text-white font-semibold text-lg">Save</Text>
      </TouchableOpacity>
      {/* <View className="w-4" /> */}
      <TouchableOpacity className="p-3 border border-red-500 rounded-lg items-center justify-center">
        <Ionicons name="trash" size={24} color="red" />
      </TouchableOpacity>
    </View>

    </View>
  )
}

export default UpdateWorkerSheet;

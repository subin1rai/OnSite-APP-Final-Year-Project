import React, { useEffect, useRef, useState } from 'react';
import { View, Button, TextInput, Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

const Notification = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
    const notificationIndentifier = useRef(null);
  const scheduleMyNotification = async (seconds = 10) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title || 'Scheduled Title',
        body: message || 'Scheduled message will appear after delay',
      },
      trigger: {
        type: 'timeInterval',
        seconds,
        repeats: false,
      },
    });
  };

  return (
    <View className="flex-1 justify-center items-center px-4 bg-white">
      <TextInput
        placeholder="Title..."
        value={title}
        onChangeText={setTitle}
        className="w-full border border-gray-400 rounded-lg p-4 mb-4 text-base"
      />
      <TextInput
        placeholder="Message..."
        value={message}
        onChangeText={setMessage}
        className="w-full border border-gray-400 rounded-lg p-4 text-base"
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
      <Button title="Schedule Notification (10s)" onPress={() => scheduleMyNotification(10)} />
    </View>
  );
};

export default Notification;

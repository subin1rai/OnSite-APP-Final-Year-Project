import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useThreeDModelStore } from '@/store/threeDmodelStore';
import { SafeAreaView } from 'react-native';

const ViewModel = () => {
  const { selectedModel } = useThreeDModelStore();

  if (!selectedModel) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>No model selected</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
    <WebView
  originWhitelist={['*']}
  source={{
    html: `
      <html>
        <body style="margin:0; padding:0; text-align:center;">
          <h2>Viewing: Hello</h2>
          <iframe 
            src="${selectedModel.modelUrl}" 
            width="100%" 
            height="90%" 
            style="border:none;">
          </iframe>
        </body>
      </html>
    `
  }}
  style={styles.webview}
/>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});

export default ViewModel;

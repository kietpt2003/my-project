/* eslint-disable @typescript-eslint/no-unused-vars */
import { StyleSheet } from 'react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Routes } from 'tabs/routes';
import {
  CameraPage,
  PermissionsPagecamera,
  CodeScannerPage,
  MediaPage,
  CameraPageV2,
  CameraPageV3,
  SuccessPage,
} from './custom-camera/index';
import { Camera } from 'react-native-vision-camera';

const Stack = createNativeStackNavigator<Routes>();

export default function AppNavigator() {
  const cameraPermission = Camera.getCameraPermissionStatus();
  const microphonePermission = Camera.getMicrophonePermissionStatus();

  const showPermissionsPage =
    cameraPermission !== 'granted' || microphonePermission === 'not-determined';

  return (
    <NavigationContainer>
      <GestureHandlerRootView style={styles.root}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            statusBarStyle: 'dark',
            animationTypeForReplace: 'push',
          }}
          initialRouteName={
            showPermissionsPage ? 'PermissionsPage' : 'CameraPage'
          }>
          <Stack.Screen
            name="PermissionsPage"
            component={PermissionsPagecamera}
          />
          <Stack.Screen name="CameraPage" component={CameraPageV2} />
          <Stack.Screen name="CodeScannerPage" component={CodeScannerPage} />
          <Stack.Screen name="MediaPage" component={MediaPage} />
          <Stack.Screen name="SuccessPage" component={SuccessPage} />
        </Stack.Navigator>
      </GestureHandlerRootView>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

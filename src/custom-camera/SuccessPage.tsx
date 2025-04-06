import { View, Text, StyleSheet, Button } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import Layout from 'layout';
import { Colors } from 'constant';
import { width } from 'utils';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Routes } from 'tabs/routes';

export default function SuccessPage() {
  const navigation = useNavigation<NativeStackNavigationProp<Routes>>();
  return (
    <Layout colors={Colors.background}>
      <View style={styles.container}>
        <Text style={styles.text}>SuccessPage</Text>
        <Button
          color={Colors.background}
          onPress={() => navigation.replace('CameraPage')}
          title={`Set another faceID`}
        />
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    width: width,
    textAlign: 'center',
    fontSize: 30,
    color: Colors.background,
  },
});

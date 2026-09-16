import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BrowserScreen } from './src/screens/BrowserScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <BrowserScreen />
    </SafeAreaProvider>
  );
}


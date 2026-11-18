import { Stack } from 'expo-router';
import { View, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  const isWeb = Platform.OS === 'web';
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={{ flex: 1, backgroundColor: '#020617', alignItems: 'center' }}>
        <View style={{ flex: 1, width: '100%', maxWidth: isWeb ? 520 : undefined, backgroundColor: '#0f172a' }}>
          <Stack screenOptions={{ headerShown: false }} />
        </View>
      </View>
    </SafeAreaProvider>
  );
}

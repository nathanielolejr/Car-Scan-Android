import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { isSupabaseConfigured } from './src/lib/supabase';
import LoginScreen from './src/screens/LoginScreen';
import ScannerScreen from './src/screens/ScannerScreen';
import SetupScreen from './src/screens/SetupScreen';
import { colors } from './src/theme';

function Root() {
  const { session, loading } = useAuth();

  if (!isSupabaseConfigured) return <SetupScreen />;

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return session ? <ScannerScreen /> : <LoginScreen />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <Root />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

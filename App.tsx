import {
  Fraunces_400Regular,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
} from '@expo-google-fonts/fraunces';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from './src/components/Toast';
import { colors as fallbackColors } from './src/constants/theme';
import './src/i18n';
import { loadSavedLanguage } from './src/i18n';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AuthProvider } from './src/store/AuthContext';
import { CartProvider } from './src/store/CartContext';
import { ThemeProvider, useAppTheme } from './src/store/ThemeContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60_000,
      gcTime: 45 * 60_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
    },
  },
});

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_400Regular,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
  });

  useEffect(() => {
    void loadSavedLanguage();
  }, []);

  // Don't hang forever on a black screen if fonts fail or stall
  if (!fontsLoaded && !fontError) {
    return <View style={{ flex: 1, backgroundColor: fallbackColors.black }} />;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <ToastProvider>
                <ThemedStatusBar />
                <RootNavigator />
              </ToastProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

function ThemedStatusBar() {
  const { mode } = useAppTheme();
  return <StatusBar style={mode === 'light' ? 'dark' : 'light'} />;
}

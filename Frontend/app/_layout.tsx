import { Stack, useRouter, SplashScreen } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getToken } from '../lib/tokenManager';
import { View } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const [appIsReady, setAppIsReady] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    async function prepareApp() {
      try {
        const token = await getToken();
        setIsAuthenticated(!!token);

        const completed = await AsyncStorage.getItem('hasCompletedOnboarding');
        setOnboardingCompleted(completed === 'true');
      } catch (e) {
        console.error('Failed to prepare app initial state:', e);
        setIsAuthenticated(false);
        setOnboardingCompleted(false);
      } finally {
        setAppIsReady(true);
      }
    }

    prepareApp();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();

      if (isAuthenticated === false) {
        router.replace('/signup');
      } else if (isAuthenticated === true) {
        if (onboardingCompleted === false) {
          router.replace('/onboarding');
        } else if (onboardingCompleted === true) {
          router.replace('/(tabs)');
        }
      }
    }
  }, [appIsReady, isAuthenticated, onboardingCompleted]);

  if (!appIsReady) return null;

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <PaperProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="onboardingquestions" />
          <Stack.Screen name="onboarding" />
          {/* NO need to include (tabs) here */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </PaperProvider>
    </View>
  );
}

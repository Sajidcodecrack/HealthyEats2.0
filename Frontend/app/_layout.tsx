import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Layout() {
  const router = useRouter();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);

  // Check if onboarding has been completed using AsyncStorage
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const value = await AsyncStorage.getItem('hasCompletedOnboarding');
        if (value !== null) {
          setHasCompletedOnboarding(value === 'true');
        } else {
          setHasCompletedOnboarding(false); // Default to false if not set
        }
      } catch (error) {
        console.error('Error reading onboarding status:', error);
        setHasCompletedOnboarding(false); // Fallback to false on error
      }
    };

    checkOnboardingStatus();
  }, []);

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (hasCompletedOnboarding === null) return; // Wait until the check is complete
    if (!hasCompletedOnboarding) {
      router.replace('/onboarding');
    } else {
      router.replace('/signup'); // Or redirect to another route like '/home'
    }
  }, [hasCompletedOnboarding, router]);

  return (
    <PaperProvider >
      <Stack>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        {/* Add other routes as needed */}
        <Stack.Screen name="home" options={{ headerShown: true, title: 'Home' }} />
      </Stack>
    </PaperProvider>
  );
}

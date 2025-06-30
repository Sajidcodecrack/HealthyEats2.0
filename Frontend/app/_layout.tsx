import { Stack, useRouter, SplashScreen } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import { PaperProvider } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getToken } from "../lib/tokenManager";
import { View } from "react-native";
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const [appIsReady, setAppIsReady] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState<
    boolean | null
  >(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    async function prepareApp() {
      try {
        const token = await getToken();
        setIsAuthenticated(!!token);

        const completed = await AsyncStorage.getItem("hasCompletedOnboarding");
        setOnboardingCompleted(completed === "true");
      } catch (e) {
        console.error("Failed to prepare app initial state:", e);
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
        router.replace("/login");
      } else if (isAuthenticated === true) {
        if (onboardingCompleted === false) {
          router.replace("/onboarding");
        } else if (onboardingCompleted === true) {
          router.replace("/home");
        }
      }
    }
  }, [appIsReady, isAuthenticated, onboardingCompleted]);

  if (!appIsReady) return null;

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <PaperProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            gestureEnabled: true, // default for all unless overridden
          }}
        >
          <Stack.Screen
            name="login"
            options={{
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="signup"
            options={{
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="onboardingquestions"
            options={{
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="onboarding"
            options={{
              gestureEnabled: false,
            }}
          />
          <Stack.Screen name="foodpref" />
          <Stack.Screen name="mealplan" />
          <Stack.Screen name="aichat" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="fitnessplan" />
          <Stack.Screen name="forgotpassword" />
          <Stack.Screen name="otp" />
          <Stack.Screen name="changepassword" />
          <Stack.Screen name="trackfood"  />
          <Stack.Screen name="AddFoodToMeal" />
          <Stack.Screen name="SleepTrackingScreen" />
          <Stack.Screen name="WaterIntakeScreen" />
          <Stack.Screen name="privacy-policy" />
          <Stack.Screen name="home" options={{ headerShown: false,gestureEnabled: false }} />
        </Stack>
      </PaperProvider>
    </View>
  );
}

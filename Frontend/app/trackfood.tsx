import { Scan, ArrowLeft, RefreshCw } from "lucide-react-native";
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Appearance,
  Alert,
  Platform,
  StyleSheet,
  ActivityIndicator,
  AppState,
} from "react-native";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { getToken } from "~/lib/tokenManager";

export default function TrackFood() {
  const colorScheme = Appearance.getColorScheme();
  const isDark = colorScheme === "dark";
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [totalCalories, setTotalCalories] = useState(0);
  const [breakfastCalories, setBreakfastCalories] = useState(0);
  const [snackCalories, setSnackCalories] = useState(0);
  const [lunchCalories, setLunchCalories] = useState(0);
  const [dinnerCalories, setDinnerCalories] = useState(0);

  const [isUploading, setIsUploading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  const navigation = useNavigation();
  const route = useRoute();
  
  // Refs for cleanup
  const refreshIntervalRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);

  const API_URL = Constants.expoConfig?.extra?.apiUrl;
  const breakfastGoal = Math.round(calorieGoal * 0.25);
  const snackGoal = Math.round(calorieGoal * 0.125);
  const lunchGoal = Math.round(calorieGoal * 0.3);
  const dinnerGoal = Math.round(calorieGoal * 0.325);

  // Real-time refresh interval (30 seconds)
  const REFRESH_INTERVAL = 30000;

  // Theme colors
  const themeColors = useMemo(
    () => ({
      background: isDark ? "#0f172a" : "#f5f3ff",
      headerGradient: isDark ? ["#065f46", "#059669"] : ["#059669", "#34d399"],
      cardBg: isDark ? "#1e293b" : "#fff",
      textPrimary: isDark ? "#e2e8f0" : "#065f46",
      textSecondary: isDark ? "#94a3b8" : "#6b7280",
      progressFill: isDark ? "#34d399" : "#10b981",
      progressBarBg: isDark ? "#334155" : "#d1fae5",
      buttonBg: isDark ? "#059669" : "#059669",
      buttonText: "#fff",
      icon: isDark ? "#34d399" : "#059669",
      sectionTitle: isDark ? "#e5e7eb" : "#065f46",
      resetButton: isDark ? "#f87171" : "#ef4444",
      refreshButton: isDark ? "#34d399" : "#059669",
    }),
    [isDark]
  );

  // Fetch user data function - memoized to prevent unnecessary re-creates
  const fetchUserData = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) {
        setIsRefreshing(true);
      }

      const userId = await AsyncStorage.getItem("userId");
      const token = await getToken();
      
      if (!userId || !token) {
        Alert.alert("Error", "User not authenticated");
        return false;
      }

      // Fetch BMI and suggested calories
      const bmiResponse = await fetch(
        `${API_URL}/api/user-profile/${userId}/bmi`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!bmiResponse.ok) {
        const errorText = await bmiResponse.text();
        console.error("BMI fetch error:", bmiResponse.status, errorText);
        throw new Error("Failed to fetch BMI data");
      }

      const bmiData = await bmiResponse.json();

      // Set calorie goal from BMI or use default
      if (bmiData.suggestedCalories) {
        setCalorieGoal(bmiData.suggestedCalories);
      }

      // Fetch today's calorie log
      const logResponse = await fetch(`${API_URL}/api/calorie/today`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!logResponse.ok) {
        const errorText = await logResponse.text();
        console.error("Calorie log fetch error:", logResponse.status, errorText);
        throw new Error("Failed to fetch calorie log");
      }

      const logData = await logResponse.json();
      updateCaloriesFromLog(logData);
      setLastUpdated(new Date());
      
      return true;
    } catch (error) {
      console.error("Error fetching user data:", error);
      if (showLoader) {
        Alert.alert("Error", error.message || "Failed to refresh data");
      }
      return false;
    } finally {
      if (showLoader) {
        setIsRefreshing(false);
      }
    }
  }, [API_URL]);

  // Initial data fetch on mount
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      await fetchUserData();
      setIsLoading(false);
    };

    loadInitialData();
  }, [fetchUserData]);

  // Set up real-time refresh interval
  useEffect(() => {
    // Clear any existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    // Set up new interval for background refresh
    refreshIntervalRef.current = setInterval(() => {
      // Only refresh if app is active and component is mounted
      if (appStateRef.current === 'active') {
        fetchUserData(false); // Silent refresh
      }
    }, REFRESH_INTERVAL);

    // Cleanup interval on unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [fetchUserData]);

  // Handle app state changes for optimized refreshing
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to foreground, refresh data
        fetchUserData(false);
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [fetchUserData]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Refresh data when screen is focused
      fetchUserData(false);
    }, [fetchUserData])
  );

  // Update calories when returning from AddFoodToMeal
  useEffect(() => {
    const { meal, calories } = route.params || {};
    if (meal && calories) {
      handleCalorieLog(meal, calories);
      navigation.setParams({ meal: undefined, calories: undefined });
    }
  }, [route.params]);

  // Update calorie state from log data
  const updateCaloriesFromLog = (logData) => {
    console.log("Log data received:", JSON.stringify(logData, null, 2));
    if (!logData || !logData.meals) {
      console.warn("No meals data in log response");
      return;
    }

    let total = 0;
    let breakfast = 0;
    let snack = 0;
    let lunch = 0;
    let dinner = 0;

    logData.meals.forEach((meal) => {
      const calories = meal.calories || 0;
      total += calories;

      switch (meal.mealType) {
        case "breakfast":
          breakfast += calories;
          break;
        case "snack":
          snack += calories;
          break;
        case "lunch":
          lunch += calories;
          break;
        case "dinner":
          dinner += calories;
          break;
        default:
          console.warn(`Unknown mealType: ${meal.mealType}`);
      }
    });

    setTotalCalories(total);
    setBreakfastCalories(breakfast);
    setSnackCalories(snack);
    setLunchCalories(lunch);
    setDinnerCalories(dinner);

    if (logData.calorieGoal) {
      setCalorieGoal(logData.calorieGoal);
    }
  };

  // Manual refresh function
  const handleManualRefresh = () => {
    fetchUserData(true);
  };

  // Log calories to API
  const handleCalorieLog = async (mealType, calories) => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      const token = await getToken();
      if (!userId || !token) {
        Alert.alert("Error", "User not authenticated");
        return;
      }

      const response = await fetch(`${API_URL}/api/calorie/log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, mealType, calories }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error response:", errorText);
        throw new Error(`Failed to log calories: ${errorText}`);
      }

      const data = await response.json();
      updateCaloriesFromLog(data);
      setLastUpdated(new Date());
      Alert.alert("Success", "Calories logged successfully!");
    } catch (error) {
      console.error("Error logging calories:", error);
      Alert.alert("Error", error.message || "Failed to log calories");
    }
  };

  // Set calorie goal
  const setUserCalorieGoal = async (goal) => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      const token = await getToken();
      if (!userId || !token) {
        Alert.alert("Error", "User not authenticated");
        return;
      }
      const response = await fetch(`${API_URL}/api/calorie/goal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, calorieGoal: goal }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error response:", errorText);
        throw new Error(`Failed to set calorie goal: ${errorText}`);
      }

      setCalorieGoal(goal);
      setLastUpdated(new Date());
      Alert.alert("Success", "Calorie goal updated!");
    } catch (error) {
      console.error("Error setting calorie goal:", error);
      Alert.alert("Error", error.message || "Failed to set calorie goal");
    }
  };

  // Show native options dialog
  function showPhotoOptions() {
    const buttons = [
      { text: "Take Photo", onPress: () => launchPicker("camera") },
      { text: "Upload from Gallery", onPress: () => launchPicker("library") },
      { text: "Cancel", style: "cancel" },
    ];
    if (Platform.OS === "ios") {
      Alert.alert("", "", buttons);
    } else {
      Alert.alert("Select Option", undefined, buttons);
    }
  }

  // Launch camera or library
  async function launchPicker(mode) {
    try {
      const options = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.1,
      };
      const result =
        mode === "camera"
          ? await ImagePicker.launchCameraAsync(options)
          : await ImagePicker.launchImageLibraryAsync(options);

      if (!result.canceled && result.assets?.length) {
        processImage(result.assets[0]);
      }
    } catch (err) {
      console.error("ImagePicker error:", err);
    }
  }

  // Send to backend and navigate
  async function processImage(image) {
    setIsUploading(true);
    if (!API_URL) {
      console.error("API_URL not defined");
      Alert.alert("Error", "API URL is not configured");
      return;
    }

    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        Alert.alert("Error", "User not authenticated");
        return;
      }

      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("image", {
        uri: image.uri,
        name: "photo.jpg",
        type: "image/jpeg",
      });

      const resp = await fetch(`${API_URL}/api/image-analysis/upload`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!resp.ok) {
        const errorText = await resp.text();
        console.error("Server error response:", errorText);
        throw new Error(`Server error: ${resp.status} ${resp.statusText}`);
      }

      const data = await resp.json();

      let analysisResult;
      if (data.data?.analysisResult) {
        analysisResult = data.data.analysisResult;
      } else if (data.analysisResult) {
        analysisResult = data.analysisResult;
      } else if (data.data) {
        analysisResult = data.data;
      } else {
        analysisResult = data;
      }

      if (!analysisResult) {
        console.error("Analysis result not found in response");
        throw new Error("Could not find food analysis data in server response");
      }

      let calories = 0;
      let caloriesString = "";

      if (analysisResult.calories_per_100g) {
        caloriesString = analysisResult.calories_per_100g;
      } else if (analysisResult.calories) {
        caloriesString = analysisResult.calories;
      } else if (analysisResult.Calories) {
        caloriesString = analysisResult.Calories;
      }

      if (caloriesString && typeof caloriesString === "string") {
        const calorieNumbers = caloriesString
          .replace(/kcal/gi, "")
          .replace(/[^\d-]/g, "")
          .split("-")
          .map((s) => {
            const num = parseInt(s.trim());
            return isNaN(num) ? 0 : num;
          })
          .filter((num) => num > 0);

        if (calorieNumbers.length > 0) {
          calories = Math.round(
            calorieNumbers.reduce((a, b) => a + b, 0) / calorieNumbers.length
          );
        }
      }

      if (calories === 0) {
        calories = 250;
      }

      navigation.navigate("AddFoodToMeal", {
        analysisResult,
        imageUri: image.uri,
        calories,
      });
    } catch (err) {
      console.error("Error uploading image:", err);
      Alert.alert(
        "Upload Error",
        err.message || "Failed to process image. Please try again."
      );
    }
    setIsUploading(false);
  }

  // Progress percentage
  function getPct(current, goal) {
    return Math.min(100, (current / goal) * 100);
  }

  // Reset all calories
  const resetCalories = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      const token = await getToken();
      if (!userId || !token) {
        Alert.alert("Error", "User not authenticated");
        return;
      }

      // Call API to reset calories
      const response = await fetch(`${API_URL}/api/calorie/reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        // Reset local state
        setTotalCalories(0);
        setBreakfastCalories(0);
        setSnackCalories(0);
        setLunchCalories(0);
        setDinnerCalories(0);
        setLastUpdated(new Date());
        Alert.alert("Reset", "Calories have been reset for today");
      } else {
        // Fallback to local reset if API fails
        setTotalCalories(0);
        setBreakfastCalories(0);
        setSnackCalories(0);
        setLunchCalories(0);
        setDinnerCalories(0);
        Alert.alert("Reset", "Calories have been reset locally");
      }
    } catch (error) {
      console.error("Error resetting calories:", error);
      // Fallback to local reset
      setTotalCalories(0);
      setBreakfastCalories(0);
      setSnackCalories(0);
      setLunchCalories(0);
      setDinnerCalories(0);
      Alert.alert("Reset", "Calories have been reset locally");
    }
  };

  // Manual calorie input
  const showManualInput = (mealType) => {
    Alert.prompt(
      `Add Calories for ${
        mealType.charAt(0).toUpperCase() + mealType.slice(1)
      }`,
      "Enter calorie amount:",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Add",
          onPress: (calories) => {
            if (calories && !isNaN(parseInt(calories))) {
              handleCalorieLog(mealType, parseInt(calories));
            } else {
              Alert.alert("Invalid Input", "Please enter a valid number");
            }
          },
        },
      ],
      "plain-text",
      "",
      "numeric"
    );
  };

  // Change calorie goal
  const changeCalorieGoal = () => {
    Alert.prompt(
      "Set Calorie Goal",
      "Enter your daily calorie goal:",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Set",
          onPress: (goal) => {
            if (goal && !isNaN(parseInt(goal))) {
              setUserCalorieGoal(parseInt(goal));
            } else {
              Alert.alert("Invalid Input", "Please enter a valid number");
            }
          },
        },
      ],
      "plain-text",
      calorieGoal.toString(),
      "numeric"
    );
  };

  // Format last updated time
  const formatLastUpdated = () => {
    if (!lastUpdated) return "";
    const now = new Date();
    const diff = Math.floor((now - lastUpdated) / 1000);
    
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return lastUpdated.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: themeColors.background },
        ]}
      >
        <ActivityIndicator size="large" color={themeColors.progressFill} />
        <Text style={[styles.loadingText, { color: themeColors.textPrimary }]}>
          Loading your data...
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <LinearGradient
        colors={themeColors.headerGradient}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[
            styles.backButton,
            { backgroundColor: "rgba(255,255,255,0.2)" },
          ]}
        >
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Food Tracker</Text>
          {lastUpdated && (
            <Text style={styles.lastUpdated}>
              Updated {formatLastUpdated()}
            </Text>
          )}
        </View>

        <View style={styles.headerActions}>
          
          
          <TouchableOpacity onPress={resetCalories}>
            <Text style={[styles.resetButton, { color: "#fff" }]}>Reset</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Total Calories Card */}
        <TouchableOpacity 
            onPress={handleManualRefresh}
            style={[
              styles.refreshButton,
              { backgroundColor: "rgba(255,255,255,0.2)" },
              isRefreshing && styles.refreshButtonDisabled
            ]}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <RefreshCw size={32} color="#FFF" />
            )}
          </TouchableOpacity>
        <View
          style={[
            styles.card,
            styles.cardShadow,
            { backgroundColor: themeColors.cardBg },
          ]}
        >
          
          <View style={styles.caloriesHeader}>
            <Text
              style={[styles.cardTitle, { color: themeColors.textPrimary }]}
            >
              Today's Calories
            </Text>
            <TouchableOpacity onPress={changeCalorieGoal}>
              <Text
                style={[styles.goalButton, { color: themeColors.progressFill }]}
              >
                Change Goal
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.caloriesVisualization}>
            <Text
              style={[styles.totalCalories, { color: themeColors.textPrimary }]}
            >
              {totalCalories}
              <Text
                style={[
                  styles.calorieLabel,
                  { color: themeColors.textSecondary },
                ]}
              >
                /{calorieGoal}
              </Text>
            </Text>
            <Text
              style={[
                styles.calorieSubtitle,
                { color: themeColors.textSecondary },
              ]}
            >
              Calories Consumed
            </Text>
          </View>

          <View
            style={[
              styles.progressBar,
              { backgroundColor: themeColors.progressBarBg },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: `${getPct(totalCalories, calorieGoal)}%`,
                  backgroundColor: themeColors.progressFill,
                },
              ]}
            />
          </View>

          <Text
            style={[
              styles.remainingCalories,
              { color: themeColors.textSecondary },
            ]}
          >
            {calorieGoal - totalCalories} calories remaining
          </Text>
        </View>

        {/* Meal Cards */}
        {[
          {
            title: "Breakfast",
            current: breakfastCalories,
            goal: breakfastGoal,
            message: "Start your day with a healthy breakfast",
            meal: "breakfast",
          },
          {
            title: "Morning Snack",
            current: snackCalories,
            goal: snackGoal,
            message: "Get energized with a nutritious snack",
            meal: "snack",
          },
          {
            title: "Lunch",
            current: lunchCalories,
            goal: lunchGoal,
            message: "Refuel with a balanced lunch",
            meal: "lunch",
          },
          {
            title: "Dinner",
            current: dinnerCalories,
            goal: dinnerGoal,
            message: "Finish strong with a wholesome dinner",
            meal: "dinner",
          },
        ].map((mealData, index) => (
          <View key={index} style={styles.mealSection}>
            <Text
              style={[styles.mealTitle, { color: themeColors.textPrimary }]}
            >
              {mealData.title}
            </Text>

            <View
              style={[
                styles.mealCard,
                styles.cardShadow,
                { backgroundColor: themeColors.cardBg },
              ]}
            >
              <Text
                style={[
                  styles.mealCalories,
                  { color: themeColors.textPrimary },
                ]}
              >
                {mealData.current}
                <Text
                  style={[
                    styles.calorieLabel,
                    { color: themeColors.textSecondary },
                  ]}
                >
                  /{mealData.goal} Cal
                </Text>
              </Text>

              <View
                style={[
                  styles.mealProgressBar,
                  { backgroundColor: themeColors.progressBarBg },
                ]}
              >
                <View
                  style={[
                    styles.mealProgressFill,
                    {
                      width: `${getPct(mealData.current, mealData.goal)}%`,
                      backgroundColor: themeColors.progressFill,
                    },
                  ]}
                />
              </View>

              <Text
                style={[
                  styles.mealMessage,
                  { color: themeColors.textSecondary },
                ]}
              >
                {mealData.message}
              </Text>

              <View style={styles.mealButtonContainer}>
                <TouchableOpacity
                  style={[
                    styles.addButton,
                    styles.halfButton,
                    { backgroundColor: themeColors.buttonBg, opacity: 0.8 },
                  ]}
                  onPress={() => showManualInput(mealData.meal)}
                >
                  <Text
                    style={[
                      styles.addButtonText,
                      { color: themeColors.buttonText },
                    ]}
                  >
                    Add
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        {/* Nutrition Tips */}
        <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
          Nutrition Tips
        </Text>
        <View
          style={[
            styles.tipsCard,
            styles.cardShadow,
            { backgroundColor: themeColors.cardBg },
          ]}
        >
          {[
            "Include protein in every meal to stay full longer",
            "Choose whole grains over refined carbohydrates",
            "Eat a variety of colorful fruits and vegetables",
            "Stay hydrated throughout the day",
          ].map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <View
                style={[
                  styles.tipBullet,
                  { backgroundColor: themeColors.textPrimary },
                ]}
              />
              <Text
                style={[styles.tipText, { color: themeColors.textSecondary }]}
              >
                {tip}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* FAB Button */}
      <TouchableOpacity
        style={[
          styles.fab,
          styles.fabShadow,
          { backgroundColor: themeColors.buttonBg },
        ]}
        onPress={showPhotoOptions}
      >
        {isUploading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Scan size={28} color="white" />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
  },
  header: {
    height: 140,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: 60,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  resetButton: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 25,
  },
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  caloriesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  goalButton: {
    fontSize: 16,
    fontWeight: "600",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  caloriesVisualization: {
    alignItems: "center",
    marginBottom: 20,
  },
  totalCalories: {
    fontSize: 42,
    fontWeight: "800",
    marginBottom: 5,
  },
  calorieLabel: {
    fontSize: 22,
    fontWeight: "400",
  },
  calorieSubtitle: {
    fontSize: 16,
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 10,
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
  },
  remainingCalories: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
  },
  mealSection: {
    marginBottom: 20,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    marginLeft: 5,
  },
  mealCard: {
    borderRadius: 24,
    padding: 20,
  },
  mealCalories: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 15,
  },
  mealProgressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 15,
  },
  mealProgressFill: {
    height: "100%",
    borderRadius: 4,
  },
  mealMessage: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 22,
  },
  mealButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  addButton: {
    borderRadius: 12,
    padding: 16,
    width: "100%",
    alignItems: "center",
  },
  addButtonText: {
    fontSize: 17,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 15,
    marginLeft: 5,
  },
  tipsCard: {
    borderRadius: 24,
    padding: 24,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  tipBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  tipText: {
    fontSize: 16,
    flex: 1,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  fabShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  refreshButton: {
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 32,
    marginBottom: 20,
  }
});

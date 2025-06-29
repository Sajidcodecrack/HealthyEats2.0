import { Camera, ArrowLeft } from "lucide-react-native";
import React, { useState, useEffect } from "react";
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
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TrackFood() {
  const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme());
  const [totalCalories, setTotalCalories] = useState(0);
  const [breakfastCalories, setBreakfastCalories] = useState(0);
  const [snackCalories, setSnackCalories] = useState(0);
  const [lunchCalories, setLunchCalories] = useState(0);
  const [dinnerCalories, setDinnerCalories] = useState(0);

  const navigation = useNavigation();
  const route = useRoute();

  const API_URL = Constants.expoConfig?.extra?.apiUrl;
  const calorieGoal = 2000;
  const breakfastGoal = 500;
  const snackGoal = 250;
  const lunchGoal = 500;
  const dinnerGoal = 500;

  // Theme colors updated to match profile screen
  const colors = {
    primary: colorScheme === "dark" ? "#065f46" : "#059669",
    background: colorScheme === "dark" ? "#111827" : "#ecfdf5",
    card: colorScheme === "dark" ? "#1f2937" : "#FFFFFF",
    text: colorScheme === "dark" ? "#FFFFFF" : "#1f2937",
    secondaryText: colorScheme === "dark" ? "#9ca3af" : "#6b7280",
    progressBackground: colorScheme === "dark" ? "#374151" : "#d1fae5",
    progressFill: colorScheme === "dark" ? "#34d399" : "#10b981",
    button: colorScheme === "dark" ? "#34d399" : "#059669",
    buttonText: "#FFFFFF",
    sectionTitle: colorScheme === "dark" ? "#e5e7eb" : "#065f46",
    resetButton: colorScheme === "dark" ? "#f87171" : "#ef4444",
    icon: colorScheme === "dark" ? "#34d399" : "#059669",
  };


  // Request permissions on mount
  useEffect(() => {
    (async () => {
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      const galleryStatus =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!cameraStatus.granted) {
        alert("Camera permission is required to take photos");
      }
      if (!galleryStatus.granted) {
        alert("Gallery permission is required to select photos");
      }
    })();
  }, []);

  // Listen for theme changes
  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setColorScheme(colorScheme);
    });
    return () => sub.remove();
  }, []);

  // Update calories when returning from AddFoodToMeal
  useEffect(() => {
    const { meal, calories } = route.params || {};
    if (meal && calories) {
      addCalories(meal, calories);
      navigation.setParams({ meal: undefined, calories: undefined });
    }
  }, [route.params]);

  const isDarkMode = colorScheme === "dark";

  function addCalories(meal: string, cals: number) {
    switch (meal) {
      case "breakfast":
        setBreakfastCalories((b) => b + cals);
        break;
      case "snack":
        setSnackCalories((s) => s + cals);
        break;
      case "lunch":
        setLunchCalories((l) => l + cals);
        break;
      case "dinner":
        setDinnerCalories((d) => d + cals);
        break;
    }
    setTotalCalories((t) => t + cals);
  }

  

  // Show native options dialog
  function showPhotoOptions() {
    const buttons = [
      { text: "Take Photo", onPress: () => launchPicker("camera") },
      { text: "Upload from Gallery", onPress: () => launchPicker("library") },
      { text: "Cancel", style: "cancel" as const },
    ];
    if (Platform.OS === "ios") {
      Alert.alert("", "", buttons);
    } else {
      Alert.alert("Select Option", undefined, buttons);
    }
  }

  // Launch camera or library
  async function launchPicker(mode: "camera" | "library"): Promise<void> {
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
  async function processImage(image: { uri: string }) {
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
      } as any);

      console.log("Sending image to server:", image.uri);

      const resp = await fetch(`${API_URL}/api/image-analysis/upload`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Handle HTTP errors
      if (!resp.ok) {
        const errorText = await resp.text();
        console.error("Server error response:", errorText);
        throw new Error(`Server error: ${resp.status} ${resp.statusText}`);
      }

      const data = await resp.json();

      

      // Handle different response structures
      let analysisResult;
      if (data.data?.analysisResult) {
        analysisResult = data.data.analysisResult;
      } else if (data.analysisResult) {
        analysisResult = data.analysisResult;
      } else if (data.data) {
        analysisResult = data.data; // Fallback if analysisResult is missing
      } else {
        analysisResult = data; // Final fallback
      }

      if (!analysisResult) {
        console.error("Analysis result not found in response");
        throw new Error("Could not find food analysis data in server response");
      }

      // Extract calories with fallbacks
      let calories = 0;
      let caloriesString = "";

      // Try different possible field names
      if (analysisResult.calories_per_100g) {
        caloriesString = analysisResult.calories_per_100g;
      } else if (analysisResult.calories) {
        caloriesString = analysisResult.calories;
      } else if (analysisResult.Calories) {
        caloriesString = analysisResult.Calories;
      }

      // Parse calories if we found a string
      if (caloriesString && typeof caloriesString === "string") {
        const calorieNumbers = caloriesString
          .replace(/kcal/gi, "") // Remove unit (case insensitive)
          .replace(/[^\d-]/g, "") // Remove non-digit/non-dash characters
          .split("-") // Split range
          .map((s) => {
            const num = parseInt(s.trim());
            return isNaN(num) ? 0 : num;
          })
          .filter((num) => num > 0); // Only keep positive numbers

        if (calorieNumbers.length > 0) {
          calories = Math.round(
            calorieNumbers.reduce((a, b) => a + b, 0) / calorieNumbers.length
          );
          console.log("Parsed calories:", calories);
        }
      }

      // If we couldn't parse calories, use a reasonable default
      if (calories === 0) {
        console.warn("Using fallback calorie value");
        calories = 250; // Reasonable default for food items
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
  }

  // Progress percentage
  function getPct(current: number, goal: number) {
    return Math.min(100, (current / goal) * 100);
  }
 return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      {/* Header with green background */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Today</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Total Calories Card */}
        <View style={[styles.card, styles.cardShadow, { backgroundColor: colors.card }]}>
          <Text style={[styles.totalCalories, { color: colors.text }]}>
            {totalCalories}{" "}
            <Text style={[styles.calorieLabel, { color: colors.secondaryText }]}>
              of {calorieGoal}
            </Text>
          </Text>
          <Text
            style={[styles.calorieSubtitle, { color: colors.secondaryText }]}
          >
            Calories Eaten
          </Text>

          {/* Progress Bar */}
          <View
            style={[
              styles.progressBar,
              { backgroundColor: colors.progressBackground },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: `${getPct(totalCalories, calorieGoal)}%`,
                  backgroundColor: colors.progressFill,
                },
              ]}
            />
          </View>

          <Text
            style={[styles.remainingCalories, { color: colors.secondaryText }]}
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
            message: "All you need is some breakfast 😊",
            meal: "breakfast",
          },
          {
            title: "Morning Snack",
            current: snackCalories,
            goal: snackGoal,
            message: "Get energized with a morning snack 👍",
            meal: "snack",
          },
          {
            title: "Lunch",
            current: lunchCalories,
            goal: lunchGoal,
            message: "Don't miss lunch 🌧 Time to eat!",
            meal: "lunch",
          },
          {
            title: "Dinner",
            current: dinnerCalories,
            goal: dinnerGoal,
            message: "Finish strong with a healthy dinner 🍽️",
            meal: "dinner",
          },
        ].map((mealData, index) => (
          <View key={index} style={styles.mealSection}>
            <Text style={[styles.mealTitle, { color: colors.sectionTitle }]}>
              {mealData.title}
            </Text>

            <View style={[styles.mealCard, styles.cardShadow, { backgroundColor: colors.card }]}>
              <Text style={[styles.mealCalories, { color: colors.text }]}>
                {mealData.current}{" "}
                <Text style={[styles.calorieLabel, { color: colors.secondaryText }]}>
                  of {mealData.goal} Cal
                </Text>
              </Text>

              {/* Meal Progress Bar */}
              <View
                style={[
                  styles.mealProgressBar,
                  { backgroundColor: colors.progressBackground },
                ]}
              >
                <View
                  style={[
                    styles.mealProgressFill,
                    {
                      width: `${getPct(mealData.current, mealData.goal)}%`,
                      backgroundColor: colors.progressFill,
                    },
                  ]}
                />
              </View>

              <Text
                style={[styles.mealMessage, { color: colors.secondaryText }]}
              >
                {mealData.message}
              </Text>

              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.button }]}
                onPress={() => addCalories(mealData.meal, 150)}
              >
                <Text style={styles.addButtonText}>Add Food</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={styles.spacer} />
      </ScrollView>

      {/* FAB Button */}
      <TouchableOpacity
        style={[styles.fab, styles.fabShadow, { backgroundColor: colors.button }]}
        onPress={showPhotoOptions}
      >
        <Camera size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 20,
  },
  header: {
    height: 150,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingTop: 60,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    padding: 10,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.2)",
    position: "absolute",
    left: 20,
    top: 82,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  resetButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  resetButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 25,
  },
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  totalCalories: {
    fontSize: 36,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 5,
  },
  calorieLabel: {
    fontSize: 22,
    fontWeight: "400",
  },
  calorieSubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
  },
  remainingCalories: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 15,
  },
  mealSection: {
    marginBottom: 25,
  },
  mealTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    marginLeft: 5,
  },
  mealCard: {
    borderRadius: 24,
    padding: 20,
  },
  mealCalories: {
    fontSize: 20,
    fontWeight: "700",
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
  addButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  addButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "white",
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
  spacer: {
    height: 20,
  },
});
import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  useColorScheme,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Sparkles } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import ProgressTab from "../components/home/ProgressTab";
import MealPlanTab from "../components/home/MealPlanTab";
import FitnessPlanTab from "../components/home/FitnessPlanTab";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getToken } from "../lib/tokenManager";
import Constants from "expo-constants";
import { Scan, ArrowLeft } from "lucide-react-native";
// Background images for quick actions
const mealPlanImage = require("../assets/images/meal.jpg");
const fitnessPlanImage = require("../assets/images/fitness.jpg");

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("Progress");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const isDarkMode = colorScheme === "dark";
  const API_URL = Constants.expoConfig?.extra?.apiUrl;
  const colors = {
    primary: isDarkMode ? "#059669" : "#059669",
    darkPrimary: isDarkMode ? "#065f46" : "#065f46",
    background: isDarkMode ? "#0f172a" : "#f0fdf4",
    card: isDarkMode ? "#1e293b" : "#ffffff",
    text: isDarkMode ? "#f1f5f9" : "#1f2937",
    secondaryText: isDarkMode ? "#94a3b8" : "#64748b",
    border: isDarkMode ? "#334155" : "#d1fae5",
    inputBackground: isDarkMode ? "#1e293b" : "#f0fdf4",
    aiBubble: isDarkMode ? "#1e293b" : "#f0fdf4",
    userBubble: isDarkMode ? "#065f46" : "#059669",
    disabledButton: isDarkMode ? "#1e3a5f" : "#a7f3d0",
  };

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) return;

        const res = await fetch(`${API_URL}/api/user/${userId}`);
        const data = await res.json();

        setUser({
          name: data.name,
          profileImage: data.profileImage
            ? `${API_URL}${data.profileImage}`
            : null,
        });
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false); // <-- Critical line
      }
    };

    fetchUser();
  }, []);

  // Stats data
  const stats = [
    { value: "2,100", label: "Calories", icon: "fire", unit: "cal" },
    { value: "85", label: "Protein", icon: "dna", unit: "g" },
    { value: "10,234", label: "Steps", icon: "foot-print", unit: "" },
    { value: "7.5", label: "Sleep", icon: "bed", unit: "hr" },
  ];

  // Goals data
  const goals = [
    {
      icon: "silverware-fork-knife",
      label: "Track Food",
      goal: "Eat 2,000 Cal",
      color: "#10B981",
      progress: 65,
    },
    {
      icon: "cup-water",
      label: "Water",
      goal: "Goal: 8 glasses",
      color: "#0EA5E9",
      progress: 50,
    },
    {
      icon: "bed",
      label: "Sleep",
      goal: "Goal: 8hr",
      color: "#6366F1",
      progress: 75,
    },
    {
      icon: "weight-lifter",
      label: "Workout",
      goal: "Goal: 620 cal",
      color: "#3B82F6",
      progress: 40,
    },
    {
      icon: "walk",
      label: "Steps",
      goal: "Set Up Auto-Tracking",
      color: "#8B5CF6",
      progress: 0,
    },
  ];
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
    setIsUploading(true); // Start loading
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
    setIsUploading(false); // Stop loading
  }
  // Function to get user initials for avatar
  const getInitials = (name) => {
    if (!name) return "U";
    const names = name.split(" ");
    return names
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <View
        className={`flex-1 justify-center items-center ${
          isDark ? "bg-gray-900" : "bg-emerald-50"
        }`}
      >
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  return (
    <View
      className={`flex-1 pt-14 ${isDark ? "bg-gray-900" : "bg-emerald-50"}`}
    >
      {/* Background Gradient */}
      <LinearGradient
        colors={isDark ? ["#0c4a6e", "#065f46"] : ["#059669", "#047857"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="absolute top-0 left-0 right-0 h-64 rounded-b-3xl"
      />

      {/* Light Background Gradient */}
      <LinearGradient
        colors={
          isDark
            ? ["rgba(15, 23, 42, 0.7)", "rgba(15, 23, 42, 0.9)"]
            : ["rgba(240, 253, 250, 0.6)", "rgba(236, 253, 245, 0.8)"]
        }
        className="absolute top-0 left-0 right-0 bottom-0"
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row justify-between items-center px-6 pt-2 pb-4">
          <View className="flex-row items-center">
            <TouchableOpacity
              className="border-2 border-emerald-500 rounded-full"
              onPress={() => navigation.navigate("profile")}
            >
              {user?.profileImage ? (
                <Image
                  source={{ uri: user.profileImage }}
                  className="w-14 h-14 rounded-full z-10"
                />
              ) : (
                <View className="w-14 h-14 rounded-full bg-emerald-300 items-center justify-center">
                  <Text className="text-white text-xl font-bold">
                    {getInitials(user?.name)}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <View className="ml-3">
              <Text className="text-foreground text-lg font-semibold">
                Welcome back,
              </Text>
              <Text className="text-foreground text-xl font-bold">
                {user?.name ? user.name.split(" ")[0] : "User"}!
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.fab,
              styles.fabShadow,
              { backgroundColor: colors.buttonBg },
            ]}
            onPress={showPhotoOptions}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <LinearGradient
              colors={[colors.primary, colors.darkPrimary]}
              style={styles.cam}
            >
              <Scan size={28} color="white" />
              </LinearGradient>
            )}
          </TouchableOpacity>
        </View>

        <View
          className="mx-5 my-4 p-5 rounded-3xl bg-white dark:bg-gray-800"
          style={styles.card}
        >
          <View className="flex-row justify-between mb-4">
            <View>
              <Text className="text-gray-500 dark:text-gray-300 text-sm">
                Daily Progress
              </Text>
              <Text
                className={`text-2xl font-bold ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                75%
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-gray-500 dark:text-gray-300 text-sm">
                Weekly Streak
              </Text>
              <Text
                className={`text-2xl font-bold ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                7 days
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between">
            {stats.map((stat, index) => (
              <View key={index} className="items-center">
                <MaterialCommunityIcons
                  name={stat.icon as any}
                  size={24}
                  color="#10B981"
                />
                <Text className="text-lg font-bold mt-1 text-gray-800 dark:text-white">
                  {stat.value}
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tabs */}
        <View
          className="flex-row justify-between bg-white dark:bg-gray-800 mb-5 mx-5 p-2 rounded-full"
          style={styles.card}
        >
          {["Progress", "Meal Plan", "Fitness Plan"].map((tab) => (
            <TouchableOpacity
              key={tab}
              className={`flex-1 items-center py-3 rounded-full ${
                activeTab === tab ? "bg-emerald-500" : ""
              }`}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                className={`font-semibold ${
                  activeTab === tab
                    ? "text-white"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {activeTab === "Progress" && (
          <ProgressTab
            isDark={isDark}
            navigation={navigation}
            goals={goals}
            mealPlanImage={mealPlanImage}
            fitnessPlanImage={fitnessPlanImage}
          />
        )}

        {activeTab === "Meal Plan" && (
          <MealPlanTab isDark={isDark} navigation={navigation} />
        )}

        {activeTab === "Fitness Plan" && (
          <FitnessPlanTab isDark={isDark} navigation={navigation} />
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-8 right-8 w-16 h-16 rounded-full items-center justify-center shadow-xl"
        style={styles.fab}
        onPress={() => navigation.navigate("aichat")}
      >
        <LinearGradient
          colors={[colors.primary, colors.darkPrimary]}
          style={styles.tutorAvatar}
        >
          <Sparkles size={28} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
  tutorAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  card: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  fab: {
    backgroundColor: "#059669",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    zIndex: 10,
  },
  upgradeButton: {
    borderWidth: 1,
    borderRadius: 20,
  },
  cam: {
    width: 56,
    height: 56,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
});

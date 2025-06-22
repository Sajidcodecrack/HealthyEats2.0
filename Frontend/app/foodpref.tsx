import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Switch,
  TouchableOpacity, // Use TouchableOpacity for custom buttons
  Alert,
  ActivityIndicator,
  useColorScheme, // To detect dark/light mode
  StyleSheet, // For potential specific styles not covered by Tailwind
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Constants from "expo-constants";
import { useRouter } from "expo-router";  
// You might want to define types for your preferences
interface FoodPreferences {
  foodTypes: string[];
  allergies: string[];
  medicalConditions: string[];
  diabeticRange: string;
  pregnancyStatus: boolean;
  budget: number;
}

export default function FoodPrefScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState<FoodPreferences | null>(null); // Type the state
  const [userId, setUserId] = useState("");
  const API_URL = Constants.expoConfig?.extra?.apiUrl;

  // Form states - Initialize with empty strings or default values
  const [foodTypes, setFoodTypes] = useState<string>("");
  const [allergies, setAllergies] = useState<string>("");
  const [medicalConditions, setMedicalConditions] = useState<string>("");
  const [diabeticRange, setDiabeticRange] = useState<string>("");
  const [pregnancyStatus, setPregnancyStatus] = useState<boolean>(false);
  const [budget, setBudget] = useState<string>(""); // Keep as string for TextInput

  // Fetch userId and preferences on mount
  useEffect(() => {
  const loadPreferences = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem("userId");
      if (!storedUserId) {
        Alert.alert("Error", "User ID not found. Please login again.");
        return;
      }

      setUserId(storedUserId);

      const res = await axios.get<FoodPreferences>(
        `${API_URL}/api/foodPreferences/${storedUserId}`
      );

      if (res.data) {
        // If preferences already exist, redirect immediately to meal plan
        await AsyncStorage.setItem("foodPrefs", JSON.stringify(res.data));
        router.replace("/mealplan"); // << use replace so user can't go back
        return; // Exit early to prevent rendering form
      }
    } catch (err) {
      console.log("No existing preferences found or fetch error.", err);
      // It's okay to continue to the form
    } finally {
      setLoading(false);
    }
  };

  loadPreferences();
}, []);


  const handleSubmitAndGenerate = async () => {
  if (!foodTypes || !allergies || !medicalConditions || !diabeticRange || !budget) {
    Alert.alert('Missing Information', 'Please fill in all fields.');
    return;
  }

  if (isNaN(parseFloat(budget))) {
    Alert.alert('Invalid Budget', 'Budget must be a number.');
    return;
  }

  const payload = {
    userId,
    foodTypes: foodTypes.split(',').map((item) => item.trim()).filter(Boolean),
    allergies: allergies.split(',').map((item) => item.trim()).filter(Boolean),
    medicalConditions: medicalConditions.split(',').map((item) => item.trim()).filter(Boolean),
    diabeticRange,
    pregnancyStatus,
    budget: parseFloat(budget),
  };

  try {
    await axios.post(`${API_URL}/api/foodPreferences/`, payload);
    await AsyncStorage.setItem("foodPrefs", JSON.stringify(payload));
    Alert.alert("Success", "Preferences saved. Generating meal plan...");
    router.push("/mealplan");
  } catch (err) {
    console.error("Failed to save preferences:", err);
    Alert.alert("Error", "Failed to save preferences.");
  }
};


  const textColor = isDark ? "text-dark-text" : "text-text";
  const inputBg = isDark ? "bg-card" : "bg-white";
  const inputBorder = isDark ? "border-dark-inputBorder" : "border-inputBorder";
  const placeholderColor = isDark ? "#A0A0A0" : "#888888";

  if (loading) {
    return (
      <View
        className={`flex-1 justify-center items-center ${
          isDark ? "bg-background" : "bg-white"
        }`}
      >
        <ActivityIndicator size="large" color={isDark ? "white" : "green"} />
        <Text className={`mt-4 text-lg ${textColor}`}>
          Loading Preferences...
        </Text>
      </View>
    );
  }

  // If prefs exist, show a message and allow editing (instead of just showing text)
  // Or, you could show the form with pre-filled data and a "Update Preferences" button
  // For this example, I'll show the form pre-filled for editing.
  // The 'prefs' state now directly holds the fetched data, so the form is always rendered.

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 40 }} // Add bottom padding for scrollability
      className={`flex-1 px-5 pt-12 ${isDark ? "bg-background" : "bg-white"}`}
    >
      <Text className={`text-2xl font-bold mb-6 ${textColor}`}>
        {prefs ? "Update Your Food Preferences" : "Fill Your Food Preferences"}
      </Text>

      {/* Food Types */}
      <View className="mb-4">
        <Text className={`text-base font-semibold mb-2 ${textColor}`}>
          Food Types
        </Text>
        <TextInput
          value={foodTypes}
          onChangeText={setFoodTypes}
          placeholder="e.g. vegetarian, keto, gluten-free"
          placeholderTextColor={placeholderColor}
          className={`border ${inputBorder} rounded-lg p-3 ${inputBg} ${textColor}`}
        />
        <Text
          className={`text-xs mt-1 ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Separate multiple types with commas.
        </Text>
      </View>

      {/* Allergies */}
      <View className="mb-4">
        <Text className={`text-base font-semibold mb-2 ${textColor}`}>
          Allergies
        </Text>
        <TextInput
          value={allergies}
          onChangeText={setAllergies}
          placeholder="e.g. nuts, dairy, shellfish"
          placeholderTextColor={placeholderColor}
          className={`border ${inputBorder} rounded-lg p-3 ${inputBg} ${textColor}`}
        />
        <Text
          className={`text-xs mt-1 ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Separate multiple allergies with commas.
        </Text>
      </View>

      {/* Medical Conditions */}
      <View className="mb-4">
        <Text className={`text-base font-semibold mb-2 ${textColor}`}>
          Medical Conditions
        </Text>
        <TextInput
          value={medicalConditions}
          onChangeText={setMedicalConditions}
          placeholder="e.g. diabetes, heart disease, high blood pressure"
          placeholderTextColor={placeholderColor}
          className={`border ${inputBorder} rounded-lg p-3 ${inputBg} ${textColor}`}
        />
        <Text
          className={`text-xs mt-1 ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Separate multiple conditions with commas.
        </Text>
      </View>

      {/* Diabetic Range */}
      <View className="mb-4">
        <Text className={`text-base font-semibold mb-2 ${textColor}`}>
          Diabetic Range (if applicable)
        </Text>
        <TextInput
          value={diabeticRange}
          onChangeText={setDiabeticRange}
          placeholder="e.g. 120-140 (mg/dL)"
          placeholderTextColor={placeholderColor}
          className={`border ${inputBorder} rounded-lg p-3 ${inputBg} ${textColor}`}
        />
        <Text
          className={`text-xs mt-1 ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Enter your target blood sugar range.
        </Text>
      </View>

      {/* Pregnancy Status */}
      <View className="flex-row items-center justify-between mb-4 px-2 py-3 border rounded-lg ${inputBorder} ${inputBg}">
        <Text className={`text-base font-semibold ${textColor}`}>
          Are you currently pregnant?
        </Text>
        <Switch
          value={pregnancyStatus}
          onValueChange={setPregnancyStatus}
          trackColor={{
            false: isDark ? "#767577" : "#E0E0E0",
            true: "#4CAF50",
          }} // Green for on
          thumbColor={pregnancyStatus ? "#f4f3f4" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
        />
      </View>

      {/* Budget */}
      <View className="mb-6">
        <Text className={`text-base font-semibold mb-2 ${textColor}`}>
          Budget (BDT per meal)
        </Text>
        <TextInput
          value={budget}
          onChangeText={(text) => setBudget(text.replace(/[^0-9.]/g, ""))} // Allow only numbers and one decimal
          keyboardType="numeric"
          placeholder="e.g. 150, 200"
          placeholderTextColor={placeholderColor}
          className={`border ${inputBorder} rounded-lg p-3 ${inputBg} ${textColor}`}
        />
        <Text
          className={`text-xs mt-1 ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Enter your average budget for a single meal in BDT.
        </Text>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        onPress={handleSubmitAndGenerate}
        className="bg-green-600 py-3 rounded-lg items-center justify-center shadow-md"
      >
        <Text className="text-white text-lg font-bold">Generate Meal Plan</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// You can add a StyleSheet if you have complex, non-utility styles
const styles = StyleSheet.create({
  // Example for a focus border style if needed
  inputFocused: {
    borderColor: "#2196F3", // Secondary blue on focus
    borderWidth: 2,
  },
});

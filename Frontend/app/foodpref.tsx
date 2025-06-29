import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  useColorScheme,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Dimensions,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeIn,
  FadeInDown,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { getToken } from "~/lib/tokenManager";
const { height } = Dimensions.get("window");

interface FoodPreferences {
  foodTypes: string[];
  allergies: string[];
  medicalConditions: string[];
  diabeticRange: string;
  pregnancyStatus: boolean;
  budget: number;
}

interface UserProfile {
  gender: string;
}

// Predefined options for selections
const FOOD_TYPES = [
  "Vegetarian", "Vegan",  "Keto","Chicken","Beef","Mutton", 
  "Gluten-Free", "Dairy-Free", "Paleo", "Low-Carb", "High-Carb","None"
];

const ALLERGY_OPTIONS = [
  "Nuts", "Dairy", "Fishes", "Eggs", 
  "Soy", "Wheat", "Shrimp", "Beef", "None"
];

const MEDICAL_CONDITIONS = [
  "Diabetes", "Heart Disease", "High Blood Pressure", 
  "High Cholesterol", "Obesity", "PCOS", "Thyroid", "Kidney Disease"
];

export default function FoodPrefScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState<FoodPreferences | null>(null);
  const [userId, setUserId] = useState("");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const API_URL = Constants.expoConfig?.extra?.apiUrl;
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Form states with selection arrays
  const [selectedFoodTypes, setSelectedFoodTypes] = useState<string[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [selectedMedicalConditions, setSelectedMedicalConditions] = useState<string[]>([]);
  const [diabeticRange, setDiabeticRange] = useState<string>("");
  const [pregnancyStatus, setPregnancyStatus] = useState<boolean>(false);
  const [budget, setBudget] = useState<string>("");

  // Animation values
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(30);

  const animatedFormStyle = useAnimatedStyle(() => {
    return {
      opacity: formOpacity.value,
      transform: [{ translateY: formTranslateY.value }],
    };
  });

  useEffect(() => {
    // Animate form in when loading completes
    if (!loading) {
      formOpacity.value = withSpring(1, { damping: 10 });
      formTranslateY.value = withSpring(0, { damping: 10 });
    }
  }, [loading]);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        const token = await getToken();
        
        if (!storedUserId || !token) {
          Alert.alert("Error", "User not authenticated. Please login again.");
          return;
        }

        setUserId(storedUserId);

        // Fetch user profile
        const profileRes = await axios.get<UserProfile>(
          `${API_URL}/api/user-profile/${storedUserId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUserProfile(profileRes.data);

        // Check existing food preferences
        const res = await axios.get<FoodPreferences>(
          `${API_URL}/api/foodPreferences/${storedUserId}`
        );

        if (res.data) {
          await AsyncStorage.setItem("foodPrefs", JSON.stringify(res.data));
          return;
        }
      } catch (err) {
        console.log("No existing preferences found or fetch error.", err);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, []);

  // Helper function to check if an item is selected
  const isSelected = (item: string, selectedItems: string[]) => {
    return selectedItems.includes(item);
  };

  // Toggle selection for an item
  const toggleSelection = (
    item: string, 
    selectedItems: string[], 
    setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter(i => i !== item));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleSubmitAndGenerate = async () => {
    if (
      selectedFoodTypes.length === 0 ||
      selectedAllergies.length === 0 ||
      selectedMedicalConditions.length === 0 ||
      !budget
    ) {
      Alert.alert("Missing Information", "Please fill in all required fields.");
      return;
    }

    if (isNaN(parseFloat(budget))) {
      Alert.alert("Invalid Budget", "Budget must be a number.");
      return;
    }

    const payload = {
      userId,
      foodTypes: selectedFoodTypes,
      allergies: selectedAllergies,
      medicalConditions: selectedMedicalConditions,
      diabeticRange,
      pregnancyStatus: userProfile?.gender.toLowerCase() === "female" ? pregnancyStatus : false,
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

  // Colors for light/dark mode
  const bgColor = isDark ? "#0f172a" : "#f0fdf4";
  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const textColor = isDark ? "#f1f5f9" : "#1f2937";
  const secondaryText = isDark ? "#94a3b8" : "#64748b";
  const borderColor = isDark ? "#334155" : "#d1fae5";
  const placeholderColor = isDark ? "#94a3b8" : "#9ca3af";
  const selectedColor = isDark ? "#059669" : "#065f46";
  const unselectedColor = isDark ? "#334155" : "#e2e8f0";

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: bgColor }]}>
        <ActivityIndicator
          size="large"
          color={isDark ? "#4ade80" : "#059669"}
        />
        <Text style={[styles.loadingText, { color: textColor }]}>
          Loading Preferences...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: bgColor }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <Animated.View style={styles.header} entering={FadeIn.duration(600)}>
          <LinearGradient
            colors={["rgba(5, 150, 105, 0.8)", "rgba(6, 95, 70, 0.9)"]}
            style={styles.gradientOverlay}
          />
          <Animated.Text
            style={styles.title}
            entering={FadeInDown.duration(800).delay(200)}
          >
            Your Food Preferences
          </Animated.Text>
          <Animated.Text
            style={styles.subtitle}
            entering={FadeInDown.duration(800).delay(300)}
          >
            Help us create personalized meal plans just for you
          </Animated.Text>
        </Animated.View>

        <Animated.View
          style={[styles.formContainer, animatedFormStyle]}
          entering={SlideInRight.duration(600).delay(400)}
        >
          {/* Food Types */}
          <Animated.View
            style={styles.formGroup}
            entering={FadeInDown.duration(600).delay(500)}
          >
            <Text style={[styles.label, { color: textColor }]}>Food Types *</Text>
            <View style={styles.optionsContainer}>
              {FOOD_TYPES.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor: isSelected(item, selectedFoodTypes) 
                        ? selectedColor 
                        : unselectedColor,
                    },
                  ]}
                  onPress={() => toggleSelection(item, selectedFoodTypes, setSelectedFoodTypes)}
                >
                  <Text 
                    style={[
                      styles.optionText,
                      { color: isSelected(item, selectedFoodTypes) ? "white" : textColor }
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Allergies */}
          <Animated.View
            style={styles.formGroup}
            entering={FadeInDown.duration(600).delay(550)}
          >
            <Text style={[styles.label, { color: textColor }]}>Allergies *</Text>
            <View style={styles.optionsContainer}>
              {ALLERGY_OPTIONS.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor: isSelected(item, selectedAllergies) 
                        ? selectedColor 
                        : unselectedColor,
                    },
                  ]}
                  onPress={() => toggleSelection(item, selectedAllergies, setSelectedAllergies)}
                >
                  <Text 
                    style={[
                      styles.optionText,
                      { color: isSelected(item, selectedAllergies) ? "white" : textColor }
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Medical Conditions */}
          <Animated.View
            style={styles.formGroup}
            entering={FadeInDown.duration(600).delay(600)}
          >
            <Text style={[styles.label, { color: textColor }]}>
              Medical Conditions *
            </Text>
            <View style={styles.optionsContainer}>
              {MEDICAL_CONDITIONS.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor: isSelected(item, selectedMedicalConditions) 
                        ? selectedColor 
                        : unselectedColor,
                    },
                  ]}
                  onPress={() => toggleSelection(
                    item, 
                    selectedMedicalConditions, 
                    setSelectedMedicalConditions
                  )}
                >
                  <Text 
                    style={[
                      styles.optionText,
                      { color: isSelected(item, selectedMedicalConditions) ? "white" : textColor }
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Diabetic Range */}
          <Animated.View
            style={styles.formGroup}
            entering={FadeInDown.duration(600).delay(650)}
          >
            <Text style={[styles.label, { color: textColor }]}>
              Diabetic Range (if applicable)
            </Text>
            <TextInput
              value={diabeticRange}
              onChangeText={setDiabeticRange}
              placeholder="e.g. 120-140 (mg/dL)"
              placeholderTextColor={placeholderColor}
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? "#1e293b" : "#f0fdf4",
                  borderColor: "#9CA3AF",
                  color: textColor,
                },
              ]}
            />
            <Text style={[styles.hint, { color: secondaryText }]}>
              Enter your target blood sugar range
            </Text>
          </Animated.View>

          {/* Pregnancy Status - Only for female users */}
          {userProfile?.gender.toLowerCase() === "female" && (
            <Animated.View
              style={[
                styles.switchContainer,
                {
                  backgroundColor: isDark ? "#1e293b" : "#f0fdf4",
                  borderColor: "#9CA3AF",
                },
              ]}
              entering={FadeInDown.duration(600).delay(700)}
            >
              <Text style={[styles.switchLabel, { color: textColor }]}>
                Are you currently pregnant?
              </Text>
              <Switch
                value={pregnancyStatus}
                onValueChange={setPregnancyStatus}
                trackColor={{
                  false: isDark ? "#475569" : "#cbd5e1",
                  true: "#059669",
                }}
                thumbColor={pregnancyStatus ? "#f0fdf4" : "#f8fafc"}
              />
            </Animated.View>
          )}

          {/* Budget */}
          <Animated.View
            style={styles.formGroup}
            entering={FadeInDown.duration(600).delay(750)}
          >
            <Text style={[styles.label, { color: textColor }]}>
              Budget (BDT per meal) *
            </Text>
            <TextInput
              value={budget}
              onChangeText={(text) => setBudget(text.replace(/[^0-9.]/g, ""))}
              keyboardType="numeric"
              placeholder="e.g. 150, 200"
              placeholderTextColor={placeholderColor}
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? "#1e293b" : "#f0fdf4",
                  borderColor: "#9CA3AF",
                  color: textColor,
                },
              ]}
            />
            <Text style={[styles.hint, { color: secondaryText }]}>
              Enter your average budget for a single meal in BDT
            </Text>
          </Animated.View>

          {/* Save Button */}
          <Animated.View entering={FadeInDown.duration(600).delay(800)}>
            <TouchableOpacity
              onPress={handleSubmitAndGenerate}
              style={styles.submitButton}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={["#059669", "#065f46"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientButton}
              >
                <Text style={styles.buttonText}>Generate Meal Plan</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    marginTop: 20,
  },
  header: {
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
    paddingTop: 32,
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 10,
    zIndex: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    paddingHorizontal: 30,
    zIndex: 10,
  },
  formContainer: {
    padding: 6,
    marginHorizontal: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderRadius: 32,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  hint: {
    fontSize: 12,
    marginTop: 5,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 32,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  submitButton: {
    marginTop: 10,
    borderRadius: 30,
    overflow: "hidden",
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  // Updated styles for button-style selection
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  optionButton: {
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  optionText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
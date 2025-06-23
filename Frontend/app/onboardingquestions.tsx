import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Image,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChevronRight, ChevronLeft } from "lucide-react-native";
import { getToken } from "../lib/tokenManager";

const onboardingSteps = [
  {
    id: 1,
    title: "Welcome to Healthy Eats!",
    subtitle: "Let's start with your age.",
    icon: "User",
    content: "Age",
  },
  {
    id: 2,
    title: "What is your gender?",
    subtitle: "This helps us tailor personalized insights.",
    icon: "User",
    content: "Gender",
  },
  {
    id: 3,
    title: "What is your height?",
    subtitle: "Provide your height in feet and inches.",
    icon: "User",
    content: "Height",
  },
  {
    id: 4,
    title: "What is your weight?",
    subtitle: "Provide your weight in kilograms (kg).",
    icon: "User",
    content: "Weight",
  },
];

const genders = [
  { id: "male", title: "Male" },
  { id: "female", title: "Female" },
];

export default function Onboarding() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [age, setAge] = useState("");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const API_URL = Constants.expoConfig?.extra?.apiUrl;

  useEffect(() => {
    const fetchUserData = async () => {
      const storedUserId = await AsyncStorage.getItem("userId");
      const token = await getToken();
      setUserId(storedUserId);
      setUserToken(token);

      if (!storedUserId || !token) {
        Alert.alert(
          "Authentication Error",
          "User not found. Please log in again."
        );
      }
    };
    fetchUserData();
  }, []);

  const handleNext = () => {
    if (!canProceed()) {
      Alert.alert(
        "Incomplete Step",
        "Please fill in the required field(s) to continue."
      );
      return;
    }

    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);

    if (!userId || !userToken) {
      Alert.alert(
        "Authentication Error",
        "Could not find user credentials. Please log in again."
      );
      setLoading(false);
      return;
    }

    const onboardingData = {
      userId: userId,
      age: parseInt(age, 10),
      gender: gender,
      heightFeet: parseInt(heightFeet, 10),
      heightInches: parseInt(heightInches, 10),
      weight: parseFloat(weight),
      weightUnit: "kg",
    };

    if (!API_URL) {
      Alert.alert(
        "Configuration Error",
        "API URL is not configured. Please check your app.json/app.config.js."
      );
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/user-profile/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(onboardingData),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem("hasCompletedOnboarding", "true");
        router.replace({ pathname: "/home" });
      } else {
        Alert.alert(
          "Onboarding Failed",
          data?.msg || "Could not save preferences. Please try again."
        );
      }
    } catch (error) {
      console.error("Error during onboarding completion:", error);
      Alert.alert(
        "Network Error",
        "An error occurred. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (onboardingSteps[currentStep].content) {
      case "Age":
        return (
          age.trim() !== "" &&
          !isNaN(parseInt(age, 10)) &&
          parseInt(age, 10) > 0
        );
      case "Gender":
        return gender.trim() !== "";
      case "Height":
        const feetVal = parseFloat(heightFeet);
        const inchesVal = parseFloat(heightInches);
        return (
          heightFeet.trim() !== "" &&
          !isNaN(feetVal) &&
          feetVal >= 0 &&
          heightInches.trim() !== "" &&
          !isNaN(inchesVal) &&
          inchesVal >= 0 &&
          inchesVal < 12
        );
      case "Weight":
        return (
          weight.trim() !== "" &&
          !isNaN(parseFloat(weight)) &&
          parseFloat(weight) > 0
        );
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    const step = onboardingSteps[currentStep];

    switch (step.content) {
      case "Age":
        return (
            <View style={styles.inputSection}>
              <Text className="text-foreground py-2 text-lg font-bold">Your Age</Text>
              <TextInput
                style={styles.textInput}
                className="text-foreground"
                placeholder="e.g., 30"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={age}
                onChangeText={(text) => setAge(text.replace(/[^0-9]/g, ""))}
                maxLength={3}
                returnKeyType="done"
                blurOnSubmit={true}
              />
            </View>
        );

      case "Gender":
        return (
            <View style={styles.inputSection}>
              <Text className="text-foreground py-2 text-lg font-bold">Select Your Gender</Text>
              <View style={styles.genderOptionsContainer}>
                {genders.map((g) => (
                  <TouchableOpacity
                    key={g.id}
                    style={[
                      styles.genderOptionButton,
                      gender === g.id && styles.selectedGenderOption,
                    ]}
                    onPress={() => setGender(g.id)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.genderOptionText,
                        gender === g.id && styles.selectedGenderOptionText,
                      ]}
                    >
                      {g.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
        );

      case "Height":
        return (
            <View style={styles.inputSection}>
              <Text className="text-foreground py-2 text-lg font-bold">Height</Text>
              <View style={styles.heightInputContainer}>
                <TextInput
                  style={[styles.textInput, styles.heightInputHalf]}
                  className="text-foreground"
                  placeholder="Feet"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={heightFeet}
                  onChangeText={(text) =>
                    setHeightFeet(text.replace(/[^0-9]/g, ""))
                  }
                  maxLength={1}
                  returnKeyType="done"
                  blurOnSubmit={true}
                />
                <Text style={styles.heightUnitLabel}>ft</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    styles.heightInputHalf,
                    { marginLeft: 10 },
                  ]}
                   className="text-foreground"
                  placeholder="Inches"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={heightInches}
                  onChangeText={(text) => {
                    const filteredText = text.replace(/[^0-9]/g, "");
                    if (
                      parseInt(filteredText, 10) < 12 ||
                      filteredText === ""
                    ) {
                      setHeightInches(filteredText);
                    } else if (parseInt(filteredText, 10) >= 12) {
                      setHeightInches("11");
                    }
                  }}
                  maxLength={2}
                  returnKeyType="done"
                  blurOnSubmit={true}
                />
                <Text style={styles.heightUnitLabel}>in</Text>
              </View>
            </View>
        );

      case "Weight":
        return (
            <View style={styles.inputSection}>
              <Text  className="text-foreground py-2 text-lg font-bold">Weight (kg)</Text>
              <TextInput
                style={styles.textInput}
                className="text-foreground"
                placeholder="e.g., 70.2"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
                value={weight}
                onChangeText={(text) => setWeight(text.replace(/[^0-9.]/g, ""))}
                returnKeyType="done"
                blurOnSubmit={true}
              />
            </View>
        );

      default:
        return null;
    }
  };

  const step = onboardingSteps[currentStep];

  return (
    <View style={styles.container} className="bg-white dark:bg-gray-900">
      {/* Background Gradient */}
      <LinearGradient
        colors={["#065f46", "#059669"]}
        style={styles.backgroundGradient}
      />
      
      {/* Header Section */}
      <View style={styles.header}>
        <Image
          source={require("../assets/images/IconTransparent.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${
                    ((currentStep + 1) / onboardingSteps.length) * 100
                  }%`,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {currentStep + 1} of {onboardingSteps.length}
          </Text>
        </View>
        
        <View style={styles.stepHeader}>
          <Text style={styles.stepTitle}>{step.title}</Text>
          <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContentWrapper}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        {renderStepContent()}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        {currentStep > 0 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <ChevronLeft size={20} color="#065f46" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.nextButton,
            !canProceed() && styles.disabledButton,
            currentStep === 0 && styles.fullWidthButton,
          ]}
          onPress={handleNext}
          disabled={!canProceed() || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.nextButtonText}>
                {currentStep === onboardingSteps.length - 1
                  ? "Get Started"
                  : "Continue"}
              </Text>
              {currentStep < onboardingSteps.length - 1 && (
                <ChevronRight size={20} color="#FFF" />
              )}
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 24,
  },
  progressBar: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFF",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: "#FFF",
    textAlign: "center",
    fontWeight: '600',
  },
  stepHeader: {
    alignItems: "center",
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    lineHeight: 24,
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContentWrapper: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
  },
  stepContent: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  inputSection: {
    width: "100%",
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: '#065f46',
  },
  textInput: {
    borderRadius: 32,
    padding: 16,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#9CA3AF'
  },
  heightInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  heightInputHalf: {
    flex: 1,
  },
  heightUnitLabel: {
    fontSize: 18,
    marginLeft: 8,
    marginRight: 8,
    color: '#065f46',
    fontWeight: '600',
  },
  genderOptionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  genderOptionButton: {
    backgroundColor: "#f0fdf4",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#d1fae5",
    marginBottom: 10,
    width: "48%",
    alignItems: "center",
  },
  selectedGenderOption: {
    borderColor: "#059669",
    backgroundColor: "#d1fae5",
  },
  genderOptionText: {
    fontSize: 16,
    color: "#065f46",
  },
  selectedGenderOptionText: {
    color: "#065f46",
    fontWeight: "bold",
  },
  navigation: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
    gap: 16,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 32,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: "#d1fae5",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#065f46",
    marginLeft: 4,
  },
  nextButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#059669",
    borderRadius: 32,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#065f46',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  fullWidthButton: {},
  disabledButton: {
    backgroundColor: "#a8a29e",
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    marginRight: 4,
  },
});
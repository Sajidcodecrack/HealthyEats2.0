import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  Image,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, ChevronRight, ChevronLeft } from "lucide-react-native";
import { getToken } from "../lib/tokenManager"; // Adjust the import path as necessary

// --- Data for the Healthy Life App (Personal Info Focused) ---
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
// --- End of Data ---

export default function Onboarding() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const [age, setAge] = useState("");
  // Removed heightCm as it's no longer needed for storage
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState("");
  // Explicitly type userId and userToken as string | null
  const [userId, setUserId] = useState<string | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const API_URL = Constants.expoConfig?.extra?.apiUrl;

  // Fetch user data from storage when the component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      const storedUserId = await AsyncStorage.getItem("userId");
      const token = await getToken(); // Get token from SecureStore
      setUserId(storedUserId);
      setUserToken(token);

      if (!storedUserId || !token) {
        Alert.alert(
          "Authentication Error",
          "User not found. Please log in again."
        );
        // Optional: Redirect to login
        // router.replace('/login');
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

    // Removed height conversion logic from handleNext as height is now stored in feet/inches
    // if (onboardingSteps[currentStep].content === "Height") {
    //   const feet = parseFloat(heightFeet) || 0;
    //   const inches = parseFloat(heightInches) || 0;
    //   const totalInches = feet * 12 + inches;
    //   const convertedCm = totalInches * 2.54;
    //   setHeightCm(convertedCm.toFixed(2));
    // }

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

    // This payload is structured to match your backend API
    const onboardingData = {
      userId: userId,
      age: parseInt(age, 10),
      gender: gender,
      heightFeet: parseInt(heightFeet, 10), // Send feet directly
      heightInches: parseInt(heightInches, 10), // Send inches directly
      weight: parseFloat(weight),
      // Add units if your backend schema requires them, otherwise they can be omitted
      // heightUnit: "ft/in", // Removed as per schema
      weightUnit: "kg",
    };

    console.log("Submitting onboarding data:", onboardingData);

    if (!API_URL) {
      Alert.alert(
        "Configuration Error",
        "API URL is not configured. Please check your app.json/app.config.js."
      );
      setLoading(false);
      return;
    }

    try {
      // Corrected API endpoint
      const response = await fetch(`${API_URL}/api/user-profile/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Your backend expects a userId in the body, but if it's protected by auth middleware,
          // you should send the token. The backend will get the userId from the token.
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(onboardingData),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem("hasCompletedOnboarding", "true");
        router.replace({ pathname: "/(tabs)" });
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
          <View style={styles.stepContent}>
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel} className="text-foreground">Your Age</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., 30"
                keyboardType="numeric"
                value={age}
                onChangeText={(text) => setAge(text.replace(/[^0-9]/g, ""))}
                maxLength={3}
                returnKeyType="done"
                blurOnSubmit={true}
                className="bg-background border border-gray-500 text-foreground"
              />
            </View>
          </View>
        );

      case "Gender":
        return (
          <View style={styles.stepContent}>
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel} className="text-foreground">Select Your Gender</Text>
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
          </View>
        );

      case "Height":
        return (
          <View style={styles.stepContent}>
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel} className="text-foreground">Height</Text>
              <View style={styles.heightInputContainer}>
                <TextInput
                  style={[styles.textInput, styles.heightInputHalf]}
                  placeholder="Feet (e.g., 5)"
                  keyboardType="numeric"
                  value={heightFeet}
                  onChangeText={(text) =>
                    setHeightFeet(text.replace(/[^0-9]/g, ""))
                  }
                  maxLength={1}
                  returnKeyType="done"
                  blurOnSubmit={true}
                  className="border border-gray-500 text-foreground"
                />
                <Text style={styles.heightUnitLabel} className="text-foreground">ft</Text>
                <TextInput
                  className="border border-gray-500 text-foreground"
                  style={[
                    styles.textInput,
                    styles.heightInputHalf,
                    { marginLeft: 10 },
                  ]}
                  placeholder="Inches"
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
                <Text style={styles.heightUnitLabel} className="text-foreground">in</Text>
              </View>
            </View>
          </View>
        );

      case "Weight":
        return (
          <View style={styles.stepContent}>
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel} className="text-foreground">Weight (kg)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., 70.2"
                keyboardType="decimal-pad"
                value={weight}
                onChangeText={(text) => setWeight(text.replace(/[^0-9.]/g, ""))}
                returnKeyType="done"
                blurOnSubmit={true}
                className="bg-background border border-gray-500 text-foreground"
              />
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const step = onboardingSteps[currentStep];

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container} className="bg-background">
        <LinearGradient colors={["#934925", "#F97C3E"]} style={styles.header}>
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
            {/* Icon rendering can be placed here */}
            <Image
              source={require("../assets/images/IconTransparent.png")}
              style={{ width: 120, height: 120}}
              resizeMode="contain"
            />
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
          </View>
        </LinearGradient>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContentWrapper}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {renderStepContent()}
        </ScrollView>

        <View style={styles.navigation} className="bg-background">
          {currentStep > 0 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.7}
            >
              <ChevronLeft size={20} color="#6B7280" />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60, // Adjust for status bar
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFF",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  stepHeader: {
    alignItems: "center",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
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
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    lineHeight: 24,
  },
  content: {
    flex: 1,
  },
  scrollContentWrapper: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
  },
  stepContent: {
    // This view just needs to wrap its children.
  },
  welcomeContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
  optionsContainer: {
    flex: 1,
    justifyContent: "center",
  },
  optionCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  selectedOption: {
    borderColor: "#10B981",
    backgroundColor: "#F0FDF4",
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  selectedOptionText: {
    color: "#065F46",
  },
  optionDescription: {
    fontSize: 14,
    color: "#6B7280",
  },
  selectedOptionDescription: {
    color: "#047857",
  },
  inputSection: {
    width: "100%",
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  textInput: {
    borderRadius: 32,
    padding: 16,
    fontSize: 18,
    borderWidth: 1,
  },
  heightInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heightInputHalf: {
    flex: 1,
  },
  heightUnitLabel: {
    fontSize: 18,
    marginLeft: 8,
    marginRight: 8,
  },
  genderOptionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },
  genderOptionButton: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 10,
    width: "48%",
    alignItems: "center",
  },
  selectedGenderOption: {
    borderColor: "#FFB078",
    backgroundColor: "#FAF2DD",
  },
  genderOptionText: {
    fontSize: 16,
    color: "#4B5563",
  },
  selectedGenderOptionText: {
    color: "#0F100F",
    fontWeight: "600",
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
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    marginLeft: 4,
  },
  nextButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F97C3E",
    borderRadius: 32,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  fullWidthButton: {
    // This style is now redundant since back button is hidden,
    // but kept for clarity in case the logic changes.
    // The `flex: 1` on `nextButton` already handles this.
  },
  disabledButton: {
    backgroundColor: "#A1A1AA",
    opacity: 1,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    marginRight: 4,
  },
  loginButton: {
    alignItems: 'center',
    paddingBottom: Platform.OS === "ios" ? 20 : 10,
    paddingHorizontal: 24,
  },
  loginButtonText: {
    color: '#F97C3E',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
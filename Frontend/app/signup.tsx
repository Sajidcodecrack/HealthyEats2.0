import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  Animated as RNAnimated,
} from "react-native";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { saveToken } from "../lib/tokenManager";
import { LinearGradient } from "expo-linear-gradient";
import { Modal, Pressable } from "react-native";
// 🔥 Reanimated
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeInDown,
  FadeIn,
  Easing,
} from "react-native-reanimated";

const Signup: React.FC = () => {
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [keyboardVisible, setKeyboardVisible] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const isWeb = Platform.OS === "web";
  const API_URL = Constants.expoConfig?.extra?.apiUrl;
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState("");

  const showTerms = (type: string) => {
    setModalContent(
      type === "terms"
        ? "Terms of Service content would go here"
        : `Privacy Policy — Healthy Eats
Effective Date: June 30, 2025
Operated by: Team Codex

Healthy Eats (“we”, “our”, or “us”) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, share, and safeguard your information when you use the Healthy Eats mobile application and related services (collectively, the “App”).

By using our App, you agree to the terms outlined in this Privacy Policy. If you do not agree, please do not use Healthy Eats.

1. Information We Collect
We collect the following types of information to provide and improve our services:

a. Personal Information
Name

Email address

Age and gender (if provided)

Preferred language (e.g., Bangla or English)

b. Health & Fitness Information
Dietary preferences (e.g., vegetarian, diabetic-friendly)

Fitness goals (e.g., weight loss, muscle gain)

Activity levels and routines

c. Budget & Grocery Information
Monthly food budget

Preferred grocery items

Local product availability (may use location if permission is granted)

d. Usage Data
Features and pages you interact with

Time spent on the app

Device type and operating system

2. How We Use Your Information
We use your information to:

Personalize your meal and workout recommendations

Provide culturally relevant, budget-friendly grocery suggestions

Track and report your health and spending progress

Analyze usage to improve the App experience

Offer customer support and respond to user inquiries

Send updates, tips, or notifications (if you opt in)

3. Sharing Your Information
We do not sell your personal data.

We may share data in the following cases:

With trusted service providers (e.g., hosting, analytics) for app operation only

To comply with laws or respond to legal requests

In anonymous or aggregated form, for research, analysis, or app development

4. Your Rights and Choices
You have full control over your data. You may:

Update or correct your personal profile

Request a copy of your stored data

Delete your account and associated information

Opt out of communications or notifications at any time

To exercise any of these rights, contact us at 📧 teamcodex25@gmail.com

5. How We Protect Your Information
We implement industry-standard security measures to safeguard your data:

Encrypted communication (HTTPS)

Secure data storage and backups

Regular monitoring and system audits

Please note: While we strive to protect your information, no system is entirely secure. Use the app at your discretion.

6. Data Retention
We retain your data:

As long as your account is active

Or as necessary for the purposes listed above

You may request account and data deletion at any time.

7. Children’s Privacy
Healthy Eats is intended for users aged 13 and above. We do not knowingly collect personal information from children under 13. If we become aware of such data, it will be deleted promptly.

8. Changes to This Privacy Policy
We may revise this Privacy Policy from time to time. When major changes occur, we will notify users through the app or by email. Continued use of the app means you agree to the updated policy.

9. Contact Us
Have questions or concerns about your privacy? We’re here to help.

📧 Email: teamcodex25@gmail.com
📍 Address: United City, Madani Ave, Dhaka 1212`
    );

    setModalVisible(true);
  };
  // 🔥 Reanimated SharedValue
  const formOffset = useSharedValue(0);
  const formPadding = useSharedValue(24);

  useEffect(() => {
    const keyboardShow =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const keyboardHide =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSubscription = Keyboard.addListener(keyboardShow, () => {
      setKeyboardVisible(true);
      formOffset.value = withTiming(-100, {
        duration: 300,
        easing: Easing.inOut(Easing.ease),
      });
    });

    const hideSubscription = Keyboard.addListener(keyboardHide, () => {
      setKeyboardVisible(false);
      formOffset.value = withTiming(0, {
        duration: 300,
        easing: Easing.inOut(Easing.ease),
      });
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const animatedFormStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: formOffset.value }],
  }));

  const formContainerStyle = useAnimatedStyle(() => ({
    paddingTop: formPadding.value,
  }));

  const handleSignup = async (): Promise<void> => {
    if (!isWeb) Keyboard.dismiss();
    setError("");
    setLoading(true);

    // validations...
    if (!fullName.trim())
      return setError("Please enter your full name"), setLoading(false);
    if (!email.trim())
      return setError("Please enter your email"), setLoading(false);
    if (!password)
      return setError("Please enter a password"), setLoading(false);
    if (!confirmPassword)
      return setError("Please confirm your password"), setLoading(false);
    if (password !== confirmPassword)
      return setError("Passwords do not match"), setLoading(false);
    if (password.length < 6)
      return (
        setError("Password must be at least 6 characters"), setLoading(false)
      );

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return setError("Please enter a valid email"), setLoading(false);
    if (!API_URL) return setError("API URL not configured."), setLoading(false);

    try {
      const response = await fetch(`${API_URL}/api/user/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName, email, password }),
      });

      const data = await response.json();
      if (response.ok) {
      // ✅ Instead of routing directly to onboarding, go to OTP screen
      router.push({
        pathname: "/otp",
        params: { email, source
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          : "signup" }, // pass the email for verification
      });
    } else {
      setError(data?.msg || "Registration failed. Try again.");
    }
  } catch (err) {
    console.error("Signup error:", err);
    setError("Unexpected error occurred.");
  } finally {
    setLoading(false);
  }
};

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            className="flex-1 bg-background dark:bg-gray-900"
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header Section */}
            <LinearGradient
              colors={["#065f46", "#059669"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                alignItems: "center",
                justifyContent: "center",
                height: 200,
              }}
            >
              {!keyboardVisible && (
                <View>
                  <Image
                    source={require("../assets/images/IconTransparent.png")}
                    style={{ width: 120, height: 120 }}
                    resizeMode="contain"
                  />
                </View>
              )}
            </LinearGradient>

            {/* Form Container */}
            <Animated.View
              style={[formContainerStyle, animatedFormStyle]}
              className="px-6 pt-8 bg-background dark:bg-gray-900 rounded-t-[32px] -mt-8"
            >
              <Animated.Text
                entering={FadeInDown.delay(100)}
                className="text-foreground dark:text-white text-3xl font-bold text-center mb-6"
              >
                Welcome
              </Animated.Text>

              {error ? (
                <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
                  <Text className="text-red-600 dark:text-red-400 text-center text-sm font-medium">
                    {error}
                  </Text>
                </View>
              ) : null}

              {/* Inputs */}
              {[
                ["Full name", fullName, setFullName, <User color="#059669" />],
                ["Email address", email, setEmail, <Mail color="#059669" />],
                ["Password", password, setPassword, <Lock color="#059669" />],
                [
                  "Confirm password",
                  confirmPassword,
                  setConfirmPassword,
                  <Lock color="#059669" />,
                ],
              ].map(([label, value, setter, icon], i) => (
                <Animated.View
                  key={i}
                  entering={FadeInDown.delay(100 + i * 100)}
                  style={styles.inputWrapper}
                >
                  <View className="p-2">{icon}</View>
                  <TextInput
                    className="text-foreground"
                    style={styles.input}
                    placeholder={label}
                    placeholderTextColor="#9CA3AF"
                    value={value as string}
                    onChangeText={setter as (text: string) => void}
                    secureTextEntry={
                      label === "Password"
                        ? !showPassword
                        : label === "Confirm password"
                        ? !showConfirmPassword
                        : false
                    }
                    autoCapitalize="none"
                  />
                  {(label === "Password" || label === "Confirm password") && (
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() =>
                        label === "Password"
                          ? setShowPassword(!showPassword)
                          : setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {(
                        label === "Password"
                          ? showPassword
                          : showConfirmPassword
                      ) ? (
                        <EyeOff size={20} color="#059669" />
                      ) : (
                        <Eye size={20} color="#059669" />
                      )}
                    </TouchableOpacity>
                  )}
                </Animated.View>
              ))}

              <View style={styles.termsContainer}>
                {/* Replace the existing termsLink in your JSX */}
                <Text style={styles.termsText}>
                  By creating an account, you agree to our 
                  <Pressable onPress={() => showTerms("privacy")}>
                    <Text style={styles.termsLink}>Terms & conditions and Privacy Policy</Text>
                  </Pressable>
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleSignup}
                className="bg-emerald-600 dark:bg-emerald-700 py-5 px-6 rounded-full items-center justify-center"
                activeOpacity={0.9}
                disabled={loading}
                style={{
                  shadowColor: "#065f46",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 6,
                  elevation: 6,
                }}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-white text-base font-bold">
                    Create Account
                  </Text>
                )}
              </TouchableOpacity>

              {!keyboardVisible && (
                <Animated.View entering={FadeIn.delay(400)}>
                  <TouchableOpacity
                    onPress={() => router.push("/login")}
                    className="mt-6"
                  >
                    <Text className="text-center text-foreground dark:text-white text-base">
                      Already have an account?{" "}
                      <Text className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        Sign In
                      </Text>
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </Animated.View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/70 p-4">
          <Animated.View
            entering={FadeIn.duration(300)}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md max-h-[80vh]"
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="text-2xl font-bold text-emerald-600 mb-4">
                {modalContent.startsWith("Privacy")
                  ? "Privacy Policy"
                  : "Terms of Service"}
              </Text>
              <Text className="text-gray-800 dark:text-gray-200">
                {modalContent}
              </Text>
            </ScrollView>

            <TouchableOpacity
              className="mt-6 bg-emerald-600 py-3 rounded-full"
              onPress={() => setModalVisible(false)}
            >
              <Text className="text-white text-center font-bold">Close</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 32,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#9CA3AF",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter-Regular",

    paddingVertical: 16,
  },
  eyeButton: {
    position: "absolute",
    right: 16,
    padding: 4,
  },
  termsContainer: {
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  termsText: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  termsLink: {
    color: "#059669",
    fontFamily: "Inter-SemiBold",
  },
});

export default Signup;

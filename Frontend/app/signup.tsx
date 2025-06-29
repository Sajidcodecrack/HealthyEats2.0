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
                      label === "Password" ? showPassword : showConfirmPassword
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
              <Text style={styles.termsText}>
                By creating an account, you agree to our{" "}
                <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
                <Text style={styles.termsLink}>Privacy Policy</Text>
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

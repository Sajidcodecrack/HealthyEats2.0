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
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Mail, ChevronLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Constants from "expo-constants";

// 🌀 Reanimated
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

const isWeb = Platform.OS === "web";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [keyboardVisible, setKeyboardVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const API_URL = Constants.expoConfig?.extra?.apiUrl;

  // Shared value for animation
  const formOffset = useSharedValue(0);
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

  const handleSubmit = async () => {
  setLoading(true);
  setError("");
  setSuccess("");

  try {
    const response = await fetch(`${API_URL}/api/user/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const contentType = response.headers.get("content-type");

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Something went wrong");
    }

    // router.navigate("/otp");

    router.push({
      pathname: "/otp",
      params: { email, purpose: "reset" }, 
    });

    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      setSuccess(data.msg || "Reset link sent!");
    } else {
      const text = await response.text();
      throw new Error("Unexpected response: " + text);
    }

  } catch (err) {
    if (err instanceof Error) {
      console.error("Forgot password error:", err.message);
      setError("Failed to send reset link. Please try again.");
    } else {
      console.error("Forgot password unknown error:", err);
      setError("Something went wrong. Please try again.");
    }
  } finally {
    setLoading(false);
  }
};



  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          className="bg-background dark:bg-gray-900"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header with back button */}
          <LinearGradient
            colors={["#065f46", "#059669"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              height: 260,
              paddingTop: 48,
            }}
          >
            

            {!keyboardVisible && (
              <View className="items-center justify-center h-full">
                <Image
                  source={require("../assets/images/IconTransparent.png")}
                  style={{ width: 120, height: 120 }}
                  resizeMode="contain"
                />
              </View>
            )}
          </LinearGradient>

          {/* Animated Form */}
          <Animated.View
            style={[styles.formContainer, animatedFormStyle]}
            className="px-6 pt-8 bg-background dark:bg-gray-900 rounded-t-[32px] -mt-8"
          >
            <Animated.Text
              entering={FadeInDown.delay(100)}
              className="text-foreground dark:text-white text-3xl font-bold text-center mb-4"
            >
              Reset Password
            </Animated.Text>

            <Animated.Text
              entering={FadeInDown.delay(200)}
              className="text-gray-600 dark:text-gray-400 text-center text-base mb-8 px-4"
            >
              Enter your email to receive a password reset link
            </Animated.Text>

            {error ? (
              <Animated.View
                entering={FadeInDown.delay(200)}
                className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-xl p-4 mb-6"
              >
                <Text className="text-red-600 dark:text-red-400 text-center text-sm font-medium">
                  {error}
                </Text>
              </Animated.View>
            ) : null}

            {success ? (
              <Animated.View
                entering={FadeInDown.delay(200)}
                className="bg-emerald-100 dark:bg-emerald-900/20 border border-emerald-300 dark:border-emerald-800 rounded-xl p-4 mb-6"
              >
                <Text className="text-emerald-700 dark:text-emerald-400 text-center text-sm font-medium">
                  {success}
                </Text>
              </Animated.View>
            ) : null}

            {/* Email Input */}
            <Animated.View
              entering={FadeInDown.delay(300)}
              style={styles.inputWrapper}
            >
              <Mail size={20} color="#059669" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                className="text-foreground"
                placeholder="Your email address"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </Animated.View>

            {/* Submit Button */}
            <Animated.View entering={FadeInDown.delay(400)}>
              <TouchableOpacity
                onPress={handleSubmit}
                style={styles.submitButton}
                activeOpacity={0.85}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-white text-base font-bold">
                    Send Reset Link
                  </Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Back to Login */}
            <Animated.View
              entering={FadeInDown.delay(500)}
              className="pt-6 pb-12"
            >
              <TouchableOpacity
                onPress={() => router.push("/login")}
                className="flex-row justify-center items-center"
              >
                <ChevronLeft size={18} color="#059669" />
                <Text className="text-emerald-600 dark:text-emerald-400 ml-1 font-medium">
                  Back to Login
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter-Regular",
    paddingVertical: 16,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 32,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#9CA3AF",
  },
  inputIcon: {
    marginRight: 12,
  },
  submitButton: {
    backgroundColor: "#059669",
    paddingVertical: 16,
    borderRadius: 9999,
    alignItems: "center",
    shadowColor: "#065f46",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
});

export default ForgotPassword;
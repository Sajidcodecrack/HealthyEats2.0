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
  Dimensions,
} from "react-native";
import { Eye, EyeOff, Mail, Lock } from "lucide-react-native";
import { Checkbox } from "../~/components/ui/checkbox";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { saveToken } from "../lib/tokenManager";
import { LinearGradient } from "expo-linear-gradient";

// 🌀 Reanimated
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

const isWeb = Platform.OS === "web";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [keepSignedIn, setKeepSignedIn] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [keyboardVisible, setKeyboardVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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


  const handleLogin = async (): Promise<void> => {
    if (!isWeb) Keyboard.dismiss();
    setError("");
    setLoading(true);

    if (!email.trim()) {
      setError("Please enter your email");
      setLoading(false);
      return;
    }

    if (!password) {
      setError("Please enter your password");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    if (!API_URL) {
      setError("API URL not configured. Check app.json");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token && data.user) {
        await saveToken(data.token);
        await AsyncStorage.setItem("userId", data.user.id);
        router.replace("/home");
      } else {
        setError(data?.msg || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Unexpected error. Check your connection.");
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
          {/* Header */}
          <LinearGradient
            colors={["#065f46", "#059669"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              alignItems: "center",
              justifyContent: "center",
              height: 260,
            }}
          >
            {!keyboardVisible && (
              <Image
                source={require("../assets/images/IconTransparent.png")}
                style={{ width: 120, height: 120 }}
                resizeMode="contain"
              />
            )}
          </LinearGradient>

          {/* Animated Form */}
          <Animated.View 
          style={[styles.formContainer, animatedFormStyle]}
          className="px-6 pt-8 bg-background dark:bg-gray-900 rounded-t-[32px] -mt-8">
            <Animated.Text
              entering={FadeInDown.delay(100)}
              className="text-foreground dark:text-white text-3xl font-bold text-center mb-8"
            >
              Welcome Back
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

            {/* Email */}
            <Animated.View
              entering={FadeInDown.delay(200)}
              style={styles.inputWrapper}
            >
              <Mail size={20} color="#059669" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                className="text-foreground"
                placeholder="Email address"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </Animated.View>

            {/* Password */}
            <Animated.View
              entering={FadeInDown.delay(300)}
              style={styles.inputWrapper}
            >
              <Lock size={20} color="#059669" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.passwordInput]}
                className="text-foreground"
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#059669" />
                ) : (
                  <Eye size={20} color="#059669" />
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Remember Me */}
            <Animated.View
              entering={FadeInDown.delay(400)}
              className="flex-row justify-between items-center my-4"
            >
              <TouchableOpacity
                onPress={() => setKeepSignedIn(!keepSignedIn)}
                className="flex-row items-center"
              >
                <Checkbox
                  checked={keepSignedIn}
                  onCheckedChange={setKeepSignedIn}
                  className="h-5 w-5 border-emerald-500"
                />
                <Text className="text-foreground dark:text-white ml-2 text-base">
                  Remember me
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push("/forgotpassword")}>
                <Text className="text-emerald-600 dark:text-emerald-400 font-medium">
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Login Button */}
            <Animated.View entering={FadeInDown.delay(500)}>
              <TouchableOpacity
                onPress={handleLogin}
                style={styles.loginButton}
                activeOpacity={0.85}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-white text-base font-bold">
                    Sign In
                  </Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            {!keyboardVisible && (
              <View>
                {/* Divider */}
                <View className="flex-row items-center my-6">
                  <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                  <Text className="text-gray-500 dark:text-gray-400 px-4 text-sm">
                    Or continue with
                  </Text>
                  <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                </View>

                {/* Sign Up */}
                <TouchableOpacity
                  onPress={() => router.push("/signup")}
                  className="pb-6"
                >
                  <Text className="text-center text-foreground dark:text-white text-base">
                    Don’t have an account?{" "}
                    <Text className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      Sign Up
                    </Text>
                  </Text>
                </TouchableOpacity>
              </View>
            )}
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
  passwordInput: {
    paddingRight: 40,
  },
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
  eyeButton: {
    position: "absolute",
    right: 16,
    padding: 4,
  },
  loginButton: {
    backgroundColor: "#059669",
    paddingVertical: 16,
    borderRadius: 9999,
    alignItems: "center",
    shadowColor: "#065f46",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    marginTop: 8,
  },
});

export default Login;

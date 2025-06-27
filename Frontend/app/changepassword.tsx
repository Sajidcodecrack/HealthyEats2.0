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
import { ChevronLeft, Lock, Eye, EyeOff } from "lucide-react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

const ChangePassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();

  // Shared value for animation
  const formOffset = useSharedValue(0);
  
  useEffect(() => {
    const keyboardShow = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const keyboardHide = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSubscription = Keyboard.addListener(keyboardShow, () => {
      formOffset.value = withTiming(-100, {
        duration: 300,
        easing: Easing.inOut(Easing.ease),
      });
    });

    const hideSubscription = Keyboard.addListener(keyboardHide, () => {
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

  const validatePassword = () => {
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    
    return true;
  };

  const handleSubmit = () => {
    setError("");
    setSuccess("");
    
    if (!validatePassword()) return;
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess("Password changed successfully!");
      
      // Redirect after success
      setTimeout(() => {
        router.push("/");
      }, 1500);
    }, 2000);
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
            style={{ height: 260, paddingTop: 48 }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              className="absolute top-14 left-6 z-10"
            >
              <ChevronLeft size={28} color="white" />
            </TouchableOpacity>

            <View className="items-center justify-center h-full">
              <Image
                source={require("../assets/images/IconTransparent.png")}
                style={{ width: 120, height: 120 }}
                resizeMode="contain"
              />
            </View>
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
              Change Password
            </Animated.Text>

            <Animated.Text
              entering={FadeInDown.delay(200)}
              className="text-gray-600 dark:text-gray-400 text-center text-base mb-8 px-4"
            >
              Create a strong, unique password for your account
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

            {/* New Password */}
            <Animated.View
              entering={FadeInDown.delay(300)}
              style={styles.inputWrapper}
            >
              <Lock size={20} color="#059669" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                className="text-foreground"
                placeholder="New password"
                placeholderTextColor="#9CA3AF"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="pr-3"
              >
                {showPassword ? (
                  <EyeOff size={20} color="#9CA3AF" />
                ) : (
                  <Eye size={20} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Password Strength Indicator */}
            <Animated.View 
              entering={FadeInDown.delay(350)}
              className="flex-row h-1 mb-6"
            >
              <View 
                className={`flex-1 mx-1 rounded-full ${
                  newPassword.length > 0 
                    ? (newPassword.length < 4 ? "bg-red-500" : 
                       newPassword.length < 8 ? "bg-yellow-500" : "bg-green-500")
                    : "bg-gray-200"
                }`} 
              />
              <View 
                className={`flex-1 mx-1 rounded-full ${
                  newPassword.length > 4 
                    ? (newPassword.length < 8 ? "bg-yellow-500" : "bg-green-500")
                    : "bg-gray-200"
                }`} 
              />
              <View 
                className={`flex-1 mx-1 rounded-full ${
                  newPassword.length > 7 ? "bg-green-500" : "bg-gray-200"
                }`} 
              />
              <View 
                className={`flex-1 mx-1 rounded-full ${
                  newPassword.length > 10 ? "bg-green-500" : "bg-gray-200"
                }`} 
              />
            </Animated.View>

            {/* Confirm Password */}
            <Animated.View
              entering={FadeInDown.delay(400)}
              style={styles.inputWrapper}
            >
              <Lock size={20} color="#059669" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                className="text-foreground"
                placeholder="Confirm password"
                placeholderTextColor="#9CA3AF"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                className="pr-3"
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color="#9CA3AF" />
                ) : (
                  <Eye size={20} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Password Requirements */}
            <Animated.View 
              entering={FadeInDown.delay(450)}
              className="mb-8"
            >
              <Text className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                Password must:
              </Text>
              <View className="flex-row items-center mb-1">
                <View className={`w-2 h-2 rounded-full mr-2 ${
                  newPassword.length >= 8 ? "bg-emerald-500" : "bg-gray-300"
                }`} />
                <Text className="text-gray-500 dark:text-gray-400 text-sm">
                  Be at least 8 characters
                </Text>
              </View>
              <View className="flex-row items-center">
                <View className={`w-2 h-2 rounded-full mr-2 ${
                  newPassword === confirmPassword && newPassword.length > 0 
                    ? "bg-emerald-500" 
                    : "bg-gray-300"
                }`} />
                <Text className="text-gray-500 dark:text-gray-400 text-sm">
                  Passwords must match
                </Text>
              </View>
            </Animated.View>

            {/* Submit Button */}
            <Animated.View entering={FadeInDown.delay(500)}>
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
                    Change Password
                  </Text>
                )}
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
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter-Regular",
    paddingVertical: 16,
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

export default ChangePassword;
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
} from "react-native";
import { Checkbox } from "../~/components/ui/checkbox";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Input } from "../~/components/ui/input";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [keepSignedIn, setKeepSignedIn] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [keyboardVisible, setKeyboardVisible] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleLogin = async (): Promise<void> => {
    Keyboard.dismiss();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    if (!password) {
      setError("Please enter your password");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      await AsyncStorage.setItem("hasCompletedOnboarding", "true");
      router.replace({ pathname: "/home" });
    } catch (error) {
      console.error("Error during login:", error);
      setError("An error occurred during login. Please try again.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
      keyboardVerticalOffset={0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          className="flex-1 bg-background dark:bg-dark-background"
          contentContainerStyle={{
            flexGrow: 1,
            backgroundColor: "transparent",
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View
            className={`items-center bg-primary  ${
              keyboardVisible ? "pt-4 pb-4" : "pt-16 pb-8"
            }`}
          >
            {!keyboardVisible && (
              <Image
                source={require("../assets/images/icon.png")}
                style={{ width: 120, height: 120 }}
                resizeMode="contain"
              />
            )}
          </View>
          <View className="h-8 bg-background dark:bg-dark-background fixed bottom-7 rounded-t-[32px]"></View>

          {/* Form Container */}
          <View className="flex-1 px-6 pt-6 bg-background dark:bg-dark-background rounded-t-[32px]">
            <Text className="text-black dark:text-white text-2xl font-extrabold text-center mb-12">
              Welcome Back
            </Text>

            {error ? (
              <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
                <Text className="text-red-600 dark:text-red-400 text-center text-sm font-medium">
                  {error}
                </Text>
              </View>
            ) : null}

            <View className="space-y-2">
              <View>
                <Text className="text-black dark:text-white text-sm font-medium mb-2 ml-1">
                  Email Address
                </Text>
                <Input
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  textContentType="emailAddress"
                  autoComplete="off"
                  returnKeyType="next"
                  className="px-6 py-4 mb-4 border border-gray-400 rounded-full text-black dark:text-white bg-transparent focus:border-primary"
                />
              </View>

              <View>
                <Text className="text-black dark:text-white text-sm font-medium mb-2 ml-1">
                  Password
                </Text>
                <Input
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  textContentType="password"
                  autoComplete="off"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  className="px-6 py-4 mb-4 border border-gray-400 rounded-full text-black dark:text-white bg-transparent focus:border-primary"
                />
              </View>
            </View>

            {/* Keep Signed In Checkbox */}
            <TouchableOpacity
              onPress={() => setKeepSignedIn(!keepSignedIn)}
              className="flex-row items-center my-2 mb-5"
              activeOpacity={1}
            >
              <Checkbox
                checked={keepSignedIn} // Use keepSignedIn for the checked prop
                onCheckedChange={setKeepSignedIn} // Pass setKeepSignedIn to update the state
                className="h-5 w-5" // Adjust size for mobile
              />
              <Text className="text-black dark:text-white ml-2 text-base">
                Keep me signed in
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              className="bg-primary py-4 px-6 rounded-full items-center"
              activeOpacity={0.9}
              style={{
                shadowColor: "#FF6200",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 4,
              }}
            >
              <Text className="text-white text-base font-bold">Sign In</Text>
            </TouchableOpacity>

            {/* Sign Up Link */}
            {!keyboardVisible && (
              <TouchableOpacity
                onPress={() => router.push("/signup")}
                className="py-4"
                activeOpacity={0.7}
              >
                <Text className="text-center text-black dark:text-white text-base">
                  Don’t have an account?{" "}
                  <Text className="text-[#FF6200] font-semibold">Sign Up</Text>
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default Login;

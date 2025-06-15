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
  Keyboard
} from "react-native";
import { Checkbox } from "../~/components/ui/checkbox"; // Assuming this is your reusable Checkbox
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Input } from "../~/components/ui/input";
import Constants from 'expo-constants'; // Import expo-constants

const Signup: React.FC = () => {
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [keepSignedIn, setKeepSignedIn] = useState<boolean>(true); // This state will control the checkbox
  const [error, setError] = useState<string>("");
  const [keyboardVisible, setKeyboardVisible] = useState<boolean>(false);
  
  const [loading, setLoading] = useState(false); // To show loading state
  const router = useRouter();
  const isWeb = Platform.OS === 'web';
  const API_URL = Constants.expoConfig?.extra?.apiUrl;
  useEffect(() => {
    if (!isWeb) {
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
    }
  }, [isWeb]);

  const handleSignup = async (): Promise<void> => {
    // Dismiss keyboard on non-web platforms
    if (!isWeb) {
      Keyboard.dismiss();
    }
    setError(''); // Clear previous errors
    setLoading(true); // Set loading to true

    // Client-side validation
    if (!fullName.trim()) {
      setError('Please enter your full name');
      setLoading(false);
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email');
      setLoading(false);
      return;
    }
    if (!password) {
      setError('Please enter a password');
      setLoading(false);
      return;
    }
    if (!confirmPassword) {
      setError('Please confirm your password');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      // It's highly recommended to use an environment variable for your API URL
      // For local development, this hardcoded IP is common.

      const response = await fetch(`${API_URL}/api/user/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: fullName,
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Backend returns msg: 'Registration successful!' on success (status 201)
        // If your backend for registration returns a token, you would save it here.
        // As per your provided backend, it only returns a message for registration.
        await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
        // Navigate to home or a login screen after successful registration
        router.replace({ pathname: '/home' });
      } else {
        // Backend returns msg for errors (e.g., 'Email already registered.')
        setError(data?.msg || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during signup:', error);
      setError('An unexpected error occurred. Please check your connection and try again.');
    } finally {
      setLoading(false); // Always set loading to false after the operation
    }
  };

  // Original mobile layout (unchanged)
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
            className={`items-center bg-primary  ${
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
          <View className="flex-1 px-6 -mt-5 bg-background dark:bg-dark-background rounded-t-[32px]">
            <Text className="text-black dark:text-white text-2xl font-extrabold text-center mb-6">
              Create An Account
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
                <Text className="text-black dark:text-white  text-sm font-medium mb-1 ml-1">
                  Full Name
                </Text>
                <Input
                  placeholder="Enter your full name"
                  value={fullName}
                  onChangeText={setFullName}
                  className="px-6 py-4 mb-4 border border-gray-400  rounded-full text-black dark:text-white bg-transparent focus:border-primary"
                  autoCapitalize="none"
                  textContentType="name"
                  returnKeyType="next"
                />
              </View>

              <View>
                <Text className="text-black dark:text-white text-sm font-medium mb-1 ml-1">
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
                  className="px-6 py-4 mb-4 border border-gray-400  rounded-full text-black dark:text-white bg-transparent focus:border-primary"
                />
              </View>

              <View>
                <Text className="text-black dark:text-white text-sm font-medium mb-1 ml-1">
                  Password
                </Text>
                <Input
                  placeholder="Create a password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  textContentType="newPassword"
                  autoComplete="off"
                  returnKeyType="next"
                  className="px-6 py-4 mb-4 border border-gray-400  rounded-full text-black dark:text-white bg-transparent focus:border-primary"
                />
              </View>

              <View>
                <Text className="text-black dark:text-white text-sm font-medium mb-1 ml-1">
                  Confirm Password
                </Text>
                <Input
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  textContentType="newPassword"
                  autoComplete="off"
                  returnKeyType="done"
                  onSubmitEditing={handleSignup}
                  className="px-6 py-4 mb-2 border border-gray-400  rounded-full text-black dark:text-white bg-transparent focus:border-primary"
                />
              </View>
            </View>

            {/* Keep Signed In Checkbox */}
            <TouchableOpacity
              onPress={() => setKeepSignedIn(!keepSignedIn)}
              className="flex-row items-center my-2 mb-3"
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

            {/* Sign Up Button */}
            <TouchableOpacity
              onPress={handleSignup}
              className="bg-primary py-4 px-6 rounded-full items-center "
              activeOpacity={0.9}
              style={
                {
                  shadowColor: "#FF6200",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 4,
                } as const
              }
            >
              <Text className="text-white text-base font-bold">
                Create Account
              </Text>
            </TouchableOpacity>

            {/* Sign In Link - Only show when keyboard is not visible */}
            {!keyboardVisible && (
              <TouchableOpacity
                onPress={() => router.push("/login")}
                className="py-4"
                activeOpacity={0.7}
              >
                <Text className="text-center text-black dark:text-white text-base">
                  Already have an account?{" "}
                  <Text className="text-[#FF6200] font-semibold">Sign In</Text>
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default Signup;
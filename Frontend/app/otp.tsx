import React, { useState, useRef, useEffect } from "react";
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
import { ChevronLeft, Lock, Mail } from "lucide-react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Constants from "expo-constants";
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

const isWeb = Platform.OS === "web";

const OTPVerification: React.FC = () => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [countdown, setCountdown] = useState(30);
  const inputs = useRef<Array<TextInput | null>>([]);
  const router = useRouter();

  // Keyboard animation
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

  // Resend OTP countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0 && resendDisabled) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setResendDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [countdown, resendDisabled]);

  const animatedFormStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: formOffset.value }],
  }));

  const handleOtpChange = (text: string, index: number) => {
    // Allow only single digit
    if (/^\d?$/.test(text)) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);

      // Auto focus next input
      if (text && index < 5 && inputs.current[index + 1]) {
        inputs.current[index + 1]?.focus();
      }
      
      // Auto submit when last digit is entered
      if (text && index === 5) {
        handleSubmit();
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    setResendDisabled(true);
    setCountdown(30);
    // Add resend logic here
    router.push("/changepassword"); // Example redirect after resend
  };

  const handleSubmit = () => {
    setLoading(true);
    const code = otp.join("");
    
    // Validation
    if (code.length !== 6) {
      setError("Please enter a 6-digit code");
      setLoading(false);
      return;
    }
    
    // Submit logic here
    setTimeout(() => {
      setLoading(false);
      router.push("/changepassword"); // Redirect after successful verification
    }, 1500);
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
              Verify OTP
            </Animated.Text>

            <Animated.Text
              entering={FadeInDown.delay(200)}
              className="text-gray-600 dark:text-gray-400 text-center text-base mb-8 px-4"
            >
              Enter the 6-digit code sent to your email
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

            {/* OTP Input Boxes */}
            <Animated.View 
              entering={FadeInDown.delay(300)}
              className="flex-row justify-between mb-8"
            >
              {Array(6)
                .fill(0)
                .map((_, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (inputs.current[index] = ref)}
                    style={styles.otpInput}
                    className="text-black text-2xl font-bold text-center"
                    value={otp[index]}
                    onChangeText={(text) => handleOtpChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    autoFocus={index === 0}
                  />
                ))}
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
                    Verify Code
                  </Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Resend Code */}
            <Animated.View
              entering={FadeInDown.delay(500)}
              className="pt-6 flex-row justify-center"
            >
              <Text className="text-gray-600 dark:text-gray-400 mr-1">
                Didn't receive code?
              </Text>
              <TouchableOpacity
                onPress={handleResend}
                disabled={resendDisabled}
              >
                <Text 
                  className={`font-medium ${
                    resendDisabled 
                      ? "text-gray-400" 
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  Resend {resendDisabled && `(${countdown}s)`}
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
  otpInput: {
    width: 50,
    height: 60,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    backgroundColor: "#F9FAFB",
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

export default OTPVerification;
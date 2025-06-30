import React from "react";
import { ScrollView, Text, View, TouchableOpacity, StatusBar, useColorScheme } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function PrivacyPolicyScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();

  return (
    <View className={`flex-1 ${isDark ? "bg-gray-900" : "bg-emerald-50"}`}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View className={`pt-16 pb-4 px-5 flex-row items-center justify-between ${isDark ? "bg-emerald-700" : "bg-emerald-500"}`}>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="p-2 rounded-full"
        >
          <ArrowLeft size={24} color={isDark ? "#fff" : "#fff"} />
        </TouchableOpacity>
        <Text className={`text-xl font-bold ${isDark ? "text-white" : "text-white"}`}>
          Privacy Policy
        </Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1 px-5 pt-6 pb-10" showsVerticalScrollIndicator={false}>
        <View className={`rounded-2xl p-6 mb-8 ${isDark ? "bg-gray-800" : "bg-white"}`} style={styles.cardShadow}>
          <Text className={`text-2xl font-bold mb-1 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
            Privacy Policy — Healthy Eats
          </Text>
          <Text className={`text-sm mb-6 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Effective Date: June 30, 2025{"\n"}
            Operated by: Team Codex
          </Text>

          <Text className={`text-base mb-6 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            Healthy Eats ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, share, and safeguard your information when you use the Healthy Eats mobile application and related services (collectively, the "App").
          </Text>
          
          <Text className={`text-base mb-6 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            By using our App, you agree to the terms outlined in this Privacy Policy. If you do not agree, please do not use Healthy Eats.
          </Text>

          <Text className={`text-xl font-bold mt-8 mb-4 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
            1. Information We Collect
          </Text>
          <Text className={`text-base mb-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            We collect the following types of information to provide and improve our services:
          </Text>
          
          <View className="mb-4">
            <Text className={`font-semibold mb-2 ${isDark ? "text-gray-200" : "text-gray-800"}`}>
              a. Personal Information
            </Text>
            <View className="ml-4">
              <Text className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>• Name</Text>
              <Text className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>• Email address</Text>
              <Text className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>• Age and gender (if provided)</Text>
              <Text className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>• Preferred language (e.g., Bangla or English)</Text>
            </View>
          </View>
          
          <View className="mb-4">
            <Text className={`font-semibold mb-2 ${isDark ? "text-gray-200" : "text-gray-800"}`}>
              b. Health & Fitness Information
            </Text>
            <View className="ml-4">
              <Text className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>• Dietary preferences (e.g., vegetarian, diabetic-friendly)</Text>
              <Text className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>• Fitness goals (e.g., weight loss, muscle gain)</Text>
              <Text className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>• Activity levels and routines</Text>
            </View>
          </View>
          
          <View className="mb-4">
            <Text className={`font-semibold mb-2 ${isDark ? "text-gray-200" : "text-gray-800"}`}>
              c. Budget & Grocery Information
            </Text>
            <View className="ml-4">
              <Text className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>• Monthly food budget</Text>
              <Text className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>• Preferred grocery items</Text>
              <Text className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>• Local product availability (may use location if permission is granted)</Text>
            </View>
          </View>
          
          <View className="mb-6">
            <Text className={`font-semibold mb-2 ${isDark ? "text-gray-200" : "text-gray-800"}`}>
              d. Usage Data
            </Text>
            <View className="ml-4">
              <Text className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>• Features and pages you interact with</Text>
              <Text className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>• Time spent on the app</Text>
              <Text className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>• Device type and operating system</Text>
            </View>
          </View>

          <Text className={`text-xl font-bold mt-8 mb-4 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
            2. How We Use Your Information
          </Text>
          <Text className={`text-base mb-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            We use your information to:
          </Text>
          <View className="ml-4 mb-6">
            <Text className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>• Personalize your meal and workout recommendations</Text>
            <Text className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>• Provide culturally relevant, budget-friendly grocery suggestions</Text>
            <Text className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>• Track and report your health and spending progress</Text>
            <Text className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>• Analyze usage to improve the App experience</Text>
            <Text className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>• Offer customer support and respond to user inquiries</Text>
            <Text className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>• Send updates, tips, or notifications (if you opt in)</Text>
          </View>

          <Text className={`text-xl font-bold mt-8 mb-4 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
            3. Sharing Your Information
          </Text>
          <Text className={`text-base mb-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            We do not sell your personal data.
          </Text>
          <Text className={`text-base mb-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            We may share data in the following cases:
          </Text>
          <View className="ml-4 mb-6">
            <Text className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>• With trusted service providers (e.g., hosting, analytics) for app operation only</Text>
            <Text className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>• To comply with laws or respond to legal requests</Text>
            <Text className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>• In anonymous or aggregated form, for research, analysis, or app development</Text>
          </View>

          <Text className={`text-xl font-bold mt-8 mb-4 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
            4. Your Rights and Choices
          </Text>
          <Text className={`text-base mb-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            You have full control over your data. You may:
          </Text>
          <View className="ml-4 mb-6">
            <Text className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>• Update or correct your personal profile</Text>
            <Text className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>• Request a copy of your stored data</Text>
            <Text className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>• Delete your account and associated information</Text>
            <Text className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>• Opt out of communications or notifications at any time</Text>
          </View>
          <Text className={`text-base mb-6 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            To exercise any of these rights, contact us at 📧 teamcodex25@gmail.com
          </Text>

          <Text className={`text-xl font-bold mt-8 mb-4 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
            5. How We Protect Your Information
          </Text>
          <Text className={`text-base mb-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            We implement industry-standard security measures to safeguard your data:
          </Text>
          <View className="ml-4 mb-4">
            <Text className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>• Encrypted communication (HTTPS)</Text>
            <Text className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>• Secure data storage and backups</Text>
            <Text className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>• Regular monitoring and system audits</Text>
          </View>
          <Text className={`text-base mb-6 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            Please note: While we strive to protect your information, no system is entirely secure. Use the app at your discretion.
          </Text>

          <Text className={`text-xl font-bold mt-8 mb-4 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
            6. Data Retention
          </Text>
          <Text className={`text-base mb-6 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            We retain your data:{"\n"}
            • As long as your account is active{"\n"}
            • Or as necessary for the purposes listed above{"\n\n"}
            You may request account and data deletion at any time.
          </Text>

          <Text className={`text-xl font-bold mt-8 mb-4 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
            7. Children's Privacy
          </Text>
          <Text className={`text-base mb-6 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            Healthy Eats is intended for users aged 13 and above. We do not knowingly collect personal information from children under 13. If we become aware of such data, it will be deleted promptly.
          </Text>

          <Text className={`text-xl font-bold mt-8 mb-4 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
            8. Changes to This Privacy Policy
          </Text>
          <Text className={`text-base mb-6 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            We may revise this Privacy Policy from time to time. When major changes occur, we will notify users through the app or by email. Continued use of the app means you agree to the updated policy.
          </Text>

          <Text className={`text-xl font-bold mt-8 mb-4 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
            9. Contact Us
          </Text>
          <Text className={`text-base mb-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            Have questions or concerns about your privacy? We're here to help.
          </Text>
          <View className="ml-4">
            <Text className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>📧 Email: teamcodex25@gmail.com</Text>
            <Text className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>📍 Address: United City, Madani Ave, Dhaka 1212</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = {
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
};
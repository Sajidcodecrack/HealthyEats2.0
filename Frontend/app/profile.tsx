import React from "react";
import {
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  useColorScheme,
  StyleSheet,
  StatusBar,
  Alert
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Settings, Lock, Heart, Target, LogOut,ArrowLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import { deleteToken } from "../lib/tokenManager"; // Import deleteToken


export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const navigation = useNavigation();

  const profileImage = require("../assets/images/profile.jpeg");

  const router = useRouter(); // Initialize router
  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          onPress: async () => {
            try {
              // Clear authentication token

              await deleteToken(); // Clear onboarding completion flag

              await AsyncStorage.removeItem("hasCompletedOnboarding"); // Clear user ID (if you store it in AsyncStorage)

              await AsyncStorage.removeItem("userId"); // Redirect to the sign-in/sign-up screen // Ensure this matches the route you want users to land on after logout

              router.replace("/login"); // or '/signup' depending on your flow
            } catch (error) {
              console.error("Error during logout:", error);

              Alert.alert(
                "Logout Failed",
                "An error occurred while logging out. Please try again."
              );
            }
          },

          style: "destructive",
        },
      ],

      { cancelable: true }
    );
  };

  return (
    <View className="flex-1 bg-emerald-50 dark:bg-gray-900">
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View className="relative h-96 bg-emerald-600 dark:bg-emerald-800 rounded-b-3xl items-center justify-center overflow-hidden ">
          {/* Background decorative elements */}
          <View className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500 dark:bg-emerald-700 rounded-full opacity-20" />
          <View className="absolute -bottom-24 -left-20 w-80 h-80 bg-emerald-500 dark:bg-emerald-700 rounded-full opacity-20" />
          
          {/* Top navigation */}
          <View className="absolute top-14 left-4">
            <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[
              styles.backButton,
              { backgroundColor: "rgba(255,255,255,0.2)" },
            ]}
          >
            <ArrowLeft size={24} color="#FFF" />
          </TouchableOpacity>
          </View>
          

          {/* Profile Content */}
          <View className="mt-8 border-4 border-emerald-500 dark:border-emerald-700 rounded-full shadow-lg">
            <Image
              source={profileImage}
              className="w-32 h-32 rounded-full"
            />
          </View>

          <Text className="text-white text-2xl font-bold mt-2">
            Sahil Al Farib
          </Text>
          <Text className="text-emerald-100 text-sm mt-1">
            Wellness Journey • 2 Years
          </Text>
          
          <View className="flex-row mt-2">
            <MaterialCommunityIcons 
              name="medal" 
              size={18} 
              color="#fcd34d" 
            />
            <Text className="text-emerald-100 ml-1">Pro Member</Text>
          </View>
        </View>

        {/* Stats Section */}
        <View className="flex-row justify-around py-5 -mt-12 bg-white dark:bg-gray-800 mx-5 rounded-3xl shadow-lg" style={styles.cardShadow}>
          <View className="items-center">
            <Text className="text-emerald-700 dark:text-emerald-400 text-2xl font-bold">
              120
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-sm mt-1">Workouts</Text>
          </View>
          <View className="items-center">
            <Text className="text-emerald-700 dark:text-emerald-400 text-2xl font-bold">
              8.4k
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-sm mt-1">Calories</Text>
          </View>
          <View className="items-center">
            <Text className="text-emerald-700 dark:text-emerald-400 text-2xl font-bold">
              3.7k
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-sm mt-1">Miles</Text>
          </View>
          <View className="items-center">
            <Text className="text-emerald-700 dark:text-emerald-400 text-2xl font-bold">
              98%
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-sm mt-1">Consistency</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View className="mx-5 mt-6">
          <Text className="text-emerald-800 dark:text-emerald-300 text-lg font-semibold mb-3">My Account</Text>
          
          <ProfileMenuItem
            icon={<Target size={24} color="#059669" />}
            label="My Goals"
            isDark={isDark}
            onPress={() => console.log("My Goals pressed")}
          />
          <ProfileMenuItem
            icon={<Heart size={24} color="#059669" />}
            label="Health Metrics"
            isDark={isDark}
            onPress={() => console.log("Health Metrics pressed")}
          />
          
          <Text className="text-emerald-800 dark:text-emerald-300 text-lg font-semibold mb-3 mt-6">Preferences</Text>
          
          <ProfileMenuItem
            icon={<Settings size={24} color="#059669" />}
            label="Settings"
            isDark={isDark}
            onPress={() => console.log("Settings pressed")}
          />
          <ProfileMenuItem
            icon={<Lock size={24} color="#059669" />}
            label="Privacy Policy"
            isDark={isDark}
            onPress={() => console.log("Privacy Policy pressed")}
          />
          <ProfileMenuItem
            icon={<Feather name="help-circle" size={24} color="#059669" />}
            label="Help & Support"
            isDark={isDark}
            onPress={() => console.log("Help & Support pressed")}
          />
        </View>

        {/* Logout Button */}
        <View className="mx-5 mt-8 mb-10">
          <TouchableOpacity
            className="flex-row items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700"
            style={styles.cardShadow}
            onPress={handleLogout}
          >
            <LogOut size={20} color="#ef4444" />
            <Text className="text-red-500 text-lg font-semibold ml-3">
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
    </View>
  );
}

// Helper component for menu items
interface ProfileMenuItemProps {
  icon: React.ReactNode;
  label: string;
  isDark: boolean;
  onPress: () => void;
}

const ProfileMenuItem: React.FC<ProfileMenuItemProps> = ({
  icon,
  label,
  isDark,
  onPress,
}) => (
  <TouchableOpacity
    className={`flex-row items-center p-4 mb-3 rounded-3xl ${
      isDark ? "bg-gray-800" : "bg-white"
    }`}
    style={styles.cardShadow}
    onPress={onPress}
  >
    <View className="w-10 h-10 rounded-3xl bg-emerald-100 dark:bg-emerald-900/40 items-center justify-center mr-4">
      {icon}
    </View>
    <Text
      className={`flex-1 text-base font-medium ${
        isDark ? "text-gray-200" : "text-gray-700"
      }`}
    >
      {label}
    </Text>
    <Feather name="chevron-right" size={20} color="#9ca3af" />
  </TouchableOpacity>
);

// Styles
const styles = StyleSheet.create({
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
  fab: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  backButton: {
    marginRight: 12,
    padding: 8,
    borderRadius: 20,
  },
});
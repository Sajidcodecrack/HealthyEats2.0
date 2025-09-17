import { useEffect, useState } from "react";
import {
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  useColorScheme,
  StyleSheet,
  StatusBar,
  Alert,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
  Settings,
  Lock,
  Heart,
  Target,
  LogOut,
  ArrowLeft,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import { deleteToken } from "../lib/tokenManager"; // Import deleteToken
import { LinearGradient } from "expo-linear-gradient"; // Import LinearGradient for background
import Constants from "expo-constants"; // Import Constants for API URL

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const navigation = useNavigation();
  const [userData, setUserData] = useState({ name: "", profileImage: "" });

  const API_URL = Constants.expoConfig?.extra?.apiUrl;

  const router = useRouter(); // Initialize router

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) return;

        const res = await fetch(`${API_URL}/api/user/${userId}`);
        const data = await res.json();
        setUserData({
          name: data.name,
          profileImage: data.profileImage
            ? `${API_URL}${data.profileImage}`
            : null,
        });
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

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
  const getInitials = (name) => {
    if (!name) return "U";
    const names = name.split(" ");
    return names
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  return (
    <View className="flex-1 bg-emerald-50 dark:bg-gray-900">
      <View className="absolute top-16 left-5 z-10">
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
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View className="relative h-96 bg-transparent rounded-b-3xl items-center justify-center overflow-hidden ">
          {/* Background decorative elements */}
          <LinearGradient
            colors={["#065f46", "#059669"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              alignItems: "center",
              justifyContent: "center",
              height: 300,
              width: "100%",
              borderBottomLeftRadius: 24,
              borderBottomRightRadius: 24,
              marginTop: -80,
              paddingTop: 24,
            }}
          >
            <View className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500  rounded-full opacity-20" />
            <View className="absolute -bottom-24 -left-20 w-80 h-80 bg-emerald-500 rounded-full opacity-20" />

            {/* Top navigation */}

            {/* Profile Content */}
            <View className="mt-8 border-4 border-emerald-500 dark:border-emerald-700 rounded-full shadow-lg">
              {userData.profileImage ? (
                <Image
                  source={{ uri: userData.profileImage }}
                  className="w-32 h-32 rounded-full"
                />
              ) : (
                <View className="w-32 h-32 rounded-full bg-emerald-500 items-center justify-center">
                  <Text className="text-white text-4xl font-bold">
                    {getInitials(userData?.name)}
                  </Text>
                </View>
              )}
            </View>

            <Text className="text-white text-2xl font-bold mt-2">
              {userData.name || "Loading..."}
            </Text>
            <Text className="text-emerald-100 text-sm mt-1">
              Wellness Journey • 2 Years
            </Text>
          </LinearGradient>
        </View>

        {/* Menu Items */}
        <View className="mx-5 -mt-10">
          <Text className="text-emerald-800 dark:text-emerald-300 text-lg font-semibold mb-6">
            My Account
          </Text>

          <ProfileMenuItem
            icon={<Target size={24} color="#059669" />}
            label="Personal Details"
            isDark={isDark}
            onPress={() => router.push("/personal-details")} // Add this navigation
          />
          <ProfileMenuItem
            icon={<Heart size={24} color="#059669" />}
            label="Health Metrics"
            isDark={isDark}
            onPress={() => Alert.alert("Coming Soon", "Feature coming soon")}
          />

          <Text className="text-emerald-800 dark:text-emerald-300 text-lg font-semibold mb-6 mt-6">
            Preferences
          </Text>

          <ProfileMenuItem
            icon={<Settings size={24} color="#059669" />}
            label="Settings"
            isDark={isDark}
            onPress={() => Alert.alert("Coming Soon", "Feature coming soon")}
          />
          <ProfileMenuItem
            icon={<Lock size={24} color="#059669" />}
            label="Privacy Policy"
            isDark={isDark}
            onPress={() => router.push("/privacy-policy")} // Update this line
          />
        </View>

        {/* Logout Button */}
        <View className="mx-5 mt-1 mb-10">
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

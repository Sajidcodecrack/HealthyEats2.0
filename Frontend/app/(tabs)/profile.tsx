import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage

import { deleteToken } from "../../lib/tokenManager"; // Import deleteToken
import { useRouter } from "expo-router"; // Import useRouter
export default function Profile() {
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
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-lg font-semibold">Profile Tab</Text>
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    justifyContent: "center",

    alignItems: "center",

    backgroundColor: "#F9FAFB", // A light background for the home screen
  },

  welcomeText: {
    fontSize: 24,

    fontWeight: "bold",

    marginBottom: 40, // Space below the welcome text

    color: "#1F2937",
  },

  logoutButton: {
    backgroundColor: "#EF4444", // A red color for logout

    paddingVertical: 12,

    paddingHorizontal: 25,

    borderRadius: 10,

    marginTop: 20, // Space above the button

    shadowColor: "#000",

    shadowOffset: { width: 0, height: 2 },

    shadowOpacity: 0.2,

    shadowRadius: 3,

    elevation: 5, // For Android shadow
  },

  logoutButtonText: {
    color: "#FFFFFF",

    fontSize: 18,

    fontWeight: "600",
  },
});

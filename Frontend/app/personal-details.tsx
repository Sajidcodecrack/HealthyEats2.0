// screens/PersonalDetailsScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
  useColorScheme,
  Platform, // Import Platform for OS-specific styling
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getToken } from "../lib/tokenManager";
import Constants from "expo-constants";

export default function PersonalDetailsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  // Removed `userData` state as it duplicates `formData.name` and `profileImage` from other states
  // const [userData, setUserData] = useState({ name: "", profileImage: "" }); // This state is not necessary here

  const API_URL = Constants.expoConfig?.extra?.apiUrl;

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    heightFeet: "",
    heightInches: "",
    weight: "",
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const navigation = useNavigation();
  // Function to get user initials for avatar
  const getInitials = (name: string) => {
    if (!name) return "U";
    const names = name.split(" ");
    return names
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await getToken();
        const storedUserId = await AsyncStorage.getItem("userId");
        setUserId(storedUserId);

        if (!token || !storedUserId) {
          navigation.navigate("login"); // Navigate to login if not authenticated
          return;
        }

        // Fetch user data
        const userResponse = await fetch(
          `${API_URL}/api/user/${storedUserId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!userResponse.ok) {
          if (userResponse.status === 401) {
            Alert.alert("Session Expired", "Please log in again.");
            navigation.navigate("login");
            return;
          }
          throw new Error("Failed to fetch user data");
        }
        const data = await userResponse.json();
        // setUserData(data); // This line is not needed as `data.name` and `data.profileImage` are directly used

        // Fetch user profile data
        const profileResponse = await fetch(
          `${API_URL}/api/user-profile/${storedUserId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        let profileData = {};
        if (profileResponse.ok) {
          profileData = await profileResponse.json();
        }

        // Set form data
        setFormData({
          name: data.name || "",
          age: profileData.age ? String(profileData.age) : "",
          gender: profileData.gender || "",
          heightFeet: profileData.heightFeet
            ? String(profileData.heightFeet)
            : "",
          heightInches: profileData.heightInches
            ? String(profileData.heightInches)
            : "",
          weight: profileData.weight ? String(profileData.weight) : "",
        });

        // Fix: Prepend API_URL to the profileImage path if it's a relative path
        if (data.profileImage && !data.profileImage.startsWith("http")) {
          setProfileImage(`${API_URL}${data.profileImage}`);
        } else {
          setProfileImage(data.profileImage);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        Alert.alert(
          "Error",
          "Could not load user profile. Please try again later."
        );
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const pickImage = async () => {
    // Request media library permissions on iOS
    if (Platform.OS === "ios") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Please grant media library access to upload a profile picture."
        );
        return;
      }
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      // Set the local URI immediately for visual feedback
      setProfileImage(result.assets[0].uri);
      // Upload the image and update state with the server path
      await uploadProfileImage(result.assets[0].uri);
    }
  };

  const uploadProfileImage = async (uri: string) => {
    try {
      const token = await getToken();
      if (!token || !userId) {
        Alert.alert(
          "Authentication Error",
          "Please log in to upload your image."
        );
        return;
      }

      // Create form data
      const formData = new FormData();
      formData.append("profile", {
        uri,
        type: "image/jpeg",
        name: "profile.jpg",
      } as any);

      const response = await fetch(
        `${API_URL}/api/user/upload-profile/${userId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload profile image");
      }

      const result = await response.json();
      // Fix: Prepend API_URL to the new image path returned by the server
      if (result.imagePath && !result.imagePath.startsWith("http")) {
        setProfileImage(`${API_URL}${result.imagePath}`);
      } else {
        setProfileImage(result.imagePath);
      }
      Alert.alert("Success", "Profile image updated!");
    } catch (error) {
      console.error("Image upload error:", error);
      Alert.alert("Error", "Could not upload profile image. Please try again.");
      // If upload fails, revert to the previous image or a default
      // Consider adding a mechanism to revert `profileImage` state here if upload fails
    }
  };

  const handleSubmit = async () => {
    setUpdating(true);
    try {
      const token = await getToken();
      if (!token || !userId) {
        Alert.alert(
          "Authentication Error",
          "Please log in to update your profile."
        );
        navigation.navigate("login");
        return;
      }

      // Basic validation
      if (
        !formData.age ||
        !formData.gender ||
        !formData.heightFeet ||
        !formData.heightInches ||
        !formData.weight
      ) {
        Alert.alert(
          "Missing Information",
          "Please fill in all personal details."
        );
        setUpdating(false);
        return;
      }

      // Prepare data for API
      const payload = {
        age: parseInt(formData.age),
        gender: formData.gender,
        heightFeet: parseInt(formData.heightFeet),
        heightInches: parseInt(formData.heightInches),
        weight: parseFloat(formData.weight),
      };

      // Determine whether to update or create a profile
      const profileResponse = await fetch(
        `${API_URL}/api/user-profile/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      let response;
      if (profileResponse.ok) {
        // Update existing profile
        response = await fetch(`${API_URL}/api/user-profile/${userId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new profile
        response = await fetch(`${API_URL}/api/user-profile`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...payload, userId }),
        });
      }

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      Alert.alert("Success", "Profile updated successfully!");
      navigation.goBack(); // Go back after successful update
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert(
        "Error",
        "Could not update profile. Please check your input and try again."
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View
        className={`flex-1 justify-center items-center ${
          isDark ? "bg-gray-950" : "bg-emerald-50"
        }`}
      >
        <ActivityIndicator size="large" color="#059669" />
        <Text
          className={`mt-4 text-lg ${
            isDark ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Loading your details...
        </Text>
      </View>
    );
  }

  return (
    <View>
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
      <ScrollView
        className={`rounded-2xl p-6 pt-20 h-screen ${
          isDark ? "bg-gray-900" : "bg-white"
        }`}
        style={styles.cardShadow}
      >
        {/* Profile Picture Section */}
        <View className="items-center mb-8">
          <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }} // Use the state variable directly
                className="w-32 h-32 rounded-full border-4 border-emerald-500"
                accessibilityLabel="Profile picture"
              />
            ) : (
              <View className="w-32 h-32 rounded-full bg-emerald-600 items-center justify-center border-4 border-emerald-400">
                <Text className="text-white text-5xl font-bold">
                  {getInitials(formData.name)}
                </Text>
              </View>
            )}
            <View className="absolute bottom-0 right-0 bg-emerald-500 rounded-full p-2 border-2 border-white">
              <Feather name="camera" size={20} color="white" />
            </View>
          </TouchableOpacity>
          <Text className="text-emerald-600 mt-3 font-semibold text-base">
            Tap to change photo
          </Text>
        </View>

        {/* Form Fields */}
        {/* Name - Display only, not editable */}
        <View className="mb-5">
          <Text
            className={`text-sm font-medium mb-2 ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Full Name
          </Text>
          <View
            className={`p-4 pl-6 rounded-full border ${
              isDark
                ? "bg-gray-700 border-gray-600"
                : "bg-emerald-50 border-emerald-100"
            }`}
          >
            <Text
              className={`text-lg font-semibold ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              {formData.name}
            </Text>
          </View>
        </View>

        {/* Age */}
        <View className="mb-5">
          <Text
            className={`text-sm font-medium mb-2 ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Age
          </Text>
          <TextInput
            value={formData.age}
            onChangeText={(text) =>
              handleChange("age", text.replace(/[^0-9]/g, ""))
            } // Allow only numbers
            keyboardType="numeric"
            className={`p-4 rounded-full border ${
              isDark
                ? "bg-gray-700 text-white border-gray-600"
                : "bg-emerald-50 text-gray-800 border-emerald-100"
            }`}
            placeholder="e.g., 30"
            placeholderTextColor={isDark ? "#94a3b8" : "#9ca3af"}
            maxLength={3} // Max age 999
          />
        </View>

        {/* Height */}
        <View className="mb-5">
          <Text
            className={`text-sm font-medium mb-2 ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Height
          </Text>
          <View className="flex-row space-x-3 gap-4">
            <View className="flex-1">
              <TextInput
                value={formData.heightFeet}
                onChangeText={(text) =>
                  handleChange("heightFeet", text.replace(/[^0-9]/g, ""))
                }
                keyboardType="numeric"
                className={`p-4 rounded-full border ${
                  isDark
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-emerald-50 text-gray-800 border-emerald-100"
                }`}
                placeholder="Feet"
                placeholderTextColor={isDark ? "#94a3b8" : "#9ca3af"}
                maxLength={2} // Max feet 99
              />
              <Text
                className={`text-xs mt-1 text-center ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                (Feet)
              </Text>
            </View>

            <View className="flex-1">
              <TextInput
                value={formData.heightInches}
                onChangeText={(text) =>
                  handleChange("heightInches", text.replace(/[^0-9]/g, ""))
                }
                keyboardType="numeric"
                className={`p-4 rounded-full border ${
                  isDark
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-emerald-50 text-gray-800 border-emerald-100"
                }`}
                placeholder="Inches"
                placeholderTextColor={isDark ? "#94a3b8" : "#9ca3af"}
                maxLength={2} // Max inches 11
              />
              <Text
                className={`text-xs mt-1 text-center ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                (Inches)
              </Text>
            </View>
          </View>
        </View>

        {/* Weight */}
        <View className="mb-8">
          <Text
            className={`text-sm font-medium mb-2 ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Weight (kg)
          </Text>
          <TextInput
            value={formData.weight}
            onChangeText={(text) =>
              handleChange("weight", text.replace(/[^0-9.]/g, ""))
            } // Allow numbers and one decimal
            keyboardType="numeric"
            className={`p-4 rounded-full border ${
              isDark
                ? "bg-gray-700 text-white border-gray-600"
                : "bg-emerald-50 text-gray-800 border-emerald-100"
            }`}
            placeholder="e.g., 70.5"
            placeholderTextColor={isDark ? "#94a3b8" : "#9ca3af"}
          />
        </View>

        {/* Update Button */}
        <TouchableOpacity
          className={`py-4 rounded-full items-center justify-center ${
            updating ? "bg-emerald-600 opacity-70" : "bg-emerald-500"
          }`}
          onPress={handleSubmit}
          disabled={updating}
          activeOpacity={0.7}
        >
          {updating ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text className="text-white font-bold text-lg">Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4, // Increased shadow for more depth
    },
    shadowOpacity: 0.1, // Softer shadow
    shadowRadius: 8, // Larger blur radius
    elevation: 6, // Android elevation
  },
  backButton: {
    marginRight: 12,
    padding: 8,
    borderRadius: 20,
  },
});

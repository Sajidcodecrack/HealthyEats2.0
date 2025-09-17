import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
  Image,
  Dimensions,
  Appearance,
  useColorScheme,
} from "react-native";
import { WebView } from "react-native-webview";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { getToken } from "~/lib/tokenManager";
const { width } = Dimensions.get("window");
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft } from "lucide-react-native";

export default function FitnessPlan() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const API_URL = Constants.expoConfig?.extra?.apiUrl;
  const [isPlanSaved, setIsPlanSaved] = useState(false);
  // Theme colors
  const theme = {
    background: isDarkMode ? "bg-gray-900" : "bg-white",
    foreground: isDarkMode ? "text-gray-100" : "text-gray-900",
    card: isDarkMode ? "bg-gray-800" : "bg-gray-50",
    cardForeground: isDarkMode ? "text-gray-100" : "text-gray-800",
    primary: "bg-emerald-400",
    primaryForeground: "text-white",
    secondary: isDarkMode ? "bg-gray-700" : "bg-gray-100",
    secondaryForeground: isDarkMode ? "text-gray-100" : "text-gray-800",
    border: isDarkMode ? "border-gray-700" : "border-gray-200",
    input: isDarkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900",
  };

  const [formData, setFormData] = useState({
    fitnessGoal: "muscle_gain",
    experienceLevel: "intermediate",
    equipment: ["dumbbells", "bench"],
    healthConditions: "none",
  });
  const navigation = useNavigation();
  const [fitnessPlan, setFitnessPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
          Alert.alert("Error", "User not authenticated");
          setProfileLoading(false);
          return;
        }

        // Fetch user profile
        const profileResponse = await fetch(
          `${API_URL}/api/user-profile/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!profileResponse.ok) throw new Error("Failed to fetch user profile");
        const profileData = await profileResponse.json();
        setUserProfile(profileData);

        // Fetch existing fitness plan
        const planResponse = await fetch(
          `${API_URL}/api/fitness-plans/user/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (planResponse.ok) {
          const planData = await planResponse.json();
          if (planData.plan) {
            setFitnessPlan(planData.plan);
            setIsPlanSaved(true);
            
            // Sync form data with saved plan
            setFormData({
              fitnessGoal: planData.fitnessGoal || "muscle_gain",
              experienceLevel: planData.experienceLevel || "intermediate",
              equipment: planData.equipment || ["dumbbells", "bench"],
              healthConditions: planData.healthConditions || "none",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        Alert.alert("Error", "Failed to load data");
      } finally {
        setProfileLoading(false);
      }
    };

    fetchData();
  }, []);
   const saveFitnessPlan = async (plan) => {
    try {
      const token = await getToken();
      const userId = await AsyncStorage.getItem("userId");
      
      const response = await fetch(`${API_URL}/api/fitness-plans`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          plan,
          fitnessGoal: formData.fitnessGoal,
          experienceLevel: formData.experienceLevel,
          equipment: formData.equipment,
          healthConditions: formData.healthConditions,
          age: userProfile.age,
          gender: userProfile.gender
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save fitness plan");
      }

      setIsPlanSaved(true);
      Alert.alert("Success", "Fitness plan saved!");
    } catch (error) {
      console.error("Error saving fitness plan:", error);
      Alert.alert("Error", "Failed to save fitness plan");
    }
  };

  // Fetch user profile from backend
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = await getToken();
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
          Alert.alert("Error", "User not authenticated");
          setProfileLoading(false);
          return;
        }

        const response = await fetch(
          `${API_URL}/api/user-profile/${userId}`,
           { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const data = await response.json();
        setUserProfile(data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        Alert.alert("Error", "Failed to load user profile");
      } finally {
        setProfileLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const toggleEquipment = (item) => {
    setFormData((prev) => {
      if (item === "none") {
        return { ...prev, equipment: ["none"] };
      }

      const newEquipment = prev.equipment.includes(item)
        ? prev.equipment.filter((e) => e !== item)
        : [...prev.equipment.filter((e) => e !== "none"), item];

      return {
        ...prev,
        equipment: newEquipment.length > 0 ? newEquipment : ["none"],
      };
    });
  };

  const handleSubmit = async () => {
    if (!userProfile) {
      Alert.alert("Profile Missing", "User profile not loaded yet");
      return;
    }

    if (!userProfile.age || isNaN(userProfile.age)) {
      Alert.alert("Invalid Profile", "Please set a valid age in your profile");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        age: userProfile.age,
        gender: userProfile.gender,
        fitness_goal: formData.fitnessGoal,
        experience_level: formData.experienceLevel,
        available_equipment: formData.equipment.join(", "),
        health_conditions: formData.healthConditions,
      };

      const response = await fetch("https://fitnessplan.onrender.com/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setFitnessPlan(data.plan);
      saveFitnessPlan(data.plan);
    } catch (error) {
      Alert.alert("Error", "Failed to generate fitness plan");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderPlan = () => {
    if (!fitnessPlan) return null;

    return (
      <ScrollView className="mt-5">
        {fitnessPlan.map((dayPlan) => (
          <View
            key={dayPlan.day}
            className={`mb-6 rounded-xl p-5 ${theme.card} shadow-md`}
          >
            <Text
              className={`text-xl font-bold mb-4 ${theme.foreground} pb-3 border-b ${theme.border}`}
            >
              {dayPlan.day}
            </Text>

            {dayPlan.exercises.length > 0 ? (
              <View className="mt-3">
                {dayPlan.exercises.map((exercise, index) => (
                  <TouchableOpacity
                    key={index}
                    className={`mb-5 rounded-xl overflow-hidden ${theme.card} shadow-sm`}
                    onPress={() => {
                      setSelectedExercise(exercise);
                      setModalVisible(true);
                    }}
                  >
                    {exercise.image_url && (
                      <Image
                        source={{ uri: exercise.image_url }}
                        className="w-full h-48 bg-gray-200"
                        resizeMode="cover"
                      />
                    )}

                    <View className="p-4">
                      <Text
                        className={`text-lg font-bold mb-2 ${theme.foreground}`}
                      >
                        {exercise.name}
                      </Text>
                      <Text
                        className={`text-base ${theme.foreground} opacity-90 mb-1`}
                      >
                        <Text className="font-semibold">Target:</Text>{" "}
                        {exercise.target_muscle}
                      </Text>
                      <Text
                        className={`text-base ${theme.foreground} opacity-90 mb-1`}
                      >
                        <Text className="font-semibold">Sets:</Text>{" "}
                        {exercise.reps}
                      </Text>
                      <Text
                        className={`text-base ${theme.foreground} opacity-90 mb-1`}
                      >
                        <Text className="font-semibold">Type:</Text>{" "}
                        {exercise.type}
                      </Text>
                      <Text
                        className={`text-base ${theme.foreground} opacity-90`}
                      >
                        <Text className="font-semibold">Difficulty:</Text>{" "}
                        {exercise.difficulty}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text
                className={`text-center py-6 italic ${theme.foreground} opacity-70`}
              >
                Rest Day
              </Text>
            )}
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderVideoModal = () => {
    if (!selectedExercise) return null;

    const getYouTubeId = (url) => {
      const regExp =
        /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return match && match[2].length === 11 ? match[2] : null;
    };

    const videoId = getYouTubeId(selectedExercise.video_url);
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&controls=1&showinfo=0&rel=0`;

    return (
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <LinearGradient
          colors={["#065f46", "#059669"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            alignItems: "center",
            justifyContent: "center",
            height: 120,
            paddingTop: 32,
          }}
        >
          <Text className={`text-2xl font-bold text-white`}>
            {selectedExercise.name}
          </Text>
        </LinearGradient>
        <View className={`flex-1 ${theme.background}`}>
          <View className="aspect-video w-full">
            <WebView
              source={{ uri: embedUrl }}
              className="flex-1"
              allowsFullscreenVideo={true}
              javaScriptEnabled={true}
              domStorageEnabled={true}
            />
          </View>

          <View className={`p-5 ${theme.card} flex-1`}>
            <Text className={`text-base mb-5 ${theme.foreground} opacity-90`}>
              {selectedExercise.description}
            </Text>

            <View className={`mt-3 pt-3 border-t ${theme.border}`}>
              <Text className={`text-base mb-2 ${theme.foreground} opacity-90`}>
                <Text className="font-semibold">Target Muscle:</Text>{" "}
                {selectedExercise.target_muscle}
              </Text>
              <Text className={`text-base mb-2 ${theme.foreground} opacity-90`}>
                <Text className="font-semibold">Sets:</Text>{" "}
                {selectedExercise.reps}
              </Text>
              <Text className={`text-base mb-2 ${theme.foreground} opacity-90`}>
                <Text className="font-semibold">Type:</Text>{" "}
                {selectedExercise.type}
              </Text>
              <Text className={`text-base mb-2 ${theme.foreground} opacity-90`}>
                <Text className="font-semibold">Difficulty:</Text>{" "}
                {selectedExercise.difficulty}
              </Text>
            </View>

            <TouchableOpacity
              className={`mt-40 rounded-full ${theme.primary} py-4 items-center `}
              onPress={() => setModalVisible(false)}
            >
              <Text className="text-white text-lg font-semibold">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };
  
  {isPlanSaved && fitnessPlan && (
    <Text className={`text-center mb-4 ${theme.primaryForeground} font-semibold`}>
      ✓ Plan saved to your profile
    </Text>
  )}
  return (
    <View className={`flex-1 ${theme.background}`}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View className="absolute top-16 left-6 z-10">
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
        <Text
          className={`text-xl font-bold mb-6 text-center ${theme.foreground}`}
        >
          Create Your Fitness Plan
        </Text>

        {/* Display user profile info */}
        {userProfile && (
          <View className={`mb-5 rounded-xl p-4 ${theme.card} shadow-sm`}>
            <Text className={`text-lg font-semibold mb-3 ${theme.foreground}`}>
              Your Profile
            </Text>
            <View className="flex-row justify-between">
              <View>
                <Text className={`${theme.foreground} opacity-90`}>
                  <Text className="font-semibold">Age:</Text> {userProfile.age}
                </Text>
                <Text className={`mt-1 ${theme.foreground} opacity-90`}>
                  <Text className="font-semibold">Gender:</Text>{" "}
                  {userProfile.gender}
                </Text>
              </View>
              <View>
                <Text className={`${theme.foreground} opacity-90`}>
                  <Text className="font-semibold">Height:</Text>{" "}
                  {userProfile.heightFeet}'{userProfile.heightInches}"
                </Text>
                <Text className={`mt-1 ${theme.foreground} opacity-90`}>
                  <Text className="font-semibold">Weight:</Text>{" "}
                  {userProfile.weight} kg
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Fitness Goal */}
        <View className={`mb-5 rounded-xl p-4 ${theme.card} shadow-sm`}>
          <Text className={`text-base font-semibold mb-2 ${theme.foreground}`}>
            Fitness Goal:
          </Text>
          <View className="flex-row flex-wrap mt-1">
            {[
              { id: "muscle_gain", name: "Muscle Gain" },
              { id: "weight_loss", name: "Weight Loss" },
              { id: "strength", name: "Strength" },
              { id: "endurance", name: "Endurance" },
            ].map((goal) => (
              <TouchableOpacity
                key={goal.id}
                className="flex-row items-center mr-5 mb-3"
                onPress={() =>
                  setFormData({ ...formData, fitnessGoal: goal.id })
                }
              >
                <View
                  className={`w-5 h-5 rounded-full border-2 mr-2 items-center justify-center ${
                    formData.fitnessGoal === goal.id
                      ? "border-emerald-400"
                      : theme.border
                  }`}
                >
                  {formData.fitnessGoal === goal.id && (
                    <View className="w-3 h-3 rounded-full bg-emerald-400" />
                  )}
                </View>
                <Text className={`${theme.foreground}`}>{goal.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Experience Level */}
        <View className={`mb-5 rounded-xl p-4 ${theme.card} shadow-sm`}>
          <Text className={`text-base font-semibold mb-2 ${theme.foreground}`}>
            Experience Level:
          </Text>
          <View className="flex-row flex-wrap mt-1">
            {["beginner", "intermediate", "advanced"].map((level) => (
              <TouchableOpacity
                key={level}
                className="flex-row items-center mr-5 mb-3"
                onPress={() =>
                  setFormData({ ...formData, experienceLevel: level })
                }
              >
                <View
                  className={`w-5 h-5 rounded-full border-2 mr-2 items-center justify-center ${
                    formData.experienceLevel === level
                      ? "border-emerald-400"
                      : theme.border
                  }`}
                >
                  {formData.experienceLevel === level && (
                    <View className="w-3 h-3 rounded-full bg-emerald-400" />
                  )}
                </View>
                <Text className={`${theme.foreground}`}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Equipment Selection */}
        <View className={`mb-5 rounded-xl p-4 ${theme.card} shadow-sm`}>
          <Text className={`text-base font-semibold mb-2 ${theme.foreground}`}>
            Available Equipment:
          </Text>
          <View className="flex-row flex-wrap">
            {[
              "dumbbells",
              "barbell",
              "bench",
              "resistance bands",
              "pull-up bar",
              "kettlebells",
              "none",
            ].map((item) => (
              <TouchableOpacity
                key={item}
                className={`py-2 px-3 rounded-full m-1 ${
                  formData.equipment.includes(item)
                    ? "bg-emerald-400"
                    : theme.secondary
                }`}
                onPress={() => toggleEquipment(item)}
              >
                <Text
                  className={`${
                    formData.equipment.includes(item)
                      ? "text-white"
                      : theme.foreground
                  }`}
                >
                  {item.replace(/_/g, " ")}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Health Conditions */}
        <View className={`mb-5 rounded-xl p-4 ${theme.card} shadow-sm`}>
          <Text className={`text-base font-semibold mb-2 ${theme.foreground}`}>
            Health Conditions:
          </Text>
          <TextInput
            className={`h-24 border rounded-lg px-4 py-3 ${theme.input} ${theme.border}`}
            value={formData.healthConditions}
            onChangeText={(text) =>
              setFormData({ ...formData, healthConditions: text })
            }
            placeholder="Describe any health conditions"
            placeholderTextColor={isDarkMode ? "#9CA3AF" : "#6B7280"}
            multiline
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          className={`rounded-full py-4 items-center ${theme.primary} shadow-md mb-8`}
          onPress={handleSubmit}
          disabled={loading || profileLoading}
        >
          <Text className="text-white text-lg font-semibold">
            {profileLoading
              ? "Loading Profile..."
              : loading
              ? "Generating Plan..."
              : "Generate Fitness Plan"}
          </Text>
        </TouchableOpacity>

        {/* Display Fitness Plan */}
        {fitnessPlan && renderPlan()}
      </ScrollView>

      {/* Video Modal */}
      {renderVideoModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    marginRight: 12,
    padding: 8,
    borderRadius: 20,
  },
});

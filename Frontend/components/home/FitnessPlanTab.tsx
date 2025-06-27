import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { WebView } from "react-native-webview";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { getToken } from "~/lib/tokenManager";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "react-native";

const FitnessPlanTab = ({ isDark, navigation }) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const API_URL = Constants.expoConfig?.extra?.apiUrl;

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

  const [fitnessPlan, setFitnessPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [todayWorkout, setTodayWorkout] = useState(null);

  // Get day of week (0 = Sunday, 1 = Monday, etc.)
  const getCurrentDayOfWeek = () => {
    const today = new Date();
    return today.getDay(); // Returns 0-6
  };

  // Map day index to plan day
  const getTodaysPlan = (plan) => {
    const dayOfWeek = new Date().getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday

    // New mapping with Friday as Day 1:
    // Friday = 5 → Day 1 (index 0)
    // Saturday = 6 → Day 2 (index 1)
    // Sunday = 0 → Day 3 (index 2)
    // Monday = 1 → Day 4 (index 3)
    // Tuesday = 2 → Day 5 (index 4)
    // Wednesday = 3 → Day 6 (index 5)
    // Thursday = 4 → Day 7 (index 6)

    const dayMapping = {
      5: 0, // Friday → Day 1
      6: 1, // Saturday → Day 2
      0: 2, // Sunday → Day 3
      1: 3, // Monday → Day 4
      2: 4, // Tuesday → Day 5
      3: 5, // Wednesday → Day 6
      4: 6, // Thursday → Day 7
    };

    const planIndex = dayMapping[dayOfWeek];

    // Ensure index is within bounds
    if (plan && plan.length > planIndex) {
      return plan[planIndex];
    }
    return null;
  };

  // Update the day name display to show the correct mapping
  const getDayNameWithMapping = (dayOfWeek) => {
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayMapping = {
      5: "Friday ",
      6: "Saturday ",
      0: "Sunday ",
      1: "Monday ",
      2: "Tuesday ",
      3: "Wednesday ",
      4: "Thursday ",
    };

    return dayMapping[dayOfWeek] || dayNames[dayOfWeek];
  };

  // Fetch fitness plan from backend
  useEffect(() => {
    const fetchFitnessPlan = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) return;

        const response = await fetch(
          `${API_URL}/api/fitness-plans/user/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.ok) {
          const data = await response.json();
          setFitnessPlan(data.plan);

          // Get today's workout based on current day
          const todaysPlan = getTodaysPlan(data.plan);
          setTodayWorkout(todaysPlan);
        }
      } catch (error) {
        console.error("Error fetching fitness plan:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFitnessPlan();
  }, []);

  // Recalculate today's workout when day changes
  useEffect(() => {
    if (fitnessPlan) {
      const todaysPlan = getTodaysPlan(fitnessPlan);
      setTodayWorkout(todaysPlan);
    }
  }, [fitnessPlan]);

  const getYouTubeId = (url) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url?.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const renderVideoModal = () => {
    if (!selectedExercise) return null;

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
              className={`mt-40 rounded-lg ${theme.primary} py-4 items-center`}
              onPress={() => setModalVisible(false)}
            >
              <Text className="text-white text-lg font-semibold">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!fitnessPlan) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <MaterialCommunityIcons
          name="dumbbell"
          size={80}
          color="#3B82F6"
          className="mb-6"
        />
        <Text
          className={`text-xl font-bold mb-4 text-center ${theme.foreground}`}
        >
          No Fitness Plan Found
        </Text>
        <Text
          className={`text-lg mb-8 text-center ${theme.foreground} opacity-80`}
        >
          Create a personalized fitness plan to get started with your workout
          journey
        </Text>
        <TouchableOpacity
          className="bg-blue-500 py-4 px-8 rounded-full"
          onPress={() => navigation.navigate("fitnessplan")}
        >
          <Text className="text-white text-lg font-bold">
            Create Fitness Plan
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 mx-5 mt-4">
      <Text className={`text-xl font-bold mb-4 ${theme.foreground}`}>
        Today's Workout ( {getDayNameWithMapping(getCurrentDayOfWeek())})
      </Text>

      {todayWorkout ? (
        <View
          className={`rounded-3xl p-6 mb-6 ${theme.card}`}
          style={styles.card}
        >
          <View className="flex-row items-center mb-4">
            <MaterialCommunityIcons name="dumbbell" size={28} color="#3B82F6" />
            <Text className={`text-xl font-bold ml-3 ${theme.foreground}`}>
              {todayWorkout.day}
            </Text>
          </View>

          {todayWorkout.exercises.length > 0 ? (
            <ScrollView className="max-h-96">
              {todayWorkout.exercises.map((exercise, index) => (
                <TouchableOpacity
                  key={index}
                  className={`mb-4 p-4 rounded-xl ${theme.secondary}`}
                  onPress={() => {
                    setSelectedExercise(exercise);
                    setModalVisible(true);
                  }}
                >
                  <View className="flex-row items-center">
                    {exercise.image_url && (
                      <Image
                        source={{ uri: exercise.image_url }}
                        className="w-16 h-16 rounded-lg mr-4"
                        resizeMode="cover"
                      />
                    )}
                    <View className="flex-1">
                      <Text className={`font-bold text-lg ${theme.foreground}`}>
                        {exercise.name}
                      </Text>
                      <Text className={`${theme.foreground} opacity-80`}>
                        {exercise.target_muscle} • {exercise.reps}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Text className={`text-center py-6 ${theme.foreground} opacity-80`}>
              Rest Day - No exercises scheduled
            </Text>
          )}

          <TouchableOpacity
            className="mt-6 bg-blue-500 py-3 rounded-full items-center"
            onPress={() => navigation.navigate("fitnessplan")}
          >
            <Text className="text-white font-bold">Generate new Plan</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text className={`text-center py-6 ${theme.foreground} opacity-80`}>
          No workout scheduled for today
        </Text>
      )}

      <Text className={`text-xl font-bold mb-4 ${theme.foreground}`}>
        Weekly Fitness Plan
      </Text>

      <ScrollView className="mb-20">
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

      {renderVideoModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
});

export default FitnessPlanTab;

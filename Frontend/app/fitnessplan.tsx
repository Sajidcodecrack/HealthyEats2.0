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

const { width } = Dimensions.get("window");

export default function FitnessPlan() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  
  // Theme colors
  const theme = {
    background: isDarkMode ? 'bg-gray-900' : 'bg-white',
    foreground: isDarkMode ? 'text-gray-100' : 'text-gray-900',
    card: isDarkMode ? 'bg-gray-800' : 'bg-gray-50',
    cardForeground: isDarkMode ? 'text-gray-100' : 'text-gray-800',
    primary: 'bg-emerald-400',
    primaryForeground: 'text-white',
    secondary: isDarkMode ? 'bg-gray-700' : 'bg-gray-100',
    secondaryForeground: isDarkMode ? 'text-gray-100' : 'text-gray-800',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    input: isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900',
  };

  const [formData, setFormData] = useState({
    age: "",
    gender: "male",
    fitnessGoal: "muscle_gain",
    experienceLevel: "intermediate",
    equipment: ["dumbbells", "bench"],
    healthConditions: "none",
  });

  const [fitnessPlan, setFitnessPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

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
    // Validation
    if (!formData.age || isNaN(formData.age)) {
      Alert.alert("Invalid Age", "Please enter a valid age");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        age: parseInt(formData.age),
        gender: formData.gender,
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
          <View key={dayPlan.day} className={`mb-6 rounded-xl p-5 ${theme.card} shadow-md`}>
            <Text className={`text-xl font-bold mb-4 ${theme.foreground} pb-3 border-b ${theme.border}`}>
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
                      <Text className={`text-lg font-bold mb-2 ${theme.foreground}`}>
                        {exercise.name}
                      </Text>
                      <Text className={`text-base ${theme.foreground} opacity-90 mb-1`}>
                        <Text className="font-semibold">Target:</Text> {exercise.target_muscle}
                      </Text>
                      <Text className={`text-base ${theme.foreground} opacity-90 mb-1`}>
                        <Text className="font-semibold">Sets:</Text> {exercise.reps}
                      </Text>
                      <Text className={`text-base ${theme.foreground} opacity-90 mb-1`}>
                        <Text className="font-semibold">Type:</Text> {exercise.type}
                      </Text>
                      <Text className={`text-base ${theme.foreground} opacity-90`}>
                        <Text className="font-semibold">Difficulty:</Text> {exercise.difficulty}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text className={`text-center py-6 italic ${theme.foreground} opacity-70`}>
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
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    };

    const videoId = getYouTubeId(selectedExercise.video_url);
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&controls=1&showinfo=0&rel=0`;

    return (
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="h-[120] bg-emerald-700 justify-center items-start pl-5 pt-12">
          <Text className={`text-2xl font-bold text-white`}>
              {selectedExercise.name}
            </Text>
        </View>
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
                <Text className="font-semibold">Target Muscle:</Text> {selectedExercise.target_muscle}
              </Text>
              <Text className={`text-base mb-2 ${theme.foreground} opacity-90`}>
                <Text className="font-semibold">Sets:</Text> {selectedExercise.reps}
              </Text>
              <Text className={`text-base mb-2 ${theme.foreground} opacity-90`}>
                <Text className="font-semibold">Type:</Text> {selectedExercise.type}
              </Text>
              <Text className={`text-base mb-2 ${theme.foreground} opacity-90`}>
                <Text className="font-semibold">Difficulty:</Text> {selectedExercise.difficulty}
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

  return (
    <View className={`flex-1 ${theme.background}`}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text className={`text-2xl font-bold mb-6 text-center ${theme.foreground}`}>
          Create Your Fitness Plan
        </Text>

        {/* Age Input */}
        <View className={`mb-5 rounded-xl p-4 ${theme.card} shadow-sm`}>
          <Text className={`text-base font-semibold mb-2 ${theme.foreground}`}>Age:</Text>
          <TextInput
            className={`h-12 border rounded-lg px-4 ${theme.input} ${theme.border}`}
            keyboardType="numeric"
            value={formData.age}
            onChangeText={(text) => setFormData({ ...formData, age: text })}
            placeholder="Enter your age"
            placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
          />
        </View>

        {/* Gender Selection */}
        <View className={`mb-5 rounded-xl p-4 ${theme.card} shadow-sm`}>
          <Text className={`text-base font-semibold mb-2 ${theme.foreground}`}>Gender:</Text>
          <View className="flex-row flex-wrap mt-1">
            {["male", "female", "other"].map((gender) => (
              <TouchableOpacity
                key={gender}
                className="flex-row items-center mr-5 mb-3"
                onPress={() => setFormData({ ...formData, gender })}
              >
                <View className={`w-5 h-5 rounded-full border-2 mr-2 items-center justify-center ${formData.gender === gender ? 'border-emerald-400' : theme.border}`}>
                  {formData.gender === gender && <View className="w-3 h-3 rounded-full bg-emerald-400" />}
                </View>
                <Text className={`${theme.foreground}`}>
                  {gender.charAt(0).toUpperCase() + gender.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Fitness Goal */}
        <View className={`mb-5 rounded-xl p-4 ${theme.card} shadow-sm`}>
          <Text className={`text-base font-semibold mb-2 ${theme.foreground}`}>Fitness Goal:</Text>
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
                onPress={() => setFormData({ ...formData, fitnessGoal: goal.id })}
              >
                <View className={`w-5 h-5 rounded-full border-2 mr-2 items-center justify-center ${formData.fitnessGoal === goal.id ? 'border-emerald-400' : theme.border}`}>
                  {formData.fitnessGoal === goal.id && <View className="w-3 h-3 rounded-full bg-emerald-400" />}
                </View>
                <Text className={`${theme.foreground}`}>{goal.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Experience Level */}
        <View className={`mb-5 rounded-xl p-4 ${theme.card} shadow-sm`}>
          <Text className={`text-base font-semibold mb-2 ${theme.foreground}`}>Experience Level:</Text>
          <View className="flex-row flex-wrap mt-1">
            {["beginner", "intermediate", "advanced"].map((level) => (
              <TouchableOpacity
                key={level}
                className="flex-row items-center mr-5 mb-3"
                onPress={() => setFormData({ ...formData, experienceLevel: level })}
              >
                <View className={`w-5 h-5 rounded-full border-2 mr-2 items-center justify-center ${formData.experienceLevel === level ? 'border-emerald-400' : theme.border}`}>
                  {formData.experienceLevel === level && <View className="w-3 h-3 rounded-full bg-emerald-400" />}
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
          <Text className={`text-base font-semibold mb-2 ${theme.foreground}`}>Available Equipment:</Text>
          <View className="flex-row flex-wrap">
            {["dumbbells", "barbell", "bench", "resistance bands", "pull-up bar", "kettlebells", "none"].map((item) => (
              <TouchableOpacity
                key={item}
                className={`py-2 px-3 rounded-lg m-1 ${formData.equipment.includes(item) ? 'bg-emerald-400' : theme.secondary}`}
                onPress={() => toggleEquipment(item)}
              >
                <Text className={`${formData.equipment.includes(item) ? 'text-white' : theme.foreground}`}>
                  {item.replace(/_/g, " ")}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Health Conditions */}
        <View className={`mb-5 rounded-xl p-4 ${theme.card} shadow-sm`}>
          <Text className={`text-base font-semibold mb-2 ${theme.foreground}`}>Health Conditions:</Text>
          <TextInput
            className={`h-24 border rounded-lg px-4 py-3 ${theme.input} ${theme.border}`}
            value={formData.healthConditions}
            onChangeText={(text) => setFormData({ ...formData, healthConditions: text })}
            placeholder="Describe any health conditions"
            placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
            multiline
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          className={`rounded-xl py-4 items-center ${theme.primary} shadow-md mb-8`}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text className="text-white text-lg font-semibold">
            {loading ? "Generating Plan..." : "Generate Fitness Plan"}
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
});
import React from "react";
import { Text, View, TouchableOpacity } from "react-native";

import { Feather, MaterialCommunityIcons, AntDesign } from "@expo/vector-icons";

const FitnessPlanTab = ({ isDark, navigation }) => (
  <View className="mx-5 mt-4">
    <View
      className="bg-white dark:bg-gray-800 rounded-3xl p-6 mb-6"
      style={styles.card}
    >
      <View className="flex-row items-center mb-4">
        <MaterialCommunityIcons name="dumbbell" size={28} color="#3B82F6" />
        <Text
          className={`text-xl font-bold ml-3 ${
            isDark ? "text-white" : "text-gray-800"
          }`}
        >
          Today's Workout
        </Text>
      </View>

      <View className="space-y-4">
        {[
          { exercise: "Warm-up", duration: "10 min" },
          { exercise: "Push-ups", sets: "3 sets of 12" },
          { exercise: "Squats", sets: "4 sets of 15" },
          { exercise: "Plank", duration: "3 sets of 1 min" },
          { exercise: "Cool Down", duration: "5 min" },
        ].map((item, index) => (
          <View
            key={index}
            className="flex-row justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700"
          >
            <Text
              className={`text-lg font-medium ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              {item.exercise}
            </Text>
            <Text className="text-blue-500 dark:text-blue-400 font-medium">
              {item.sets || item.duration}
            </Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        className="mt-6 bg-blue-500 py-3 rounded-full items-center"
        onPress={() => navigation.navigate("fitnessplan")}
      >
        <Text className="text-white font-bold">Generate New Fitness Plan</Text>
      </TouchableOpacity>
    </View>

    <Text
      className={`text-xl font-bold mb-4 ${
        isDark ? "text-white" : "text-gray-800"
      }`}
    >
      Workout History
    </Text>

    <View className="space-y-4">
      {[
        {
          date: "Yesterday",
          type: "Cardio",
          duration: "45 min",
          cals: "320 cal",
        },
        {
          date: "May 24",
          type: "Strength",
          duration: "60 min",
          cals: "420 cal",
        },
        { date: "May 23", type: "Yoga", duration: "30 min", cals: "180 cal" },
      ].map((item, index) => (
        <TouchableOpacity
          key={index}
          className="bg-white dark:bg-gray-800 rounded-2xl p-4"
          style={styles.card}
        >
          <View className="flex-row justify-between">
            <Text
              className={`font-bold ${isDark ? "text-white" : "text-gray-800"}`}
            >
              {item.date}
            </Text>
            <Text className="text-blue-500 dark:text-blue-400 font-medium">
              {item.type}
            </Text>
          </View>
          <View className="flex-row justify-between mt-2">
            <Text className="text-gray-500 dark:text-gray-400">
              {item.duration}
            </Text>
            <Text className="text-emerald-600 dark:text-emerald-400">
              {item.cals}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const styles = {
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
};

export default FitnessPlanTab;
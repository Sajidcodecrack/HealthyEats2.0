import React, { useState } from "react";
import {
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  useColorScheme,
  StyleSheet,
} from "react-native";
import { Feather, MaterialCommunityIcons, AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Sparkles } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import ProgressTab from "../components/home/ProgressTab";
import MealPlanTab from "../components/home/MealPlanTab";
import FitnessPlanTab from "../components/home/FitnessPlanTab";

// Background images for quick actions
const mealPlanImage = require("../assets/images/meal.jpg");
const fitnessPlanImage = require("../assets/images/fitness.jpg");

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("Progress");

  // Stats data
  const stats = [
    { value: "2,100", label: "Calories", icon: "fire", unit: "cal" },
    { value: "85", label: "Protein", icon: "dna", unit: "g" },
    { value: "10,234", label: "Steps", icon: "foot-print", unit: "" },
    { value: "7.5", label: "Sleep", icon: "bed", unit: "hr" },
  ];

  // Goals data
  const goals = [
    {
      icon: "silverware-fork-knife",
      label: "Track Food",
      goal: "Eat 2,000 Cal",
      color: "#10B981",
      progress: 65,
    },
    {
      icon: "weight-lifter",
      label: "Workout",
      goal: "Goal: 620 cal",
      color: "#3B82F6",
      progress: 40,
    },
    {
      icon: "walk",
      label: "Steps",
      goal: "Set Up Auto-Tracking",
      color: "#8B5CF6",
      progress: 0,
    },
    {
      icon: "bed",
      label: "Sleep",
      goal: "Goal: 8hr",
      color: "#6366F1",
      progress: 75,
    },
    {
      icon: "cup-water",
      label: "Water",
      goal: "Goal: 8 glasses",
      color: "#0EA5E9",
      progress: 50,
    },
  ];

  return (
    <View
      className={`flex-1 pt-14 ${isDark ? "bg-gray-900" : "bg-emerald-50"}`}
    >
      {/* Background Gradient */}
      <LinearGradient
        colors={isDark ? ["#0c4a6e", "#065f46"] : ["#059669", "#047857"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="absolute top-0 left-0 right-0 h-64 rounded-b-3xl"
      />

      {/* Light Background Gradient */}
      <LinearGradient
        colors={
          isDark
            ? ["rgba(15, 23, 42, 0.7)", "rgba(15, 23, 42, 0.9)"]
            : ["rgba(240, 253, 250, 0.6)", "rgba(236, 253, 245, 0.8)"]
        }
        className="absolute top-0 left-0 right-0 bottom-0"
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row justify-between items-center px-6 pt-2 pb-4">
          <View className="flex-row items-center">
            <TouchableOpacity
              className="border-2 border-emerald-300 rounded-full"
              onPress={() => navigation.navigate("profile")}
            >
              <Image
                source={require("../assets/images/profile.jpeg")}
                className="w-14 h-14 rounded-full"
              />
            </TouchableOpacity>
            <View className="ml-3">
              <Text className="text-foreground text-lg font-semibold">
                Welcome back,
              </Text>
              <Text className="text-foreground text-xl font-bold">Sahil!</Text>
            </View>
          </View>

          <TouchableOpacity
            className="flex-row items-center px-4 py-2 rounded-full"
            style={[
              styles.upgradeButton,
              {
                backgroundColor: isDark
                  ? "rgba(255, 255, 255, 0.2)"
                  : "rgba(255, 255, 255, 0.3)",
                borderColor: isDark
                  ? "rgba(255, 255, 255, 0.5)"
                  : "rgba(0, 0, 0, 0.5)",
              },
            ]}
          >
            <Feather name="award" size={18} color="#10b981" />
            <Text className="text-foreground ml-2 font-bold">Pro</Text>
          </TouchableOpacity>
        </View>

        <View
          className="mx-5 my-4 p-5 rounded-3xl bg-white dark:bg-gray-800"
          style={styles.card}
        >
          <View className="flex-row justify-between mb-4">
            <View>
              <Text className="text-gray-500 dark:text-gray-300 text-sm">
                Daily Progress
              </Text>
              <Text
                className={`text-2xl font-bold ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                75%
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-gray-500 dark:text-gray-300 text-sm">
                Weekly Streak
              </Text>
              <Text
                className={`text-2xl font-bold ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                7 days
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between">
            {stats.map((stat, index) => (
              <View key={index} className="items-center">
                <MaterialCommunityIcons
                  name={stat.icon as any}
                  size={24}
                  color="#10B981"
                />
                <Text className="text-lg font-bold mt-1 text-gray-800 dark:text-white">
                  {stat.value}
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tabs */}
        <View
          className="flex-row justify-between bg-white dark:bg-gray-800 mb-5 mx-5 p-1 rounded-full"
          style={styles.card}
        >
          {["Progress", "Meal Plan", "Fitness Plan"].map((tab) => (
            <TouchableOpacity
              key={tab}
              className={`flex-1 items-center py-3 rounded-full ${
                activeTab === tab ? "bg-emerald-500" : ""
              }`}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                className={`font-semibold ${
                  activeTab === tab
                    ? "text-white"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {activeTab === "Progress" && (
          <ProgressTab
            isDark={isDark}
            navigation={navigation}
            goals={goals}
            mealPlanImage={mealPlanImage}
            fitnessPlanImage={fitnessPlanImage}
          />
        )}

        {activeTab === "Meal Plan" && (
          <MealPlanTab isDark={isDark} navigation={navigation} />
        )}

        {activeTab === "Fitness Plan" && (
          <FitnessPlanTab isDark={isDark} navigation={navigation} />
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-8 right-8 w-16 h-16 rounded-full items-center justify-center shadow-xl"
        style={styles.fab}
        onPress={() => navigation.navigate("aichat")}
      >
        <Sparkles size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}

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
  fab: {
    backgroundColor: "#059669",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    zIndex: 10,
  },
  upgradeButton: {
    borderWidth: 1,
    borderRadius: 20,
  },
});
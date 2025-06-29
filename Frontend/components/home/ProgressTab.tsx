import React from "react";
import { Text, View, TouchableOpacity, ImageBackground, Image } from "react-native";
import { Feather, MaterialCommunityIcons, AntDesign } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const ProgressTab = ({
  isDark,
  navigation,
  goals,
  mealPlanImage,
  fitnessPlanImage,
}) => (
  <>
    {/* Quick Actions */}
    <Text
      className={`text-xl font-bold mx-5 mb-4 ${
        isDark ? "text-white" : "text-gray-800"
      }`}
    >
      Quick Actions
    </Text>

    <View className="flex-row justify-between mx-5 mb-8">
      <TouchableOpacity
        className="w-[48%] rounded-3xl overflow-hidden"
        style={{ height: 140 }}
        onPress={() => navigation.navigate("foodpref")}
      >
        <ImageBackground
          source={mealPlanImage}
          className="flex-1 justify-end"
          imageStyle={{ opacity: 0.8 }}
          resizeMode="cover"
        >
          <LinearGradient
            colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.7)"]}
            className="p-4"
          >
            <View className="bg-black/30 rounded-3xl p-3">
              <Text className="text-center font-bold text-white text-lg">
                Generate Meal Plan
              </Text>
            </View>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>

      <TouchableOpacity
        className="w-[48%] rounded-3xl overflow-hidden"
        style={{ height: 140 }}
        onPress={() => navigation.navigate("fitnessplan")}
      >
        <ImageBackground
          source={fitnessPlanImage}
          className="flex-1 justify-end"
          imageStyle={{ opacity: 0.8 }}
          resizeMode="cover"
        >
          <LinearGradient
            colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.7)"]}
            className="p-4"
          >
            <View className="bg-black/30 rounded-3xl p-3">
              <Text className="text-center font-bold text-white text-lg">
                Generate Fitness Plan
              </Text>
            </View>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    </View>

    {/* Today's Goals */}
    <View className="mx-5 mt-6">
      <View className="flex-row justify-between items-center mb-4">
        <Text
          className={`text-xl font-bold ${
            isDark ? "text-white" : "text-gray-800"
          }`}
        >
          Today's Goals
        </Text>
        <TouchableOpacity>
          <Text className="text-emerald-600 dark:text-emerald-400 font-semibold">
            See All
          </Text>
        </TouchableOpacity>
      </View>

      {/* Goals Cards */}
       <View className="mb-6">
        {goals.map((goal, index) => (
          <TouchableOpacity
            key={index}
            className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-3xl "
            style={styles.card}
            onPress={() => {
              if (goal.label === "Track Food") {
                navigation.navigate("trackfood");
              }
              else if (goal.label === "Sleep") {
                navigation.navigate("SleepTrackingScreen");
              }
              else if (goal.label === "Water") {
                navigation.navigate("WaterIntakeScreen");
              }
              else {
                console.log(`${goal.label} pressed`);
              }
            }}
          >
            <View className="flex-row justify-between items-center mb-3">
              <View className="flex-row items-center">
                <View
                  className="p-2 rounded-3xl"
                  style={{ backgroundColor: `${goal.color}20` }}
                >
                  <MaterialCommunityIcons
                    name={goal.icon}
                    size={24}
                    color={goal.color}
                  />
                </View>
                <View className="ml-3">
                  <Text className="text-lg font-semibold text-gray-800 dark:text-white">
                    {goal.label}
                  </Text>
                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                    {goal.goal}
                  </Text>
                </View>
              </View>
              <View className="flex-row space-x-2">
                <TouchableOpacity className="p-2 rounded-full bg-gray-100 dark:bg-gray-700">
                  {goal.label === "Steps" ? (
                    <Feather name="chevron-right" size={20} color="gray" />
                  ) : (
                    <AntDesign name="plus" size={20} color={goal.color} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {goal.progress > 0 ? (
              <View>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                    Progress
                  </Text>
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: goal.color }}
                  >
                    {goal.progress}%
                  </Text>
                </View>
                <View className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                  <View
                    className="h-2 rounded-full"
                    style={{
                      width: `${goal.progress}%`,
                      backgroundColor: goal.color,
                    }}
                  />
                </View>
              </View>
            ) : (
              <TouchableOpacity
                className="mt-2 py-2 rounded-3xl items-center"
                style={{ backgroundColor: `${goal.color}10` }}
              >
                <Text style={{ color: goal.color }} className="font-medium">
                  Set Goal
                </Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  </>
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

export default ProgressTab;


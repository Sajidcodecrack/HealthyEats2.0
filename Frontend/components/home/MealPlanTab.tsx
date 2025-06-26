import React from "react";
import { Text, View, TouchableOpacity, Image } from "react-native";

import { Feather, MaterialCommunityIcons, AntDesign } from "@expo/vector-icons";

const MealPlanTab = ({ isDark, navigation }) => (
  <View className="mx-5 mt-4">
    <View
      className="bg-white dark:bg-gray-800 rounded-3xl p-6 mb-6"
      style={styles.card}
    >
      <View className="flex-row items-center mb-4">
        <MaterialCommunityIcons
          name="silverware-fork-knife"
          size={28}
          color="#10B981"
        />
        <Text
          className={`text-xl font-bold ml-3 ${
            isDark ? "text-white" : "text-gray-800"
          }`}
        >
          Today's Meal Plan
        </Text>
      </View>

      <View className="space-y-4">
        {[
          { time: "Breakfast", meal: "Oatmeal with Berries", cals: "320 cal" },
          { time: "Lunch", meal: "Grilled Chicken Salad", cals: "450 cal" },
          { time: "Snack", meal: "Greek Yogurt with Nuts", cals: "220 cal" },
          { time: "Dinner", meal: "Salmon with Vegetables", cals: "550 cal" },
        ].map((item, index) => (
          <View
            key={index}
            className="flex-row justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700"
          >
            <View>
              <Text className="text-gray-500 dark:text-gray-300 text-sm">
                {item.time}
              </Text>
              <Text
                className={`text-lg font-medium ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                {item.meal}
              </Text>
            </View>
            <Text className="text-emerald-600 dark:text-emerald-400 font-medium">
              {item.cals}
            </Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        className="mt-6 bg-emerald-500 py-3 rounded-full items-center"
        onPress={() => navigation.navigate("foodpref")}
      >
        <Text className="text-white font-bold">Generate New Meal Plan</Text>
      </TouchableOpacity>
    </View>

    <Text
      className={`text-xl font-bold mb-4 ${
        isDark ? "text-white" : "text-gray-800"
      }`}
    >
      Recent Meals
    </Text>

    <View className="flex-row flex-wrap justify-between">
      {[1, 2, 3, 4].map((item) => (
        <TouchableOpacity
          key={item}
          className="w-[48%] mb-4 bg-white dark:bg-gray-800 rounded-2xl p-3"
          style={styles.card}
        >
          <Image
            source={require("../../assets/images/meal.jpg")}
            className="w-full h-32 rounded-xl mb-2"
            resizeMode="cover"
          />
          <Text
            className={`font-medium ${isDark ? "text-white" : "text-gray-800"}`}
          >
            Meal {item}
          </Text>
          <Text className="text-emerald-600 dark:text-emerald-400 text-sm">
            450 cal
          </Text>
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

export default MealPlanTab;
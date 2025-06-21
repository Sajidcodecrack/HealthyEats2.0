import {
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  useColorScheme,
  StyleSheet,
} from "react-native";
import {
  Feather,
  MaterialCommunityIcons,
  AntDesign,
} from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient'; // Import LinearGradient

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View className={`flex-1 pt-14 ${isDark ? "bg-background" : "bg-white"}`}>
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="flex-row justify-between items-center px-4 py-2">
          <View className="flex-row items-center">
            <Image
              source={require("../../assets/images/profile.jpeg")} // Assuming you have a profile.png in assets/images
              className="w-12 h-12 rounded-full"
            />
          </View>
          <View className="flex-row items-center space-x-3">
            <TouchableOpacity className="flex-row items-center px-3 py-2 rounded-full bg-green-700">
              <Feather name="arrow-up-circle" size={16} color="white" />
              <Text className="text-white ml-2 font-semibold">
                Upgrade pro
              </Text>
            </TouchableOpacity>
            
          </View>
        </View>

        {/* Navigation Tabs */}
        <View className="flex-row justify-stretch gap-10 mt-4 px-4">
          {["Progress", "Plans", "Store"].map((tab) => (
            <TouchableOpacity
              key={tab}
              className={`pb-2 ${
                tab === "Progress"
                  ? "border-b-2 border-green-700"
                  : "border-b-2 border-transparent"
              }`}
            >
              <Text
                className={`text-lg font-semibold ${
                  tab === "Progress"
                    ? "text-green-700"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Today's Goals Section */}
        <Text
          className={`text-2xl font-bold mt-6 mb-4 px-4 ${
            isDark ? "text-white" : "text-gray-800"
          }`}
        >
          Today's Goals
        </Text>

        {/* Track Food Card */}
        <View className="mx-4 p-4 bg-white dark:bg-card rounded-xl shadow-sm">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <View className="p-2 rounded-full bg-blue-100 mr-3">
                <MaterialCommunityIcons
                  name="silverware-fork-knife"
                  size={24}
                  color="gray"
                />
              </View>
              <View>
                <Text className="text-lg font-semibold text-gray-800 dark:text-white">
                  Track Food
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  Eat 2,000 Cal
                </Text>
              </View>
            </View>
            <View className="flex-row space-x-2">
              <TouchableOpacity className="p-2 rounded-full bg-gray-100 dark:bg-muted">
                <Feather name="camera" size={20} color="gray" />
              </TouchableOpacity>
              <TouchableOpacity className="p-2 ml-2 rounded-full bg-orange-100">
                <AntDesign name="plus" size={20} color="orange" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-row flex-wrap justify-between">
            {["Protein", "Fats", "Carbs", "Fibre"].map((item) => (
              <View key={item} className="w-[48%] mb-3">
                <Text className="text-sm text-gray-600 dark:text-gray-300">
                  {item}: 0%
                </Text>
                <View className="w-full h-1 bg-gray-200 rounded-full dark:bg-gray-700" />
              </View>
            ))}
          </View>
        </View>

        {/* Other Goals List */}
        <View className="mx-4 mt-4 p-4 bg-white dark:bg-card rounded-xl shadow-sm mb-20">
          {[
            {
              icon: (
                <MaterialCommunityIcons name="weight-kg" size={24} color="gray" />
              ),
              label: "Weight",
              goal: "Set Goal",
            },
            {
              icon: (
                <MaterialCommunityIcons
                  name="dumbbell"
                  size={24}
                  color="gray"
                />
              ),
              label: "Workout",
              goal: "Goal: 620 cal",
            },
            {
              icon: <Feather name="walking" size={24} color="gray" />,
              label: "Steps",
              goal: "Set Up Auto-Tracking",
            },
            {
              icon: <Feather name="moon" size={24} color="gray" />,
              label: "Sleep",
              goal: "Goal: 8hr",
            },
            {
              icon: <Feather name="droplet" size={24} color="gray" />,
              label: "Water",
              goal: "Goal: 8 glasses",
            },
          ].map((item, index) => (
            <View
              key={index}
              className="flex-row justify-between items-center py-2"
            >
              <View className="flex-row items-center">
                <View className="p-2 rounded-full bg-gray-100 mr-3">
                  {item.icon}
                </View>
                <View>
                  <Text className="text-lg font-semibold text-gray-800 dark:text-white">
                    {item.label}
                  </Text>
                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                    {item.goal}
                  </Text>
                </View>
              </View>
              <TouchableOpacity className="p-2 rounded-full bg-gray-100 dark:bg-muted">
                {item.label === "Steps" ? (
                  <Feather name="chevron-right" size={20} color="gray" />
                ) : (
                  <AntDesign name="plus" size={20} color="gray" />
                )}
              </TouchableOpacity>
            </View>
          ))}
        </View>
        
      </ScrollView>
      {/* Floating Action Button - assuming it's for adding something */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 p-4 rounded-full bg-green-500 shadow-lg"
        onPress={() => console.log("FAB Pressed")}
      >
        <MaterialCommunityIcons name="stars" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}

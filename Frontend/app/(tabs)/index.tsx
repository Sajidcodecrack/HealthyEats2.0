import {
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import {
  Feather,
  MaterialCommunityIcons,
  AntDesign,
} from "@expo/vector-icons";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View className={`flex-1 pt-8 ${isDark ? "bg-background" : "bg-white"}`}>
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="flex-row justify-between items-center px-4 py-4 pt-8">
          <Text
            className={`text-3xl font-bold ${
              isDark ? "text-white" : "text-gray-800"
            }`}
          >
            Hi, Alex Grace
          </Text>
          <View className="flex-row space-x-3">
            <TouchableOpacity className="p-2 rounded-full bg-gray-200 dark:bg-muted">
              <Feather
                name="maximize"
                size={24}
                color={isDark ? "white" : "gray"}
              />
            </TouchableOpacity>
            <TouchableOpacity className="p-2 rounded-full bg-gray-200 dark:bg-muted">
              <MaterialCommunityIcons
                name="message-text-outline"
                size={24}
                color={isDark ? "white" : "gray"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Nutrition Card */}
        <View className="mx-4 mt-4 p-4 bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-muted">
          <Text className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
            Nutrition
          </Text>
          <Text className="text-gray-600 dark:text-gray-300 mb-4">
            Eat upto 2000 cal
          </Text>

          <View className="flex-row justify-between items-center">
            <View className="flex-1 mr-4">
              {["Protein", "Fat", "Carbs"].map((label, i) => {
                const width = [0.75, 0.5, 0.83][i];
                return (
                  <View className="mb-2" key={label}>
                    <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {label}
                    </Text>
                    <View className="w-full h-2 bg-orange-200 dark:bg-orange-700 rounded-full">
                      <View
                        className="h-2 bg-orange-500 rounded-full"
                        style={{ width: `${width * 100}%` }}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
            <View className="w-20 h-20 rounded-full border-4 border-orange-400 justify-center items-center" />
          </View>
        </View>

        {/* Feature Cards */}
        <View className="flex flex-wrap flex-row justify-between mx-4 mt-6">
          {[
            {
              label: "Recommended Food",
              color: "#E6FCEB",
              border: "border-green-500",
              text: "text-green-700",
              img: require("../../assets/images/RecommendedFood.png"),
            },
            {
              label: "Consult Doctor",
              color: "#E6F2FF",
              border: "border-blue-500",
              text: "text-blue-700",
              img: require("../../assets/images/ConsultDoctor.png"),
            },
            {
              label: "Diet Plan",
              color: "#FFE6EF",
              border: "border-pink-500",
              text: "text-pink-700",
              img: require("../../assets/images/DietPlan.png"),
            },
            {
              label: "Fitness Plan",
              color: "#FFF7E6",
              border: "border-yellow-500",
              text: "text-yellow-700",
              img: require("../../assets/images/FitnessPlan.png"),
            },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              className={`w-[48%] mb-4 items-center p-4 rounded-2xl border ${item.border}`}
              style={{
                backgroundColor: isDark ? "#1f1f1f" : item.color,
              }}
              onPress={() => console.log(item.label)}
            >
              <Image
                source={item.img}
                className="w-20 h-20 mb-3"
                resizeMode="contain"
              />
              <Text className={`text-center font-semibold ${item.text}`}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Daily Eating Tracker */}
        <View className="mx-4 mt-6 p-4 bg-white dark:bg-card rounded-xl mb-20 border border-gray-200 dark:border-muted">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-semibold text-gray-800 dark:text-white">
              Track Daily Eating
            </Text>
            <TouchableOpacity
              className="p-2 rounded-full bg-orange-500"
              onPress={() => console.log("Add new meal")}
            >
              <AntDesign name="plus" size={24} color="white" />
            </TouchableOpacity>
          </View>
          {[
            { name: "Fried chicken", cal: 200 },
            { name: "Eggs", cal: 80 },
            { name: "Bread", cal: 90 },
          ].map((item) => (
            <View
              key={item.name}
              className="flex-row justify-between py-1"
            >
              <Text className="text-gray-700 dark:text-gray-300">
                {item.name}
              </Text>
              <Text className="text-gray-700 dark:text-gray-300">
                {item.cal} cal
              </Text>
            </View>
          ))}
          <TouchableOpacity
            className="mt-4 py-2 px-4 rounded-md self-end"
            onPress={() => console.log("Enter new meal")}
          >
            <Text className="text-gray-500 dark:text-gray-400">
              Enter new meal
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

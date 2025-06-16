import { Text, View, ScrollView, SafeAreaView, Image, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons, AntDesign } from '@expo/vector-icons'; // Assuming you have @expo/vector-icons installed

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white"> 
      <ScrollView className="flex-1 bg-gray-100">
        <View className="flex-row justify-between items-center px-4 py-4 pt-8">
          <Text className="text-3xl font-bold text-gray-800">Hi, Alex Grace</Text>
          <View className="flex-row space-x-3">
            <TouchableOpacity className="p-2 rounded-full bg-gray-200">
              <Feather name="maximize" size={24} color="gray" />
            </TouchableOpacity>
            <TouchableOpacity className="p-2 rounded-full bg-gray-200">
              <MaterialCommunityIcons name="message-text-outline" size={24} color="gray" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="mx-4 mt-4 p-4 bg-white rounded-xl shadow-md">
          <Text className="text-xl font-semibold text-gray-800 mb-3">Nutrition</Text>
          <Text className="text-gray-600 mb-4">Eat upto 2000 cal</Text>
          <View className="flex-row justify-between items-center">
            <View className="flex-1 mr-4">
              <View className="mb-2">
                <Text className="text-sm font-medium text-gray-700">Protein</Text>
                <View className="w-full h-2 bg-orange-200 rounded-full">
                  <View className="w-3/4 h-2 bg-orange-500 rounded-full"></View>
                </View>
              </View>
              <View className="mb-2">
                <Text className="text-sm font-medium text-gray-700">Fat</Text>
                <View className="w-full h-2 bg-orange-200 rounded-full">
                  <View className="w-1/2 h-2 bg-orange-500 rounded-full"></View>
                </View>
              </View>
              <View>
                <Text className="text-sm font-medium text-gray-700">Carbs</Text>
                <View className="w-full h-2 bg-orange-200 rounded-full">
                  <View className="w-5/6 h-2 bg-orange-500 rounded-full"></View>
                </View>
              </View>
            </View>
            <View className="w-20 h-20 rounded-full border-4 border-orange-400 justify-center items-center">
            </View>
          </View>
        </View>
        <View className="mx-4 mt-6 grid grid-cols-2 gap-4">
            <TouchableOpacity className="flex-col justify-center items-center p-4 bg-white rounded-xl shadow-md"
              onPress={() => console.log('Create Diet Plan')}>
              <Text className="text-sm font-medium text-gray-700 text-center">Create Diet Plan</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-col justify-center items-center p-4 bg-white rounded-xl shadow-md"
              onPress={() => console.log('Recommended food')}>
              <Text className="text-sm font-medium text-gray-700 text-center">Recommended food</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-col justify-center items-center p-4 bg-white rounded-xl shadow-md"
              onPress={() => console.log('Ai Exercise Plan')}>
              <Text className="text-sm font-medium text-gray-700 text-center">Ai Exercise Plan</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-col justify-center items-center p-4 bg-white rounded-xl shadow-md"
              onPress={() => console.log('Health Monitoring')}>
              <Text className="text-sm font-medium text-gray-700 text-center">Health Monitoring</Text>
            </TouchableOpacity>
        </View>
        <View className="mx-4 mt-6 p-4 bg-white rounded-xl shadow-md mb-20">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-semibold text-gray-800">Track Daily Eating</Text>
            <TouchableOpacity className="p-2 rounded-full bg-orange-500"
              onPress={() => console.log('Add new meal')}>
              <AntDesign name="plus" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <View className="mb-2">
            <View className="flex-row justify-between py-1">
              <Text className="text-gray-700">Fried chicken</Text>
              <Text className="text-gray-700">200 cal</Text>
            </View>
            <View className="flex-row justify-between py-1">
              <Text className="text-gray-700">Eggs</Text>
              <Text className="text-gray-700">80 cal</Text>
            </View>
            <View className="flex-row justify-between py-1">
              <Text className="text-gray-700">Bread</Text>
              <Text className="text-gray-700">90 cal</Text>
            </View>
          </View>
          <TouchableOpacity className="mt-4 py-2 px-4 rounded-md self-end"
            onPress={() => console.log('Enter new meal')}>
            <Text className="text-gray-500">Enter new meal</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
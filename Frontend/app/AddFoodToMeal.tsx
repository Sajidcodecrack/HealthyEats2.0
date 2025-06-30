import React, { useState } from "react";
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet,
  ScrollView,
  Appearance,
  StatusBar
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ArrowLeft } from "lucide-react-native";

const AddFoodToMeal = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { analysisResult, imageUri, calories } = route.params;
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const meals = ["breakfast", "snack", "lunch", "dinner"];
  
  const colorScheme = Appearance.getColorScheme();
  const isDarkMode = colorScheme === "dark";

  const colors = {
    primary: isDarkMode ? "#065f46" : "#059669",
    background: isDarkMode ? "#111827" : "#ecfdf5",
    card: isDarkMode ? "#1f2937" : "#FFFFFF",
    text: isDarkMode ? "#FFFFFF" : "#1f2937",
    secondaryText: isDarkMode ? "#9ca3af" : "#6b7280",
    button: isDarkMode ? "#34d399" : "#059669",
    buttonText: "#FFFFFF",
    sectionTitle: isDarkMode ? "#e5e7eb" : "#065f46",
    border: isDarkMode ? "#374151" : "#d1fae5",
    disabled: isDarkMode ? "#444444" : "#E0E0E0",
    foodNameBg: isDarkMode ? "#065f46" : "#059669",
    foodNameText: isDarkMode ? "#e0f2fe" : "#065f46",
  };

  // Function to parse and format nutrition values
  const parseNutritionValue = (value: any, unit: string) => {
    if (value === undefined || value === null) return "N/A";
    
    try {
      // Handle JSON strings
      if (typeof value === 'string') {
        // Check if it's a JSON string
        if (value.startsWith('{') || value.startsWith('[')) {
          const parsed = JSON.parse(value);
          // If it's an object, extract the value
          if (typeof parsed === 'object') {
            return `${Object.values(parsed)[0]} ${unit}`;
          }
          return `${parsed} ${unit}`;
        }
        return value;
      }
      
      // Handle numbers
      if (typeof value === 'number') {
        return `${value} ${unit}`;
      }
      
      // Handle objects
      if (typeof value === 'object') {
        return `${Object.values(value)[0]} ${unit}`;
      }
      
      return `${value} ${unit}`;
    } catch (e) {
      console.error("Error parsing nutrition value:", e);
      return "N/A";
    }
  };

  // Extract nutrition data with proper units
  const nutritionData = [
    { title: "Calories", 
      value: calories, 
      unit: "cal",
      key: "calories" 
    },
    { title: "Carbs", 
      value: analysisResult.carbs_per_100g || analysisResult.carbs, 
      unit: "",
      key: "carbs" 
    },
    { title: "Protein", 
      value: analysisResult.protein_per_100g || analysisResult.protein, 
      unit: "",
      key: "protein" 
    },
    { title: "Fiber", 
      value: analysisResult.fiber_per_100g || analysisResult.fiber, 
      unit: "",
      key: "fiber" 
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { backgroundColor: "rgba(255,255,255,0.2)" }]}
        >
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analysis</Text>
        <View style={{ width: 44 }} /> 
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Image 
            source={{ uri: imageUri }} 
            style={[styles.image, styles.cardShadow]} 
            resizeMode="cover"
          />
          
          <View style={[styles.foodInfo, { backgroundColor: colors.card }, styles.card, styles.cardShadow]}>
            {/* Food Name Section */}
            <View style={[
              styles.foodNameContainer, 
              { backgroundColor: colors.foodNameBg }
            ]}>
              <Text 
                numberOfLines={2}
                ellipsizeMode="tail"
                style={[styles.foodName, { color: colors.foodNameText }]}
              >
                {analysisResult.food_name || "Food Item"}
              </Text>
            </View>
            
            {/* Nutrition Grid */}
            <View style={styles.nutritionGrid}>
              {nutritionData.map((item) => (
                <NutritionCard 
                  key={item.key}
                  title={item.title}
                  value={parseNutritionValue(item.value, item.unit)}
                  colors={colors}
                />
              ))}
            </View>
            
            {/* Additional Info */}
            <View style={styles.additionalInfo}>
              {analysisResult.sugar_level && (
                <Text style={[styles.infoText, { color: colors.secondaryText }]}>
                  Sugar Level: {analysisResult.sugar_level}
                </Text>
              )}
              
              {analysisResult.health_rating && (
                <Text style={[styles.infoText, { color: colors.secondaryText }]}>
                  Health Rating: {analysisResult.health_rating}
                </Text>
              )}
              
              {analysisResult.description && (
                <Text style={[styles.descriptionText, { color: colors.secondaryText }]}>
                  {analysisResult.description}
                </Text>
              )}
            </View>
          </View>
          
          
          
        </View>
      </ScrollView>
    </View>
  );
};

const NutritionCard = ({ title, value, colors }) => (
  <View style={[styles.nutritionCard, { backgroundColor: colors.background }]}>
    <Text style={[styles.nutritionTitle, { color: colors.secondaryText }]}>
      {title}
    </Text>
    <Text 
      style={[styles.nutritionValue, { color: colors.text }]}
      numberOfLines={2}
      ellipsizeMode="tail"
    >
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 120,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: 60,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 30,
  },
  content: {
    alignItems: "center",
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 20,
    marginBottom: 25,
    backgroundColor: "#e5e7eb",
  },
  foodInfo: {
    width: "100%",
    borderRadius: 24,
    padding: 0,
    overflow: "hidden",
    marginBottom: 25,
  },
  foodNameContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginBottom: 15,
  },
  foodName: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 28,
  },
  nutritionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 16,
  },
  nutritionCard: {
    width: "48%",
    borderRadius: 16,
    padding: 12,
    marginBottom: 15,
    alignItems: "center",
    minHeight: 80,
    justifyContent: "center",
  },
  nutritionTitle: {
    fontSize: 14,
    marginBottom: 5,
    textAlign: "center",
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  additionalInfo: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  infoText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 10,
  },
  selectMeal: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 15,
    alignSelf: "flex-start",
    marginLeft: 5,
  },
  mealButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 25,
  },
  mealButton: {
    width: "48%",
    padding: 16,
    borderRadius: 16,
    marginBottom: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  mealButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  addButton: {
    width: "100%",
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  card: {
    borderRadius: 24,
  },
  cardShadow: {
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

export default AddFoodToMeal;
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
  };

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
        <Text style={styles.headerTitle}>Add Food</Text>
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
            <Text style={[styles.foodName, { color: colors.text }]}>
              Food Analysis
            </Text>
            
            <View style={styles.nutritionGrid}>
              <NutritionCard 
                title="Calories" 
                value={calories || "N/A"} 
                colors={colors}
                unit="cal"
              />
              <NutritionCard 
                title="Carbs" 
                value={analysisResult.carbs_per_100g} 
                colors={colors}
                unit="g"
              />
              <NutritionCard 
                title="Protein" 
                value={analysisResult.protein_per_100g} 
                colors={colors}
                unit="g"
              />
              <NutritionCard 
                title="Fiber" 
                value={analysisResult.fiber_per_100g} 
                colors={colors}
                unit="g"
              />
            </View>
            
            <Text style={[styles.sugarLevel, { color: colors.secondaryText }]}>
              Sugar Level: {analysisResult.sugar_level || "N/A"}
            </Text>
          </View>
          
          <Text style={[styles.selectMeal, { color: colors.sectionTitle }]}>
            Select Meal:
          </Text>
          
          <View style={styles.mealButtons}>
            {meals.map((meal) => (
              <TouchableOpacity
                key={meal}
                style={[
                  styles.mealButton,
                  styles.cardShadow,
                  { 
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderWidth: 1
                  },
                  selectedMeal === meal && {
                    backgroundColor: colors.button,
                    borderColor: colors.button
                  }
                ]}
                onPress={() => setSelectedMeal(meal)}
              >
                <Text style={[
                  styles.mealButtonText,
                  { color: colors.text },
                  selectedMeal === meal && { color: colors.buttonText }
                ]}>
                  {meal.charAt(0).toUpperCase() + meal.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity
            style={[
              styles.addButton,
              styles.cardShadow,
              { backgroundColor: colors.button },
              !selectedMeal && { backgroundColor: colors.disabled }
            ]}
            onPress={() => {
              if (selectedMeal) {
                navigation.navigate("TrackFood", { 
                  meal: selectedMeal, 
                  calories: calories
                });
              }
            }}
            disabled={!selectedMeal}
          >
            <Text style={styles.addButtonText}>
              Add to {selectedMeal ? selectedMeal : "Meal"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};
const NutritionCard = ({ title, value, colors, unit }) => (
  <View style={[styles.nutritionCard, { backgroundColor: colors.background }]}>
    <Text style={[styles.nutritionTitle, { color: colors.secondaryText }]}>
      {title}
    </Text>
    <Text style={[styles.nutritionValue, { color: colors.text }]}>
      {value || "N/A"} {value && unit ? unit : ""}
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
    padding: 24,
    marginBottom: 25,
  },
  foodName: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  nutritionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 15,
  },
  nutritionCard: {
    width: "48%",
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    alignItems: "center",
  },
  nutritionTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  nutritionValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  sugarLevel: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
    textAlign: "center",
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
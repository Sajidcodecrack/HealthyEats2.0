import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  StyleSheet,
  useColorScheme
} from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Constants from "expo-constants";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
const API_URL = Constants.expoConfig?.extra?.apiUrl;

interface MealSection {
  Foods: string[];
  Fruits: string[];
  DrinksOrTea: string[];
  Nutrition: string;
  EstimatedCost: string;
  recipe: Recipe | null;
}

interface Recipe {
  title: string;
  ingredients: string[];
  steps: string[];
}

interface MealPlanResponse {
  Breakfast: MealSection;
  Lunch: MealSection;
  Snack: MealSection;
  Dinner: MealSection;
  TotalCalories: string;
  TotalEstimatedCost: string;
  WaterIntakeLiters: string;
  Notes: string;
}

const MealPlanTab = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Colors
  const bgColor = isDark ? "#0f172a" : "#f0fdf4";
  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const textColor = isDark ? "#f1f5f9" : "#1f2937";
  const secondaryText = isDark ? "#94a3b8" : "#64748b";
  const primaryColor = "#059669";
  const accentColor = "#34d399";

  const [mealPlan, setMealPlan] = useState<MealPlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [recipeModalVisible, setRecipeModalVisible] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [currentMealType, setCurrentMealType] = useState("");
  const [generatingForMeal, setGeneratingForMeal] = useState<string | null>(null);

  useEffect(() => {
    const fetchMealPlan = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
          throw new Error("User not authenticated");
        }

        const response = await axios.get(`${API_URL}/api/mealplan/${userId}`);
        setMealPlan(response.data);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchMealPlan();
  }, []);

  const handleGenerateRecipe = async (mealType: string) => {
    if (!mealPlan) return;

    setCurrentMealType(mealType);
    const section = mealPlan[mealType as keyof MealPlanResponse] as MealSection;

    if (section?.recipe) {
      setCurrentRecipe(section.recipe);
      setRecipeModalVisible(true);
      return;
    }

    setGeneratingForMeal(mealType);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/api/meals/generate-recipe`,
        { mealId: mealPlan._id, mealType },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update meal plan with new recipe
      const updatedMealPlan = { ...mealPlan };
      updatedMealPlan[mealType as keyof MealPlanResponse].recipe = response.data.recipe;
      setMealPlan(updatedMealPlan);
      setCurrentRecipe(response.data.recipe);
      setRecipeModalVisible(true);
    } catch (error) {
      console.error("Error generating recipe:", error);
      Alert.alert("Error", "Failed to generate recipe");
    } finally {
      setGeneratingForMeal(null);
    }
  };

  const RenderSection = ({ title, data }: { title: string; data: string[] }) => (
    <View style={styles.detailSection}>
      <Text style={[styles.detailTitle, { color: accentColor }]}>{title}:</Text>
      {data?.length > 0 ? (
        data.map((item, i) => (
          <Text key={i} style={[styles.detailItem, { color: textColor }]}>
            • {item}
          </Text>
        ))
      ) : (
        <Text style={[styles.detailItemEmpty, { color: secondaryText }]}>
          Not specified.
        </Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: bgColor }]}>
        <ActivityIndicator size="large" color={primaryColor} />
        <Text style={[styles.loadingText, { color: textColor }]}>
          Loading your meal plan...
        </Text>
      </View>
    );
  }

  if (!mealPlan) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <MaterialCommunityIcons
          name="silverware-fork-knife"
          size={80}
          color="#3B82F6"
          className="mb-6"
        />
        <Text
          className={`text-xl font-bold mb-4 text-center text-foreground `}
        >
          No meal Plan Found
        </Text>
        <Text
          className={`text-lg mb-8 text-center opacity-80 text-foreground`}
        >
          Create your first meal plan by setting your preferences
        </Text>
        <TouchableOpacity
          className="bg-blue-500 py-4 px-8 rounded-full"
          onPress={() => navigation.navigate("fitnessplan")}
        >
          <Text className="text-white text-lg font-bold">
            Create Meal Plan
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {(["Breakfast", "Lunch", "Snack", "Dinner"] as const).map((mealType) => {
          const section = mealPlan[mealType];
          return (
            <View
              key={mealType}
              style={[styles.mealCard, { backgroundColor: cardBg }]}
            >
              <Text style={[styles.mealTitle, { color: primaryColor }]}>
                {mealType}
              </Text>

              <RenderSection title="Foods" data={section.Foods} />
              <RenderSection title="Fruits" data={section.Fruits} />
              <RenderSection title="Drinks/Tea" data={section.DrinksOrTea} />

              <View style={styles.detailSection}>
                <Text style={[styles.detailTitle, { color: accentColor }]}>
                  Nutrition:
                </Text>
                <Text style={[styles.detailItem, { color: textColor }]}>
                  {section.Nutrition || "Not specified."}
                </Text>
              </View>

              <Text style={[styles.costText, { color: secondaryText }]}>
                Estimated Cost:{" "}
                <Text style={{ fontWeight: "bold", color: textColor }}>
                  {section.EstimatedCost || "N/A"}
                </Text>
              </Text>

              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor:
                      generatingForMeal === mealType ? "#ccc" : primaryColor,
                  },
                ]}
                onPress={() => handleGenerateRecipe(mealType)}
                disabled={!!generatingForMeal}
              >
                {generatingForMeal === mealType ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>
                    {section.recipe ? "View Recipe" : "Generate Recipe"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          );
        })}

        <View style={[styles.summaryCard, { backgroundColor: cardBg }]}>
          <Text style={[styles.summaryTitle, { color: primaryColor }]}>
            Daily Summary
          </Text>

          <View style={[styles.summaryItem, { flexDirection: 'column' }]}>
            <Text style={[styles.summaryLabel, { color: secondaryText }]}>
              Total Calories:
            </Text>
            <View style={{ height: 2 }} />
            <Text style={[styles.summaryValue, { color: textColor }]}>
              {mealPlan.TotalCalories || "N/A"}
            </Text>
          </View>

          <View style={[styles.summaryItem, { flexDirection: 'column' }]}>
            <Text style={[styles.summaryLabel, { color: secondaryText }]}>
              Estimated Cost:
            </Text>
            <Text style={[styles.summaryValue, { color: textColor }]}>
              {mealPlan.TotalEstimatedCost || "N/A"}
            </Text>
          </View>

          <View style={[styles.summaryItem, { flexDirection: 'column' }]}>
            <Text style={[styles.summaryLabel, { color: secondaryText }]}>
              Water Intake:
            </Text>
            <Text style={[styles.summaryValue, { color: textColor }]}>
              {mealPlan.WaterIntakeLiters || "N/A"} liters
            </Text>
          </View>

          {mealPlan.Notes && (
            <View style={styles.notesSection}>
              <Text style={[styles.summaryLabel, { color: secondaryText }]}>
                Notes:
              </Text>
              <Text style={[styles.notesText, { color: textColor }]}>
                {mealPlan.Notes}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
              visible={recipeModalVisible}
              animationType="slide"
              onRequestClose={() => setRecipeModalVisible(false)}
            >
              <View style={[styles.modalContainer, { backgroundColor: bgColor }]}>
                <LinearGradient
                  colors={isDark ? ["#065f46", "#064e3b"] : ["#059669", "#047857"]}
                  style={styles.modalHeader}
                >
                  <Text style={styles.modalTitle}>
                    {currentMealType} Recipe: {currentRecipe?.title}
                  </Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setRecipeModalVisible(false)}
                  >
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </LinearGradient>
      
                {currentRecipe ? (
                  <ScrollView style={styles.modalContent}>
                    <View style={styles.ingredientsSection}>
                      <Text style={[styles.sectionTitle, { color: primaryColor }]}>
                        Ingredients
                      </Text>
                      {currentRecipe.ingredients.map((ingredient, index) => (
                        <Text
                          key={index}
                          style={[styles.ingredientItem, { color: textColor }]}
                        >
                          • {ingredient}
                        </Text>
                      ))}
                    </View>
                    <View className="flex-row items-center my-6">
                      <View className="flex-1 h-[2px] bg-gray-200 dark:bg-gray-700" />
                    </View>
                    <View style={styles.stepsSection}>
                      <Text style={[styles.sectionTitle, { color: primaryColor }]}>
                        Steps
                      </Text>
                      {currentRecipe.steps.map((step, index) => (
                        <View key={index} style={styles.stepItem}>
                          <Text
                            style={[styles.stepNumber]}
                            className="text-foreground"
                          >
                            {index + 1} .
                          </Text>
                          <Text style={[styles.stepText, { color: textColor }]}>
                            {step}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                ) : (
                  <View style={styles.centeredModal}>
                    <ActivityIndicator size="large" color={primaryColor} />
                    <Text style={[styles.loadingText, { color: textColor }]}>
                      Loading recipe...
                    </Text>
                  </View>
                )}
              </View>
            </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
  },
  errorText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  errorSubText: {
    fontSize: 16,
    textAlign: "center",
  },
  header: {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    position: "absolute",
    top: 55,
    left: 20,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  mealCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  mealTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  detailSection: {
    marginBottom: 10,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  detailItem: {
    fontSize: 15,
    marginLeft: 8,
    lineHeight: 22,
  },
  detailItemEmpty: {
    fontSize: 14,
    marginLeft: 8,
    fontStyle: "italic",
  },
  costText: {
    fontSize: 14,
    fontStyle: "italic",
    marginTop: 8,
    marginBottom: 16,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  summaryItem: {
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "500",
  },
  notesSection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 5,
  },
  // Add modal styles if needed
});

export default MealPlanTab;
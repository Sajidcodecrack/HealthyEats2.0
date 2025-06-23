import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Constants from "expo-constants";
import { getToken } from "~/lib/tokenManager";

// --- TYPE DEFINITIONS ---
type Recipe = {
  title: string;
  ingredients: string[];
  steps: string[];
};

type MealSection = {
  Foods: string[];
  Fruits: string[];
  DrinksOrTea: string[];
  Nutrition: string;
  EstimatedCost: string;
  recipe: Recipe | null;
};

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

const API_URL = Constants.expoConfig?.extra?.apiUrl;

export default function MealPlanScreen() {
  const [mealPlan, setMealPlan] = useState<MealPlanResponse | null>(null);
  const [mealPlanId, setMealPlanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingForMeal, setGeneratingForMeal] = useState<string | null>(null);
  const [recipeModalVisible, setRecipeModalVisible] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [currentMealType, setCurrentMealType] = useState<string>("");
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  
  // Colors
  const bgColor = isDark ? "#0f172a" : "#f0fdf4";
  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const textColor = isDark ? "#f1f5f9" : "#1f2937";
  const secondaryText = isDark ? "#94a3b8" : "#64748b";
  const primaryColor = "#059669";
  const accentColor = "#34d399";
  const borderColor = isDark ? "#334155" : "#d1fae5";

  const styles = useMemo(() => createStyles(isDark), [isDark]);

  const normalizeMealSection = (section: any): MealSection => {
    if (!section) {
      return {
        Foods: [],
        Fruits: [],
        DrinksOrTea: [],
        Nutrition: "",
        EstimatedCost: "",
        recipe: null,
      };
    }
    return {
      Foods: section.Foods ?? [],
      Fruits: section.Fruits ?? [],
      DrinksOrTea: section["Drinks/Tea"] ?? section.Drinks_Tea ?? [],
      Nutrition: section.Nutrition ?? "",
      EstimatedCost: section.EstimatedCost ?? "",
      recipe: section.recipe ?? null,
    };
  };

  const getUserProfileForMealGen = async (userId: string) => {
    try {
      const token = await getToken();
      const profileRes = await axios.get(
        `${API_URL}/api/user-profile/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const prefsRes = await axios.get(
        `${API_URL}/api/foodPreferences/${userId}`
      );
      const profile = profileRes.data;
      const prefs = prefsRes.data;

      return {
        name: "",
        age: profile.age,
        gender: profile.gender,
        pregnant: prefs.pregnancyStatus ?? false,
        heightFeet: profile.heightFeet,
        heightInches: profile.heightInches,
        weight: profile.weight,
        activityLevel: "moderate",
        budget: prefs.budget ?? 100,
        medicalConditions: prefs.medicalConditions || [],
        diabetesRange: prefs.diabeticRange || "",
        allergies: prefs.allergies || [],
        preferredFoodTypes: prefs.foodTypes || [],
      };
    } catch (error) {
      console.error("Error fetching user profile or preferences:", error);
      throw new Error("User data incomplete. Cannot generate meal plan.");
    }
  };

  useEffect(() => {
    const fetchOrGenerateMealPlan = async () => {
      setLoading(true);
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
          Alert.alert("Error", "User not identified. Please log in again.");
          setLoading(false);
          return;
        }

        // Try fetching existing meal plan
        try {
          const res = await axios.get(`${API_URL}/api/mealplan/${userId}`);
          if (res.data) {
            const data = res.data;
            setMealPlanId(data._id);
            const formattedPlan: MealPlanResponse = {
              Breakfast: normalizeMealSection(data.Breakfast),
              Lunch: normalizeMealSection(data.Lunch),
              Snack: normalizeMealSection(data.Snack),
              Dinner: normalizeMealSection(data.Dinner),
              TotalCalories: data.TotalCalories,
              TotalEstimatedCost: data.TotalEstimatedCost,
              WaterIntakeLiters: data.WaterIntakeLiters,
              Notes: data.Notes,
            };
            setMealPlan(formattedPlan);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.log("Meal plan not found, generating a new one.");
        }

        // Generate new meal plan
        const userProfile = await getUserProfileForMealGen(userId);
        const generateRes = await axios.post(
          "https://healthyeats-meal-xohb.onrender.com/generate-meal",
          userProfile
        );
        const generatedPlan = generateRes.data;

        const transformMealSectionForBackend = (section: any) => {
          if (!section) return undefined;
          return {
            Foods: section.Foods || [],
            Fruits: section.Fruits || [],
            Drinks_Tea: section["Drinks/Tea"] || [],
            Nutrition: section.Nutrition || "",
            EstimatedCost: section.EstimatedCost || "",
            recipe: null, // Initialize recipe as null
          };
        };

        const backendPayload = {
          userId,
          Breakfast: transformMealSectionForBackend(generatedPlan.Breakfast),
          Lunch: transformMealSectionForBackend(generatedPlan.Lunch),
          Snack: transformMealSectionForBackend(generatedPlan.Snack),
          Dinner: transformMealSectionForBackend(generatedPlan.Dinner),
          TotalCalories: generatedPlan.TotalCalories,
          TotalEstimatedCost: generatedPlan.TotalEstimatedCost,
          WaterIntakeLiters: generatedPlan.WaterIntakeLiters,
          Notes: generatedPlan.Notes,
        };

        // Save to backend and get ID
        const saveRes = await axios.post(`${API_URL}/api/mealplan/`, backendPayload);
        const savedPlan = saveRes.data;
        setMealPlanId(savedPlan._id);

        // Format for UI
        const formattedForUI: MealPlanResponse = {
          Breakfast: normalizeMealSection(generatedPlan.Breakfast),
          Lunch: normalizeMealSection(generatedPlan.Lunch),
          Snack: normalizeMealSection(generatedPlan.Snack),
          Dinner: normalizeMealSection(generatedPlan.Dinner),
          TotalCalories: generatedPlan.TotalCalories,
          TotalEstimatedCost: generatedPlan.TotalEstimatedCost,
          WaterIntakeLiters: generatedPlan.WaterIntakeLiters,
          Notes: generatedPlan.Notes,
        };
        // Add recipe field initialized to null
        formattedForUI.Breakfast.recipe = null;
        formattedForUI.Lunch.recipe = null;
        formattedForUI.Snack.recipe = null;
        formattedForUI.Dinner.recipe = null;
        
        setMealPlan(formattedForUI);
      } catch (error: any) {
        console.error("Error:", error.response?.data || error.message);
        Alert.alert(
          "Error",
          "Could not load or generate your meal plan. Please ensure your profile is complete and try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrGenerateMealPlan();
  }, []);

  const handleGenerateRecipe = async (mealType: string) => {
    if (!mealPlanId) {
      Alert.alert("Error", "Meal plan not loaded properly");
      return;
    }
    
    setCurrentMealType(mealType);
    
    // Check if recipe already exists
    const mealSection = mealPlan?.[mealType as keyof MealPlanResponse] as MealSection;
    if (mealSection?.recipe) {
      setCurrentRecipe(mealSection.recipe);
      setRecipeModalVisible(true);
      return;
    }

    // Generate new recipe
    setGeneratingForMeal(mealType);
    
    try {
      const token = await getToken();
      const response = await axios.post(
        `${API_URL}/api/meals/generate-recipe`,
        { mealId: mealPlanId, mealType },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update the meal plan with the new recipe
      if (mealPlan) {
        const updatedMealPlan = { ...mealPlan };
        updatedMealPlan[mealType as keyof MealPlanResponse] = {
          ...mealPlan[mealType as keyof MealPlanResponse],
          recipe: response.data.recipe
        };
        setMealPlan(updatedMealPlan);
      }

      setCurrentRecipe(response.data.recipe);
      setRecipeModalVisible(true);
    } catch (error) {
      console.error("Recipe generation failed:", error);
      Alert.alert("Error", "Failed to generate recipe. Please try again.");
    } finally {
      setGeneratingForMeal(null);
    }
  };

  const RenderSection = ({
    title,
    data,
  }: {
    title: string;
    data: string[];
  }) => (
    <View style={styles.detailSection}>
      <Text style={[styles.detailTitle, { color: accentColor }]}>{title}:</Text>
      {data && data.length > 0 ? (
        data.map((item: string, i: number) => (
          <Text key={i} style={[styles.detailItem, { color: textColor }]}>
            • {item}
          </Text>
        ))
      ) : (
        <Text style={[styles.detailItemEmpty, { color: secondaryText }]}>
          No items specified.
        </Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: bgColor }]}>
        <ActivityIndicator size="large" color={primaryColor} />
        <Text style={[styles.loadingText, { color: textColor }]}>
          Cooking up your meal plan...
        </Text>
      </View>
    );
  }

  if (!mealPlan) {
    return (
      <View style={[styles.centered, { backgroundColor: bgColor }]}>
        <Text style={[styles.errorText, { color: textColor }]}>
          Oops! No meal plan could be found.
        </Text>
        <Text style={[styles.errorSubText, { color: secondaryText }]}>
          Please ensure your profile is complete.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <LinearGradient
        colors={isDark ? ['#065f46', '#064e3b'] : ['#059669', '#047857']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Your Daily Meal Plan</Text>
      </LinearGradient>

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
              <RenderSection
                title="Drinks/Tea"
                data={section.DrinksOrTea}
              />

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
                style={[styles.button, { 
                  backgroundColor: generatingForMeal === mealType ? "#ccc" : primaryColor 
                }]}
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

          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: secondaryText }]}>
              Total Calories:{" "}
            </Text>
            <Text style={[styles.summaryValue, { color: textColor }]}>
              {mealPlan.TotalCalories || "N/A"}
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: secondaryText }]}>
              Estimated Cost:{" "}
            </Text>
            <Text style={[styles.summaryValue, { color: textColor }]}>
              {mealPlan.TotalEstimatedCost || "N/A"}
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: secondaryText }]}>
              Water Intake:{" "}
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

      {/* Recipe Modal */}
      <Modal
        visible={recipeModalVisible}
        animationType="slide"
        onRequestClose={() => setRecipeModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: bgColor }]}>
          <LinearGradient
            colors={isDark ? ['#065f46', '#064e3b'] : ['#059669', '#047857']}
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

              <View style={styles.stepsSection}>
                <Text style={[styles.sectionTitle, { color: primaryColor }]}>
                  Steps
                </Text>
                {currentRecipe.steps.map((step, index) => (
                  <View key={index} style={styles.stepItem}>
                    <Text style={[styles.stepNumber]} className="text-foreground">
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
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    // ... (previous styles remain the same)
    container: {
      flex: 1,
    },
    header: {
      height: 180,
      justifyContent: "center",
      alignItems: "center",
      paddingTop: 50,
      paddingHorizontal: 20,
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "bold",
      color: "white",
      textAlign: "center",
    },
    contentContainer: {
      padding: 16,
      paddingBottom: 40,
    },
    centered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
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
      marginTop: 8,
      textAlign: "center",
    },
    mealCard: {
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.1 : 0.05,
      shadowRadius: 8,
      elevation: isDark ? 3 : 5,
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
      shadowOpacity: isDark ? 0.1 : 0.05,
      shadowRadius: 8,
      elevation: isDark ? 3 : 5,
    },
    summaryTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 16,
    },
    summaryItem: {
      marginBottom: 12,
      flexDirection: "row",
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
      borderTopColor: isDark ? "#334155" : "#e2e8f0",
    },
    notesText: {
      fontSize: 14,
      lineHeight: 20,
      marginTop: 5,
    },
    // New modal styles
    modalContainer: {
      flex: 1,
    },
    modalHeader: {
      height: 200,
      justifyContent: "center",
      alignItems: "center",
      paddingTop: 40,
      paddingHorizontal: 20,
      flexDirection: "row",
    },
    modalTitle: {
      fontSize: 22,
      fontWeight: "bold",
      color: "white",
      textAlign: "center",
      flex: 1,
    },
    closeButton: {
      position: "absolute",
      right: 20,
      top: 50,
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
    },
    closeButtonText: {
      color: "white",
      fontSize: 24,
      fontWeight: "bold",
    },
    modalContent: {
      flex: 1,
      padding: 20,
    },
    centeredModal: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    ingredientsSection: {
      marginBottom: 25,
    },
    stepsSection: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 15,
    },
    ingredientItem: {
      fontSize: 16,
      marginLeft: 10,
      marginBottom: 8,
      lineHeight: 22,
    },
    stepItem: {
      flexDirection: "row",
      marginBottom: 15,
      alignItems: "flex-start",
    },
    stepNumber: {
      width: 30,
      height: 30,
      borderRadius: 15,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 10,
      marginTop: 3,
    },
    stepText: {
      fontSize: 16,
      flex: 1,
      lineHeight: 22,
    },
  });
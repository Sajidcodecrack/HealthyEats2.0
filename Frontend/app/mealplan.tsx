import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Constants from "expo-constants";
// This import assumes you have a helper file for token management.
// If not, you'll need to implement or replace this logic.
import { getToken } from "~/lib/tokenManager";

// --- TYPE DEFINITIONS ---
// Define the shape of a single meal section for the UI state
type MealSection = {
  Foods: string[];
  Fruits: string[];
  DrinksOrTea: string[]; // This is the consistent key for our frontend state
  Nutrition: string;
  EstimatedCost: string;
};

// Define the shape of the entire meal plan response for the UI state
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

// Get the API URL from Expo's constants
const API_URL = Constants.expoConfig?.extra?.apiUrl;

export default function MealPlanScreen() {
  const [mealPlan, setMealPlan] = useState<MealPlanResponse | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Normalizes a meal section from any source (our backend or external API)
   * into the consistent MealSection type for our UI state.
   * @param section - The raw meal section object.
   * @returns A normalized MealSection object.
   */
  const normalizeMealSection = (section: any): MealSection => {
    if (!section) {
      return {
        Foods: [],
        Fruits: [],
        DrinksOrTea: [],
        Nutrition: "",
        EstimatedCost: "",
      };
    }
    return {
      Foods: section.Foods ?? [],
      Fruits: section.Fruits ?? [],
      // This handles both "Drinks/Tea" from the external API and "Drinks_Tea" from our backend
      DrinksOrTea: section["Drinks/Tea"] ?? section.Drinks_Tea ?? [],
      Nutrition: section.Nutrition ?? "",
      EstimatedCost: section.EstimatedCost ?? "",
    };
  };

  /**
   * Fetches the user's profile and food preferences to build the payload
   * needed for meal generation.
   * @param userId - The ID of the user.
   * @returns An object containing the user's data for the meal generation API.
   */
  // Updated getUserProfileForMealGen function
  const getUserProfileForMealGen = async (userId: string) => {
    try {
      const token = await getToken();
      const profileRes = await axios.get(
        `${API_URL}/api/user-profile/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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
        heightFeet: profile.heightFeet, // Keep as feet
        heightInches: profile.heightInches, // Keep as inches
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

        // 1. Try fetching an existing meal plan from our backend
        try {
          const res = await axios.get(`${API_URL}/api/mealplan/${userId}`);
          if (res.data) {
            const data = res.data;
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
            return; // Meal plan found, we are done!
          }
        } catch (err) {
          console.log(
            "Meal plan not found on our backend, generating a new one."
          );
        }

        // 2. Generate a new meal plan using the external API
        const userProfile = await getUserProfileForMealGen(userId);
        const generateRes = await axios.post(
          "https://healthyeats-meal-xohb.onrender.com/generate-meal",
          userProfile
        );
        const generatedPlan = generateRes.data;

        // 3. Transform the generated data to match our backend's schema
        const transformMealSectionForBackend = (section: any) => {
          if (!section) return undefined;
          return {
            Foods: section.Foods || [],
            Fruits: section.Fruits || [],
            Drinks_Tea: section["Drinks/Tea"] || [], // Map "Drinks/Tea" to "Drinks_Tea"
            Nutrition: section.Nutrition || "",
            EstimatedCost: section.EstimatedCost || "",
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

        // 4. Save the correctly structured payload to our backend
        await axios.post(`${API_URL}/api/mealplan/`, backendPayload);

        // 5. Format the newly generated plan for display in the UI
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
        setMealPlan(formattedForUI);
      } catch (error: any) {
        console.error(
          "Error in fetchOrGenerateMealPlan:",
          error.response?.data || error.message
        );
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

  const handleGenerateRecipe = (mealType: string, foods: string[]) => {
    Alert.alert(
      "Generate Recipe",
      `This would generate a recipe for ${mealType} with: ${foods.join(", ")}.`
    );
  };

  const RenderSection = ({
    title,
    data,
  }: {
    title: string;
    data: string[];
  }) => (
    <View style={styles.detailSection}>
      <Text style={styles.detailTitle}>{title}:</Text>
      {data && data.length > 0 ? (
        data.map((item: string, i: number) => (
          <Text key={i} style={styles.detailItem}>
            • {item}
          </Text>
        ))
      ) : (
        <Text style={styles.detailItemEmpty}>No items specified.</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Cooking up your meal plan...</Text>
      </View>
    );
  }

  if (!mealPlan) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Oops! No meal plan could be found.</Text>
        <Text style={styles.errorSubText}>
          Please ensure your profile is complete.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.headerTitle}>Your Daily Meal Plan</Text>
      {(["Breakfast", "Lunch", "Snack", "Dinner"] as const).map((mealType) => (
        <View key={mealType} style={styles.mealCard}>
          <Text style={styles.mealTitle}>{mealType}</Text>

          <RenderSection title="Foods" data={mealPlan[mealType].Foods} />
          <RenderSection title="Fruits" data={mealPlan[mealType].Fruits} />
          <RenderSection
            title="Drinks/Tea"
            data={mealPlan[mealType].DrinksOrTea}
          />

          <View style={styles.detailSection}>
            <Text style={styles.detailTitle}>Nutrition:</Text>
            <Text style={styles.detailItem}>
              {mealPlan[mealType].Nutrition || "Not specified."}
            </Text>
          </View>

          <Text style={styles.costText}>
            Estimated Cost:{" "}
            <Text style={{ fontWeight: "bold" }}>
              {mealPlan[mealType].EstimatedCost || "N/A"}
            </Text>
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              handleGenerateRecipe(mealType, mealPlan[mealType].Foods)
            }
          >
            <Text style={styles.buttonText}>Generate Recipe</Text>
          </TouchableOpacity>
        </View>
      ))}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Daily Summary</Text>

        <Text style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Calories: </Text>
          <Text style={styles.summaryValue}>
            {mealPlan.TotalCalories || "N/A"}
          </Text>
        </Text>

        <Text style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Estimated Cost: </Text>
          <Text style={styles.summaryValue}>
            {mealPlan.TotalEstimatedCost || "N/A"}
          </Text>
        </Text>

        <Text style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Water Intake: </Text>
          <Text style={styles.summaryValue}>
            {mealPlan.WaterIntakeLiters || "N/A"}
          </Text>
        </Text>

        {mealPlan.Notes && (
          <View style={styles.notesSection}>
            <Text style={styles.summaryLabel}>Notes:</Text>
            <Text style={styles.notesText}>{mealPlan.Notes}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f8",
  },
  contentContainer: {
    padding: 16,
    paddingTop: 80, // For notch
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: "#333",
  },
  errorText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#d32f2f",
  },
  errorSubText: {
    fontSize: 16,
    marginTop: 8,
    textAlign: "center",
    color: "#555",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1b5e20",
    marginBottom: 24,
  },
  mealCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  mealTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2e7d32",
    marginBottom: 16,
  },
  detailSection: {
    marginBottom: 10,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#37474f",
    marginBottom: 4,
  },
  detailItem: {
    fontSize: 15,
    color: "#455a64",
    marginLeft: 8,
    lineHeight: 22,
  },
  detailItemEmpty: {
    fontSize: 14,
    color: "#78909c",
    marginLeft: 8,
    fontStyle: "italic",
  },
  costText: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#546e7a",
    marginTop: 8,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#43a047",
    paddingVertical: 12,
    borderRadius: 8,
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
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5, // Add some space between lines
  },
  summaryItem: {
    marginBottom: 10, // adds spacing between each line
    lineHeight: 22,
  },
  summaryLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#37474f",
  },
  summaryValue: {
    fontSize: 15,
    color: "#2e7d32",
  },

  notesSection: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
  },
  notesText: {
    fontSize: 13, // Even smaller for notes
    color: "#666",
    lineHeight: 18,
  },
});

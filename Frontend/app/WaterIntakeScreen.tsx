import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  TextInput,
  Modal,
  Animated,
  useColorScheme,
} from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const WaterIntakeScreen = () => {
  const navigation = useNavigation();
  const [waterIntake, setWaterIntake] = useState(0);
  const [goal, setGoal] = useState(0);
  const [userId, setUserId] = useState(null);
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [newGoal, setNewGoal] = useState("2000");
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const API_URL = `${Constants.expoConfig?.extra?.apiUrl}/api/water`;

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const intakePercentage =
    goal > 0 ? Math.min(100, (waterIntake / goal) * 100) : 0;

  // Theme colors based on dark/light mode
  const themeColors = useMemo(
    () => ({
      background: isDark ? "#111827" : "#ecf8fd",
      headerBg: isDark ? "#0c4a6e" : "#059669",
      headerGradient: isDark ? ["#0c4a6e", "#0891b2"] : ["#0c4a6e", "#0891b2"],
      cardBg: isDark ? "#2d3748" : "#fff",
      textPrimary: isDark ? "#f0fdf4" : "#065f46",
      textSecondary: isDark ? "#cbd5e0" : "#6b7280",
      waterText: isDark ? "#a5f3fc" : "#0891b2",
      progressBarBg: isDark ? "#4a5568" : "#d1fae5",
      waterLevelBg: isDark ? "#1e293b" : "#f0fdf4",
      waterLevelBorder: isDark ? "#0891b2" : "#0891b2",
      waterFillGradient: isDark
        ? ["#0ea5e9", "#0369a1"]
        : ["#22d3ee", "#0891b2"],
      buttonBg: isDark ? "#2d3748" : "#fff",
      buttonText: isDark ? "#22d3ee" : "#0891b2",
      modalBg: isDark ? "#2d3748" : "#fff",
      modalText: isDark ? "#f0fdf4" : "#000",
      inputBg: isDark ? "#4a5568" : "#fff",
      inputBorder: isDark ? "#4a5568" : "#ccc",
      setGoalButton: isDark ? "#0c4a6e" : "#059669",
      resetButtonText: isDark ? "#f0fdf4" : "#fff",
    }),
    [isDark]
  );

  const animateWater = (percentage: number) => {
    Animated.timing(animatedHeight, {
      toValue: percentage,
      duration: 800,
      useNativeDriver: false,
    }).start();
  };

  useEffect(() => {
    const init = async () => {
      const storedUid = await AsyncStorage.getItem("userId");
      if (!storedUid) return Alert.alert("Error", "User not logged in");
      setUserId(storedUid);
      fetchWaterData(storedUid);
    };
    init();
  }, []);

  const fetchWaterData = async (uid: string) => {
    try {
      const res = await fetch(`${API_URL}/status/${uid}`);
      const json = await res.json();

      if (!res.ok || !json.data) {
        console.log("No water data found. Waiting for goal setup.");
        return;
      }

      const intake = json.data.currentIntake || 0;
      const dailyGoal = json.data.dailyTarget || 0;
      setWaterIntake(intake);
      setGoal(dailyGoal);
      setNewGoal(dailyGoal.toString());
      animateWater((intake / dailyGoal) * 100);
    } catch (err: any) {
      console.error("Fetch water status failed", err.message);
      Alert.alert("Error", "Could not fetch water data");
    }
  };

  const updateIntake = async (amount: number) => {
    try {
      const res = await fetch(`${API_URL}/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, amount }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update intake");
      setWaterIntake(json.data.currentIntake);
      animateWater((json.data.currentIntake / goal) * 100);
    } catch (err: any) {
      console.error("Update intake failed", err.message);
      Alert.alert("Error", "Failed to update intake");
    }
  };

  const addWater = (amount: number) => {
    if (goal <= 0) {
      Alert.alert(
        "Set Goal First",
        "Please set your water goal before adding intake."
      );
      return;
    }
    updateIntake(amount);
  };

  const resetIntake = async () => {
    try {
      const resetAmount = -waterIntake;
      const res = await fetch(`${API_URL}/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, amount: resetAmount }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to reset");
      setWaterIntake(0);
      animateWater(0);
    } catch (err: any) {
      Alert.alert("Error", "Failed to reset intake");
    }
  };

  const updateGoal = async () => {
    try {
      const parsedGoal = parseInt(newGoal);
      if (isNaN(parsedGoal) || parsedGoal < 100) {
        return Alert.alert("Invalid goal", "Please enter a valid amount in ml");
      }

      const res = await fetch(`${API_URL}/set`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          dailyTarget: parsedGoal,
          reminderInterval: 60,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to set goal");

      setGoal(parsedGoal);
      setNewGoal(parsedGoal.toString());
      setGoalModalVisible(false);
      Alert.alert("Success", "Goal updated!");
      animateWater((waterIntake / parsedGoal) * 100);
    } catch (err: any) {
      console.error("Set goal failed", err.message);
      Alert.alert("Error", "Failed to update goal");
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[
            styles.backButton,
            { backgroundColor: "rgba(255,255,255,0.2)", position: "absolute", top: 70, left: 20, zIndex: 10},
          ]}
          
        >
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <LinearGradient
        colors={themeColors.headerGradient}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        
        <Text style={styles.headerTitle}>Water Intake</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {goal <= 0 ? (
          <View
            style={[
              styles.card,
              styles.cardShadow,
              { backgroundColor: themeColors.cardBg },
            ]}
          >
            <Text
              style={[styles.progressTitle, { color: themeColors.textPrimary }]}
            >
              No Goal Set
            </Text>
            <Text
              style={[styles.noGoalText, { color: themeColors.textSecondary }]}
            >
              Please set your daily water goal to begin tracking.
            </Text>
            <TouchableOpacity
              style={[
                styles.setGoalButton,
                { backgroundColor: themeColors.setGoalButton },
              ]}
              onPress={() => setGoalModalVisible(true)}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Set Goal</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={{ flexDirection: "row", gap: 10 }} className="my-5 justify-between">
              <TouchableOpacity onPress={() => setGoalModalVisible(true)}>
                <View className="bg-blue-500 px-4 py-2 rounded-full">
                <Text
                  style={[
                    styles.resetButton,
                    { color: themeColors.resetButtonText },
                  ]}
                >
                  Set Goal
                </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={resetIntake}>
                <View className="bg-red-700 px-4 py-2 rounded-full">
                <Text
                  style={[
                    styles.resetButton,
                    { color: themeColors.resetButtonText },
                  ]}
                >
                  Reset
                </Text>
                </View>
              </TouchableOpacity>
            </View>
            <View
              style={[
                styles.card,
                styles.cardShadow,
                { backgroundColor: themeColors.cardBg },
              ]}
            >
              <Text
                style={[
                  styles.progressTitle,
                  { color: themeColors.textPrimary },
                ]}
              >
                Today's Water Intake
              </Text>
              <View style={styles.waterVisualization}>
                <View
                  style={[
                    styles.waterLevel,
                    {
                      borderColor: themeColors.waterLevelBorder,
                      backgroundColor: themeColors.waterLevelBg,
                    },
                  ]}
                >
                  <Animated.View
                    style={[
                      styles.animatedWaterFill,
                      {
                        height: animatedHeight.interpolate({
                          inputRange: [0, 100],
                          outputRange: ["0%", "100%"],
                        }),
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={themeColors.waterFillGradient}
                      style={{ flex: 1, width: "100%" }}
                    />
                  </Animated.View>
                </View>
                <Text
                  style={[styles.waterAmount, { color: themeColors.waterText }]}
                >
                  {waterIntake}/{goal} ml
                </Text>
              </View>
              <Text
                style={[
                  styles.progressText,
                  { color: themeColors.textSecondary },
                ]}
              >
                {intakePercentage.toFixed(0)}% of daily goal
              </Text>
              <View
                style={[
                  styles.progressBar,
                  { backgroundColor: themeColors.progressBarBg },
                ]}
              >
                <LinearGradient
                  colors={themeColors.waterFillGradient}
                  style={[
                    styles.progressFill,
                    { width: `${intakePercentage}%` },
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
            </View>

            <View style={styles.buttonGrid}>
              {[100, 250, 500].map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.waterButton,
                    styles.cardShadow,
                    { backgroundColor: themeColors.buttonBg },
                  ]}
                  onPress={() => addWater(amount)}
                >
                  <Text
                    style={[
                      styles.waterButtonText,
                      { color: themeColors.buttonText },
                    ]}
                  >
                    +{amount}ml
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <Modal
        transparent
        visible={goalModalVisible}
        animationType="slide"
        onRequestClose={() => setGoalModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalBox, { backgroundColor: themeColors.modalBg }]}
          >
            <Text style={[styles.modalTitle, { color: themeColors.modalText }]}>
              Set Daily Water Goal (ml)
            </Text>
            <TextInput
              keyboardType="numeric"
              value={newGoal}
              onChangeText={setNewGoal}
              style={[
                styles.modalInput,
                {
                  backgroundColor: themeColors.inputBg,
                  borderColor: themeColors.inputBorder,
                  color: themeColors.modalText,
                },
              ]}
            />
            <TouchableOpacity
              style={[
                styles.modalSaveButton,
                { backgroundColor: themeColors.setGoalButton },
              ]}
              onPress={updateGoal}
            >
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setGoalModalVisible(false)}>
              <Text
                style={[
                  styles.modalCancelText,
                  { color: themeColors.textSecondary },
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 140,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: 40,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "center",
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
  resetButton: {
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 25,
  },
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  noGoalText: {
    textAlign: "center",
    marginBottom: 20,
  },
  waterVisualization: {
    alignItems: "center",
    marginBottom: 25,
    height: 200,
  },
  waterLevel: {
    position: "absolute",
    bottom: 20,
    width: 100,
    height: 140,
    borderWidth: 2,
    borderRadius: 20,
    overflow: "hidden",
  },
  animatedWaterFill: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  waterAmount: {
    fontSize: 24,
    fontWeight: "800",
    marginTop: 0,
  },
  progressText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 15,
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
  },
  buttonGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  waterButton: {
    width: "30%",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  waterButtonText: {
    fontSize: 18,
    fontWeight: "700",
  },
  setGoalButton: {
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalBox: {
    padding: 20,
    borderRadius: 16,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    width: "100%",
    padding: 10,
    marginBottom: 20,
    textAlign: "center",
    fontSize: 16,
  },
  modalSaveButton: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  modalSaveText: {
    color: "#fff",
    fontWeight: "700",
  },
  modalCancelText: {
    color: "#6b7280",
  },
});

export default WaterIntakeScreen;

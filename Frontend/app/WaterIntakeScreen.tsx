import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

const WaterIntakeScreen = () => {
  const navigation = useNavigation();
  const [waterIntake, setWaterIntake] = useState(0);
  const goal = 2000; // ml
  const intakePercentage = Math.min(100, (waterIntake / goal) * 100);

  const addWater = (amount: number) => {
    setWaterIntake(prev => Math.min(goal, prev + amount));
  };

  const resetIntake = () => {
    setWaterIntake(0);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={["#059669", "#34d399"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Water Intake</Text>
        <TouchableOpacity onPress={resetIntake}>
          <Text style={styles.resetButton}>Reset</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Progress Card */}
        <View style={[styles.card, styles.cardShadow]}>
          <Text style={styles.progressTitle}>Today's Water Intake</Text>
          
          {/* Water Drop Visualization */}
          <View style={styles.waterVisualization}>
            <View style={styles.waterLevel}>
              <LinearGradient
                colors={["#22d3ee", "#0891b2"]}
                style={[styles.waterFill, { height: `${intakePercentage}%` }]}
              />
            </View>
            <Text style={styles.waterAmount}>
              {waterIntake}/{goal} ml
            </Text>
          </View>
          
          <Text style={styles.progressText}>
            {intakePercentage.toFixed(0)}% of daily goal
          </Text>
          
          {/* Progress Bar */}
          <View style={styles.progressBar}>
            <LinearGradient
              colors={["#22d3ee", "#0891b2"]}
              style={[styles.progressFill, { width: `${intakePercentage}%` }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
        </View>

        {/* Quick Add Buttons */}
        <Text style={styles.sectionTitle}>Add Water</Text>
        <View style={styles.buttonGrid}>
          {[100, 250, 500].map((amount) => (
            <TouchableOpacity
              key={amount}
              style={[styles.waterButton, styles.cardShadow]}
              onPress={() => addWater(amount)}
            >
              <Text style={styles.waterButtonText}>+{amount}ml</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom Input */}
        <Text style={styles.sectionTitle}>Custom Amount</Text>
        <View style={styles.customInputContainer}>
          <TouchableOpacity
            style={[styles.customButton, styles.cardShadow]}
            onPress={() => addWater(100)}
          >
            <Text style={styles.customButtonText}>+ Add</Text>
          </TouchableOpacity>
          <View style={[styles.amountDisplay, styles.cardShadow]}>
            <Text style={styles.amountText}>100 ml</Text>
          </View>
        </View>

        {/* History */}
        <Text style={styles.sectionTitle}>Today's History</Text>
        <View style={[styles.historyCard, styles.cardShadow]}>
          <View style={styles.historyItem}>
            <Text style={styles.historyTime}>08:30 AM</Text>
            <Text style={styles.historyAmount}>250ml</Text>
          </View>
          <View style={styles.historyItem}>
            <Text style={styles.historyTime}>11:45 AM</Text>
            <Text style={styles.historyAmount}>500ml</Text>
          </View>
          <View style={styles.historyItem}>
            <Text style={styles.historyTime}>02:15 PM</Text>
            <Text style={styles.historyAmount}>250ml</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ecfdf5",
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
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  resetButton: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#fff",
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
    color: "#065f46",
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
    overflow: "hidden",
    borderRadius: 20,
  },
  waterFill: {
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  waterAmount: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0891b2",
    marginTop: 10,
  },
  progressText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 15,
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
    backgroundColor: "#d1fae5",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#065f46",
    marginBottom: 15,
    marginLeft: 5,
  },
  buttonGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  waterButton: {
    width: "30%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  waterButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0891b2",
  },
  customInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  customButton: {
    width: "30%",
    backgroundColor: "#059669",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  customButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  amountDisplay: {
    width: "65%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    justifyContent: "center",
  },
  amountText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#065f46",
    textAlign: "center",
  },
  historyCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  historyTime: {
    fontSize: 16,
    color: "#6b7280",
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0891b2",
  },
});

export default WaterIntakeScreen;
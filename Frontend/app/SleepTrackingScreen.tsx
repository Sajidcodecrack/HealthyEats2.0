import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  Alert,
  Keyboard,
} from "react-native";
import { ArrowLeft, Moon, Bed, AlarmClock } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";
import Constants from "expo-constants";

const SleepTrackingScreen = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  
  const [sleepDuration, setSleepDuration] = useState(7.5);
  const [sleepStart, setSleepStart] = useState("");
  const [sleepEnd, setSleepEnd] = useState("");
  const [userId, setUserId] = useState("");
  const [isStartFocused, setIsStartFocused] = useState(false);
  const [isEndFocused, setIsEndFocused] = useState(false);
  const startInputRef = useRef(null);
  const endInputRef = useRef(null);
  
  const API_URL = `${Constants.expoConfig?.extra?.apiUrl}/api/sleep`;
  
  // Theme colors
  const themeColors = {
    background: isDark ? "#0f172a" : "#f5f3ff",
    headerGradient: isDark ? ["#4f46e5", "#818cf8"] : ["#4f46e5", "#818cf8"],
    cardBg: isDark ? "#1e293b" : "#fff",
    textPrimary: isDark ? "#e2e8f0" : "#4f46e5",
    textSecondary: isDark ? "#94a3b8" : "#6b7280",
    inputBg: isDark ? "#334155" : "#eef2ff",
    inputText: isDark ? "#f1f5f9" : "#4b5563",
    inputBorder: isDark ? "#4f46e5" : "#818cf8",
    buttonBg: isDark ? "#4f46e5" : "#4f46e5",
    buttonText: isDark ? "#e2e8f0" : "#fff",
    progressFill: isDark ? "#818cf8" : "#4f46e5",
    progressBarBg: isDark ? "#334155" : "#e0e7ff",
    placeholder: isDark ? "#64748b" : "#9ca3af",
  };

  const sleepData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [7.2, 6.8, 7.5, 7.0, 6.5, 8.2, 7.8],
      },
    ],
  };

  useEffect(() => {
    const fetchUserId = async () => {
      const storedUserId = await AsyncStorage.getItem("userId");
      if (storedUserId) {
        setUserId(storedUserId);
        fetchWeeklyData(storedUserId);
      }
    };
    fetchUserId();
  }, []);

  const fetchWeeklyData = async (uid: string) => {
    try {
      const response = await fetch(`${API_URL}/weekly/${uid}`);
      const data = await response.json();
      if (response.ok) {
        // Process weekly data here
        console.log("Weekly sleep data:", data);
      }
    } catch (error) {
      console.error("Error fetching weekly sleep data:", error);
    }
  };

  const formatTimeInput = (text: string) => {
    // Remove non-numeric characters
    let cleaned = text.replace(/\D/g, '');
    
    // Automatically insert colon after 2 digits
    if (cleaned.length > 2) {
      cleaned = `${cleaned.slice(0, 2)}:${cleaned.slice(2, 4)}`;
    }
    
    // Limit to 5 characters (HH:MM)
    return cleaned.slice(0, 5);
  };

  const validateTime = (time: string) => {
    if (!time) return false;
    
    const [hours, minutes] = time.split(':');
    const hoursNum = parseInt(hours, 10);
    const minutesNum = parseInt(minutes || '0', 10);
    
    return (
      !isNaN(hoursNum) && 
      !isNaN(minutesNum) && 
      hoursNum >= 0 && 
      hoursNum <= 23 && 
      minutesNum >= 0 && 
      minutesNum <= 59
    );
  };

  const logSleep = async () => {
    Keyboard.dismiss();
    
    if (!validateTime(sleepStart)) {
      Alert.alert("Invalid Time", "Please enter a valid sleep start time (HH:MM)");
      startInputRef.current?.focus();
      return;
    }
    
    if (!validateTime(sleepEnd)) {
      Alert.alert("Invalid Time", "Please enter a valid wake up time (HH:MM)");
      endInputRef.current?.focus();
      return;
    }

    if (!userId) {
      Alert.alert("Error", "User not identified");
      return;
    }

    try {
      // Format dates to ISO strings
      const today = new Date().toISOString().split('T')[0];
      const sleepStartISO = `${today}T${sleepStart.padEnd(5, ':00')}`;
      const sleepEndISO = `${today}T${sleepEnd.padEnd(5, ':00')}`;
      
      const startDate = new Date(sleepStartISO);
      const endDate = new Date(sleepEndISO);
      
      // Adjust for overnight sleep
      if (endDate < startDate) {
        endDate.setDate(endDate.getDate() + 1);
      }
      
      // Calculate duration in hours
      const durationHours = (endDate - startDate) / (1000 * 60 * 60);
      setSleepDuration(durationHours);
      
      const response = await fetch(`${API_URL}/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          sleepStart: startDate.toISOString(),
          sleepEnd: endDate.toISOString(),
          reminderTime: "22:00"
        }),
      });

      if (response.ok) {
        Alert.alert("Success", "Sleep logged successfully!");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to log sleep");
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Something went wrong");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      {/* Header */}
      <LinearGradient
        colors={themeColors.headerGradient}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { backgroundColor: "rgba(255,255,255,0.2)" }]}
        >
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sleep Tracking</Text>
        <View style={{ width: 44 }} />
      </LinearGradient>

      <ScrollView 
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Sleep Log Card */}
        <View style={[styles.card, styles.cardShadow, { backgroundColor: themeColors.cardBg }]}>
          <View style={styles.sleepHeader}>
            <Moon size={28} color={themeColors.textPrimary} />
            <Text style={[styles.cardTitle, { color: themeColors.textPrimary }]}>
              Log Your Sleep
            </Text>
          </View>
          
          <View style={styles.sleepTimes}>
            <View style={styles.timeInputContainer}>
              <Text style={[styles.timeLabel, { color: themeColors.textSecondary }]}>
                Went to bed
              </Text>
              <TextInput
                ref={startInputRef}
                style={[
                  styles.timeInput, 
                  { 
                    backgroundColor: themeColors.inputBg,
                    color: themeColors.inputText,
                    borderColor: isStartFocused ? themeColors.inputBorder : 'transparent',
                  }
                ]}
                placeholder="23:15"
                placeholderTextColor={themeColors.placeholder}
                value={sleepStart}
                onChangeText={text => setSleepStart(formatTimeInput(text))}
                keyboardType="number-pad"
                maxLength={5}
                onFocus={() => setIsStartFocused(true)}
                onBlur={() => setIsStartFocused(false)}
                returnKeyType="next"
                onSubmitEditing={() => endInputRef.current?.focus()}
                blurOnSubmit={false}
              />
            </View>
            
            <View style={styles.timeInputContainer}>
              <Text style={[styles.timeLabel, { color: themeColors.textSecondary }]}>
                Woke up
              </Text>
              <TextInput
                ref={endInputRef}
                style={[
                  styles.timeInput, 
                  { 
                    backgroundColor: themeColors.inputBg,
                    color: themeColors.inputText,
                    borderColor: isEndFocused ? themeColors.inputBorder : 'transparent',
                  }
                ]}
                placeholder="06:45"
                placeholderTextColor={themeColors.placeholder}
                value={sleepEnd}
                onChangeText={text => setSleepEnd(formatTimeInput(text))}
                keyboardType="number-pad"
                maxLength={5}
                onFocus={() => setIsEndFocused(true)}
                onBlur={() => setIsEndFocused(false)}
                returnKeyType="done"
                onSubmitEditing={logSleep}
              />
            </View>
          </View>
          
          <TouchableOpacity 
            style={[
              styles.logButton, 
              { backgroundColor: themeColors.buttonBg }
            ]}
            onPress={logSleep}
          >
            <Text style={[styles.logButtonText, { color: themeColors.buttonText }]}>
              Log Sleep
            </Text>
          </TouchableOpacity>
          
          <Text style={[styles.inputHint, { color: themeColors.textSecondary }]}>
            Enter times in 24-hour format (HH:MM)
          </Text>
        </View>

        {/* Today's Sleep Stats */}
        <View style={[styles.card, styles.cardShadow, { backgroundColor: themeColors.cardBg }]}>
          <View style={styles.sleepHeader}>
            <AlarmClock size={28} color={themeColors.textPrimary} />
            <Text style={[styles.cardTitle, { color: themeColors.textPrimary }]}>
              Last Night's Sleep
            </Text>
          </View>
          
          <View style={styles.sleepStats}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: themeColors.textPrimary }]}>
                {sleepDuration.toFixed(1)}h
              </Text>
              <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
                Duration
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: themeColors.textPrimary }]}>
                92%
              </Text>
              <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
                Quality
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: themeColors.textPrimary }]}>
                4
              </Text>
              <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
                Cycles
              </Text>
            </View>
          </View>
        </View>

        {/* Weekly Chart */}
        <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
          Weekly Sleep Pattern
        </Text>
        <View style={[styles.chartCard, styles.cardShadow, { backgroundColor: themeColors.cardBg }]}>
          <BarChart
            data={sleepData}
            width={Dimensions.get("window").width - 80}
            height={220}
            yAxisLabel=""
            yAxisSuffix="h"
            chartConfig={{
              backgroundColor: themeColors.cardBg,
              backgroundGradientFrom: themeColors.cardBg,
              backgroundGradientTo: themeColors.cardBg,
              decimalPlaces: 1,
              color: (opacity = 1) => isDark ? `rgba(129, 140, 248, ${opacity})` : `rgba(79, 70, 229, ${opacity})`,
              labelColor: (opacity = 1) => isDark ? `rgba(226, 232, 240, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              barPercentage: 0.5,
            }}
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </View>

        {/* Sleep Goal */}
        <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
          Sleep Goal
        </Text>
        <View style={[styles.goalCard, styles.cardShadow, { backgroundColor: themeColors.cardBg }]}>
          <Text style={[styles.goalText, { color: themeColors.textSecondary }]}>
            Your Daily Sleep Goal
          </Text>
          <Text style={[styles.goalValue, { color: themeColors.textPrimary }]}>
            8 hours
          </Text>
          <View style={[styles.progressBar, { backgroundColor: themeColors.progressBarBg }]}>
            <View style={[
              styles.progressFill, 
              { 
                width: `${(sleepDuration / 8) * 100}%`,
                backgroundColor: themeColors.progressFill
              }
            ]} />
          </View>
          <Text style={[styles.goalStatus, { color: themeColors.textPrimary }]}>
            {sleepDuration >= 8 
              ? "Goal achieved! 🎉" 
              : `${(8 - sleepDuration).toFixed(1)} hours to go`}
          </Text>
        </View>

        {/* Sleep Tips */}
        <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
          Sleep Tips
        </Text>
        <View style={[styles.tipsCard, styles.cardShadow, { backgroundColor: themeColors.cardBg }]}>
          {[
            "Avoid caffeine 6 hours before bedtime",
            "Keep your bedroom cool and dark",
            "Establish a consistent sleep schedule",
            "Limit screen time before bed"
          ].map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <View style={[styles.tipBullet, { backgroundColor: themeColors.textPrimary }]} />
              <Text style={[styles.tipText, { color: themeColors.textSecondary }]}>
                {tip}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
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
  sleepHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 10,
  },
  sleepStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 16,
  },
  sleepTimes: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  timeInputContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  timeLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  timeInput: {
    fontSize: 20,
    fontWeight: "700",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 15,
    textAlign: "center",
    borderWidth: 2,
  },
  logButton: {
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  logButtonText: {
    fontSize: 18,
    fontWeight: "700",
  },
  inputHint: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
    fontStyle: "italic",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 15,
    marginLeft: 5,
  },
  chartCard: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 25,
    alignItems: "center",
  },
  goalCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 25,
  },
  goalText: {
    fontSize: 16,
    marginBottom: 5,
  },
  goalValue: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 15,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 10,
  },
  progressFill: {
    height: "100%",
    borderRadius: 5,
  },
  goalStatus: {
    fontSize: 16,
    fontWeight: "600",
  },
  tipsCard: {
    borderRadius: 24,
    padding: 24,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  tipBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  tipText: {
    fontSize: 16,
    flex: 1,
  },
});

export default SleepTrackingScreen;
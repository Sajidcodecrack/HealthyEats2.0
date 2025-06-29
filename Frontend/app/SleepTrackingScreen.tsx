import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { ArrowLeft, Moon, Bed, AlarmClock } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

const SleepTrackingScreen = () => {
  const navigation = useNavigation();
  const [sleepDuration, setSleepDuration] = useState(7.5);
  
  const sleepData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [7.2, 6.8, 7.5, 7.0, 6.5, 8.2, 7.8],
      },
    ],
  };

  const startSleep = () => {
    // In a real app, this would start tracking sleep
    Alert.alert("Sleep Tracking", "Sleep tracking has started");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={["#4f46e5", "#818cf8"]}
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
        <Text style={styles.headerTitle}>Sleep Tracking</Text>
        <View style={{ width: 44 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Today's Sleep Card */}
        <View style={[styles.card, styles.cardShadow]}>
          <View style={styles.sleepHeader}>
            <Moon size={28} color="#4f46e5" />
            <Text style={styles.cardTitle}>Last Night's Sleep</Text>
          </View>
          
          <View style={styles.sleepStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{sleepDuration}h</Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>92%</Text>
              <Text style={styles.statLabel}>Quality</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>4</Text>
              <Text style={styles.statLabel}>Cycles</Text>
            </View>
          </View>
          
          <View style={styles.sleepTimes}>
            <View>
              <Text style={styles.timeLabel}>Went to bed</Text>
              <Text style={styles.timeValue}>11:15 PM</Text>
            </View>
            <View>
              <Text style={styles.timeLabel}>Woke up</Text>
              <Text style={styles.timeValue}>6:45 AM</Text>
            </View>
          </View>
        </View>

        {/* Weekly Chart */}
        <Text style={styles.sectionTitle}>Weekly Sleep Pattern</Text>
        <View style={[styles.chartCard, styles.cardShadow]}>
          <BarChart
            data={sleepData}
            width={Dimensions.get("window").width - 80}
            height={220}
            yAxisLabel=""
            yAxisSuffix="h"
            chartConfig={{
              backgroundColor: "#fff",
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
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
        <Text style={styles.sectionTitle}>Sleep Goal</Text>
        <View style={[styles.goalCard, styles.cardShadow]}>
          <Text style={styles.goalText}>Your Daily Sleep Goal</Text>
          <Text style={styles.goalValue}>8 hours</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(sleepDuration / 8) * 100}%` }]} />
          </View>
          <Text style={styles.goalStatus}>
            {sleepDuration >= 8 ? "Goal achieved! 🎉" : `${(8 - sleepDuration).toFixed(1)} hours to go`}
          </Text>
        </View>

        {/* Start Tracking Button */}
        <TouchableOpacity 
          style={[styles.trackButton, styles.cardShadow]}
          onPress={startSleep}
        >
          <Bed size={24} color="#fff" />
          <Text style={styles.trackButtonText}>Start Sleep Tracking</Text>
        </TouchableOpacity>

        {/* Sleep Tips */}
        <Text style={styles.sectionTitle}>Sleep Tips</Text>
        <View style={[styles.tipsCard, styles.cardShadow]}>
          {[
            "Avoid caffeine 6 hours before bedtime",
            "Keep your bedroom cool and dark",
            "Establish a consistent sleep schedule",
            "Limit screen time before bed"
          ].map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <View style={styles.tipBullet} />
              <Text style={styles.tipText}>{tip}</Text>
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
    backgroundColor: "#f5f3ff",
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
  sleepHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4f46e5",
    marginLeft: 10,
  },
  sleepStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#4f46e5",
  },
  statLabel: {
    fontSize: 16,
    color: "#6b7280",
  },
  sleepTimes: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#eef2ff",
    borderRadius: 16,
    padding: 20,
  },
  timeLabel: {
    fontSize: 16,
    color: "#6b7280",
  },
  timeValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4f46e5",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4f46e5",
    marginBottom: 15,
    marginLeft: 5,
  },
  chartCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 16,
    marginBottom: 25,
    alignItems: "center",
  },
  goalCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    marginBottom: 25,
  },
  goalText: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 5,
  },
  goalValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#4f46e5",
    marginBottom: 15,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "#e0e7ff",
    overflow: "hidden",
    marginBottom: 10,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4f46e5",
    borderRadius: 5,
  },
  goalStatus: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4f46e5",
  },
  trackButton: {
    flexDirection: "row",
    backgroundColor: "#4f46e5",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,
  },
  trackButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginLeft: 10,
  },
  tipsCard: {
    backgroundColor: "#fff",
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
    backgroundColor: "#4f46e5",
    marginRight: 12,
  },
  tipText: {
    fontSize: 16,
    color: "#4b5563",
    flex: 1,
  },
});

export default SleepTrackingScreen;
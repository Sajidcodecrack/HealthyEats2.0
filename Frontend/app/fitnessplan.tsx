import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';

export default function FitnessPlan() {
  // State for form inputs
  const [formData, setFormData] = useState({
    age: '',
    gender: 'male',
    fitnessGoal: 'muscle_gain',
    experienceLevel: 'intermediate',
    equipment: ['dumbbells', 'bench'],
    healthConditions: 'none',
  });
  
  // State for API response
  const [fitnessPlan, setFitnessPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  // Equipment selection handler
  const toggleEquipment = (item) => {
    setFormData(prev => {
      if (item === 'none') {
        return {...prev, equipment: ['none']};
      }
      
      const newEquipment = prev.equipment.includes(item)
        ? prev.equipment.filter(e => e !== item)
        : [...prev.equipment.filter(e => e !== 'none'), item];
        
      return {...prev, equipment: newEquipment.length > 0 ? newEquipment : ['none']};
    });
  };

  // Submit handler
  const handleSubmit = async () => {
    // Validation
    if (!formData.age || isNaN(formData.age)) {
      Alert.alert('Invalid Age', 'Please enter a valid age');
      return;
    }

    setLoading(true);
    
    try {
      const payload = {
        age: parseInt(formData.age),
        gender: formData.gender,
        fitness_goal: formData.fitnessGoal,
        experience_level: formData.experienceLevel,
        available_equipment: formData.equipment.join(', '),
        health_conditions: formData.healthConditions,
      };

      const response = await fetch('http://127.0.0.1:8000/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setFitnessPlan(data.plan);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate fitness plan');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Render equipment options
  const renderEquipmentOptions = () => {
    const equipmentOptions = [
      'dumbbells', 
      'barbell', 
      'bench', 
      'resistance bands',
      'pull-up bar',
      'kettlebells',
      'none'
    ];

    return (
      <View style={styles.equipmentContainer}>
        <Text style={styles.label}>Available Equipment:</Text>
        <View style={styles.equipmentGrid}>
          {equipmentOptions.map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.equipmentButton,
                formData.equipment.includes(item) && styles.selectedEquipment
              ]}
              onPress={() => toggleEquipment(item)}
            >
              <Text style={styles.equipmentText}>{item.replace(/_/g, ' ')}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // Render fitness plan
  const renderPlan = () => {
    if (!fitnessPlan) return null;

    return (
      <ScrollView style={styles.planContainer}>
        {fitnessPlan.map((dayPlan) => (
          <View key={dayPlan.day} style={styles.dayContainer}>
            <Text style={styles.dayHeader}>{dayPlan.day}</Text>
            
            {dayPlan.exercises.length > 0 ? (
              dayPlan.exercises.map((exercise, index) => (
                <View key={index} style={styles.exerciseCard}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseDetail}>
                    <Text style={styles.bold}>Target:</Text> {exercise.target_muscle}
                  </Text>
                  <Text style={styles.exerciseDetail}>
                    <Text style={styles.bold}>Sets:</Text> {exercise.reps}
                  </Text>
                  <Text style={styles.exerciseDetail}>
                    <Text style={styles.bold}>Type:</Text> {exercise.type}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.restDay}>Rest Day</Text>
            )}
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>Create Your Fitness Plan</Text>

      {/* Age Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Age:</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={formData.age}
          onChangeText={(text) => setFormData({...formData, age: text})}
          placeholder="Enter your age"
        />
      </View>

      {/* Gender Selection */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Gender:</Text>
        <View style={styles.radioGroup}>
          {['male', 'female', 'other'].map((gender) => (
            <TouchableOpacity
              key={gender}
              style={styles.radioOption}
              onPress={() => setFormData({...formData, gender})}
            >
              <View style={styles.radioCircle}>
                {formData.gender === gender && <View style={styles.selectedRadio} />}
              </View>
              <Text style={styles.radioLabel}>{gender.charAt(0).toUpperCase() + gender.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Fitness Goal */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Fitness Goal:</Text>
        <View style={styles.radioGroup}>
          {[
            {id: 'muscle_gain', name: 'Muscle Gain'},
            {id: 'weight_loss', name: 'Weight Loss'},
            {id: 'strength', name: 'Strength'},
            {id: 'endurance', name: 'Endurance'},
          ].map((goal) => (
            <TouchableOpacity
              key={goal.id}
              style={styles.radioOption}
              onPress={() => setFormData({...formData, fitnessGoal: goal.id})}
            >
              <View style={styles.radioCircle}>
                {formData.fitnessGoal === goal.id && <View style={styles.selectedRadio} />}
              </View>
              <Text style={styles.radioLabel}>{goal.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Experience Level */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Experience Level:</Text>
        <View style={styles.radioGroup}>
          {['beginner', 'intermediate', 'advanced'].map((level) => (
            <TouchableOpacity
              key={level}
              style={styles.radioOption}
              onPress={() => setFormData({...formData, experienceLevel: level})}
            >
              <View style={styles.radioCircle}>
                {formData.experienceLevel === level && <View style={styles.selectedRadio} />}
              </View>
              <Text style={styles.radioLabel}>{level.charAt(0).toUpperCase() + level.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Equipment Selection */}
      {renderEquipmentOptions()}

      {/* Health Conditions */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Health Conditions:</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.healthConditions}
          onChangeText={(text) => setFormData({...formData, healthConditions: text})}
          placeholder="Describe any health conditions"
          multiline
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity 
        style={styles.submitButton} 
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitButtonText}>
          {loading ? 'Generating Plan...' : 'Generate Fitness Plan'}
        </Text>
      </TouchableOpacity>

      {/* Display Fitness Plan */}
      {fitnessPlan && renderPlan()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#444',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 10,
  },
  radioCircle: {
    height: 22,
    width: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#4a90e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  selectedRadio: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: '#4a90e2',
  },
  radioLabel: {
    fontSize: 16,
    color: '#555',
  },
  equipmentContainer: {
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  equipmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  equipmentButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    margin: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedEquipment: {
    backgroundColor: '#e0edff',
    borderColor: '#4a90e2',
  },
  equipmentText: {
    fontSize: 14,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginVertical: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  planContainer: {
    marginTop: 20,
  },
  dayContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dayHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4a90e2',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  exerciseCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4a90e2',
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  exerciseDetail: {
    fontSize: 15,
    color: '#555',
    marginBottom: 4,
  },
  bold: {
    fontWeight: '600',
  },
  restDay: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#888',
    textAlign: 'center',
    paddingVertical: 20,
  },
});
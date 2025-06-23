import React, { useState, useRef } from 'react';
import { View, Text, Image, Dimensions, TouchableOpacity, Platform, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const onboardingData = [
  {
    id: '1',
    tagline: 'Plan meals, track workouts, and stay on budget',
    description: 'Your personal wellness assistant that helps you achieve your health goals efficiently',
  },
  {
    id: '2',
    tagline: 'Smarter health, made just for you',
    description: 'AI-powered recommendations tailored to your unique needs and preferences',
  },
  {
    id: '3',
    tagline: 'Track progress and stay motivated',
    description: 'Visualize your journey with beautiful charts and milestone celebrations',
  },
];

const Onboarding = () => {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<any>(null);
  
  const isWeb = Platform.OS === 'web';
  const screenWidth = isWeb ? Math.min(width, 1200) : width;
  const containerWidth = isWeb ? Math.min(width * 0.8, 500) : width;

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const scrollTo = () => {
    if (currentIndex < onboardingData.length - 1) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.push('/signup');
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image 
        source={require('../assets/images/onboard.jpg')} 
        style={styles.backgroundImage}
        blurRadius={1}
      />
      
      {/* Gradient Overlay */}
      <LinearGradient
        colors={['rgba(5, 150, 105, 0.7)', 'rgba(6, 95, 70, 0.9)']}
        style={styles.gradientOverlay}
      />
      
      {/* Logo */}
      <Image 
        source={require('../assets/images/IconTransparent.png')}
        style={styles.logo}
      />
      
      {/* Carousel Container */}
      <View style={[styles.carouselContainer, { width: containerWidth }]}>
        <Animated.FlatList
          ref={slidesRef}
          data={onboardingData}
          renderItem={({ item }) => (
            <View style={[styles.slide, { width: containerWidth }]}>
              <View style={styles.imageContainer}>
                <Image 
                  style={styles.slideImage}
                  resizeMode="contain" 
                />
              </View>
              
              <View style={styles.textContainer}>
                <Text style={styles.tagline}>{item.tagline}</Text>
                <Text style={styles.description}>{item.description}</Text>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
        />
        
        {/* Pagination */}
        <View style={styles.pagination}>
          {onboardingData.map((_, i) => {
            const inputRange = [
              (i - 1) * containerWidth,
              i * containerWidth,
              (i + 1) * containerWidth,
            ];
            
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 20, 8],
              extrapolate: 'clamp',
            });
            
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            
            return (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  { width: dotWidth, opacity }
                ]}
              />
            );
          })}
        </View>
        
        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => router.push('/signup')}
            style={styles.primaryButton}
          >
            <Text style={styles.buttonText}>Create account</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push('/login')} 
            style={styles.secondaryButton}
          >
            <Text style={styles.loginText}>
              Have an account? <Text style={styles.loginLink}>Log in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#065f46',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradientOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  logo: {
    position: 'absolute',
    top: 120,
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  carouselContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  imageContainer: {
    borderRadius: 20,
    
    marginBottom: 0,
  },
  slideImage: {
    width: 300,
    height: 300,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  tagline: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 34,
  },
  description: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 30,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
    marginHorizontal: 4,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  primaryButton: {
    backgroundColor: 'white',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: '#065f46',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    padding: 10,
  },
  loginText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
  },
  loginLink: {
    color: 'white',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default Onboarding;
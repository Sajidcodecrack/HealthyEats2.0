// app/onboarding.tsx
import React, { useState, useRef } from 'react';
import { View, Text, Image, FlatList, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
const { width, height } = Dimensions.get('window');

const onboardingData = [
  {
    id: '1',
    image: require('../assets/images/onboarding/img1.png'),
    tagline: 'Plan meals, track workouts, and stay on budget',
  },
  {
    id: '2',
    image: require('../assets/images/onboarding/onboardin2.png'),
    tagline: 'Smarter health, made just for you',
  },
  {
    id: '3',
    image: require('../assets/images/onboarding/img3.png'),
    tagline: 'Track progress and stay motivated',
  },
];

const Onboarding = () => {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const slidesRef = useRef<FlatList>(null);
  
  const isWeb = Platform.OS === 'web';
  const screenWidth = isWeb ? Math.min(width, 1200) : width;
  const containerWidth = isWeb ? Math.min(width * 0.8, 500) : width;

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const onMomentumScrollEnd = (event: any) => {
    const slideWidth = isWeb ? containerWidth : width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideWidth);
    setCurrentIndex(index);
  };

  const renderItem = ({ item }: { item: { id: string; image: any; tagline: string } }) => (
    <View
      className="flex-1 justify-center items-center px-6"
      style={{ 
        width: isWeb ? containerWidth : width,
        maxWidth: isWeb ? 500 : undefined 
      }}
    >
      <Image 
        source={item.image} 
        className={`${isWeb ? 'w-[300px] h-[300px]' : 'w-[80%] h-1/2'} ${isWeb ? 'mb-8' : '-mt-64'}`}
        resizeMode="contain" 
        style={isWeb ? { width: 300, height: 300 } : undefined}
      />
      <Text
        className={`${isWeb ? 'text-3xl' : 'text-2xl'} font-bold text-center text-foreground dark:text-dark-foreground ${isWeb ? 'max-w-md' : ''}`}
      >
        {item.tagline}
      </Text>
    </View>
  );

  if (isWeb) {
    return (
      <View className="flex-1 bg-background dark:bg-dark-background">
        <View className="flex-1 justify-center items-center" style={{ maxWidth: screenWidth, alignSelf: 'center' }}>
          <FlatList
            ref={slidesRef}
            data={onboardingData}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            bounces={false}
            onViewableItemsChanged={viewableItemsChanged}
            onMomentumScrollEnd={onMomentumScrollEnd}
            viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
            contentContainerStyle={{ alignItems: 'center' }}
            style={{ maxWidth: containerWidth }}
          />
          
          {/* Pagination for Web */}
          <View className="flex-row justify-center items-center mb-8">
            {onboardingData.map((_, i) => (
              <View
                key={i}
                className={`h-3 w-3 rounded-full mx-2 ${i === currentIndex ? 'bg-primary' : 'bg-gray-300'}`}
              />
            ))}
          </View>
          
          {/* Bottom Buttons for Web */}
          <View className="flex items-center justify-center pb-8">
            <TouchableOpacity
              onPress={() => router.push('/signup')}
              className="bg-primary w-80 py-4 px-2 rounded-full items-center mb-6"
            >
              <Text className="text-white text-lg font-semibold">Create account</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/login')} className="items-center">
              <Text className="text-lg text-foreground dark:text-white">
                Have an account? <Text className="text-primary font-semibold">Log in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Original mobile layout (unchanged)
  return (
    <View className="flex-1 bg-background dark:bg-dark-background ">
      <FlatList
        ref={slidesRef}
        data={onboardingData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={viewableItemsChanged}
        onMomentumScrollEnd={onMomentumScrollEnd}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
      />
      {/* Pagination */}
      <View className="absolute bottom-64 w-full flex-row justify-center items-center">
        {onboardingData.map((_, i) => (
          <View
            key={i}
            className={`h-2 w-2 rounded-full mx-1 ${i === currentIndex ? 'bg-primary' : 'bg-gray-300'}`}
          />
        ))}
      </View>
      {/* Fixed Bottom Section */}
      <View className="absolute bottom-0 w-full px-6 pb-28 flex items-center justify-center">
        <TouchableOpacity
          onPress={() => router.push('/signup')}
          className="bg-primary w-60 py-4 px-2 rounded-full items-center mb-4"
        >
          <Text className="text-white text-sm font-semibold">Create account</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/login')} className="items-center">
          <Text className="text-base text-foreground dark:text-white">
            Have an account? <Text className="text-primary font-semibold">Log in</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Onboarding;
import { Image } from 'expo-image';
import { useState } from 'react';
import type { ImageSourcePropType } from 'react-native';
import { StyleSheet } from 'react-native';

import type { FoodCategory } from '@/lib/database.types';

const categoryImages: Record<FoodCategory, ImageSourcePropType> = {
  produce: require('../../assets/images/Creative commons/mixed-produce.jpg'),
  dairy: require('../../assets/images/Creative commons/grain-bowl.jpg'),
  bakery: require('../../assets/images/Creative commons/Home_made_sour_dough_bread.jpg'),
  prepared: require('../../assets/images/Creative commons/grain-bowl.jpg'),
  pantry: require('../../assets/images/Creative commons/grain-bowl.jpg'),
  other: require('../../assets/images/Creative commons/mixed-produce.jpg'),
};

export function FoodListingArtwork({
  category,
  imageUrl,
}: {
  category: FoodCategory;
  imageUrl: string | null;
}) {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const showUploadedImage = imageUrl !== null && failedImageUrl !== imageUrl;

  if (showUploadedImage) {
    return (
      <Image
        accessibilityLabel={`${category} listing`}
        contentFit="cover"
        source={{ uri: imageUrl }}
        style={styles.photo}
        onError={() => setFailedImageUrl(imageUrl)}
        transition={150}
      />
    );
  }

  return (
    <Image
      accessibilityLabel="Food shared locally"
      contentFit="cover"
      source={categoryImages[category]}
      style={styles.photo}
      transition={150}
    />
  );
}

const styles = StyleSheet.create({
  photo: {
    width: '100%',
    height: 250,
    borderRadius: 16,
    overflow: 'hidden',
  },
});

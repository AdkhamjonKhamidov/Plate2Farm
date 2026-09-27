import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import type { FoodCategory } from '@/lib/database.types';

const artwork: Record<
  FoodCategory,
  { background: string; accent: string; foods: [string, string, string]; label: string }
> = {
  produce: {
    background: '#E8EFDC',
    accent: '#527644',
    foods: ['🥕', '🍅', '🥬'],
    label: 'Fresh from the field',
  },
  dairy: {
    background: '#E3EDF1',
    accent: '#527A91',
    foods: ['🥛', '🧀', '🥚'],
    label: 'Local dairy & farm goods',
  },
  bakery: {
    background: '#F2E8D9',
    accent: '#9A7043',
    foods: ['🍞', '🥐', '🥖'],
    label: 'Baked fresh, shared locally',
  },
  prepared: {
    background: '#F2E5DC',
    accent: '#9A604A',
    foods: ['🥗', '🍲', '🥘'],
    label: 'Ready to share',
  },
  pantry: {
    background: '#EAE5F0',
    accent: '#70618D',
    foods: ['🫘', '🌾', '🥫'],
    label: 'Good food, saved for later',
  },
  other: {
    background: '#E8EFDC',
    accent: '#527644',
    foods: ['🍎', '🌽', '🌱'],
    label: 'Good food, shared nearby',
  },
};

export function FoodListingArtwork({
  category,
  imageUrl,
}: {
  category: FoodCategory;
  imageUrl: string | null;
}) {
  const art = artwork[category];

  if (imageUrl) {
    return (
      <Image
        accessibilityLabel={`${category} listing`}
        contentFit="cover"
        source={{ uri: imageUrl }}
        style={styles.photo}
        transition={150}
      />
    );
  }

  return (
    <View
      accessibilityLabel={`Illustration: ${art.label}`}
      accessible
      style={[styles.illustration, { backgroundColor: art.background }]}>
      <View style={styles.topline}>
        <Text style={[styles.eyebrow, { color: art.accent }]}>PLATE2FARM · FOOD RESCUE</Text>
        <View style={[styles.dot, { backgroundColor: art.accent }]} />
      </View>
      <View style={styles.foodRow}>
        {art.foods.map((food, index) => (
          <View
            key={`${food}-${index}`}
            style={[
              styles.food,
              index === 1 && styles.heroFood,
              {
                backgroundColor:
                  index === 1 ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.48)',
              },
            ]}>
            <Text style={[styles.foodEmoji, index === 1 && styles.heroEmoji]}>{food}</Text>
          </View>
        ))}
      </View>
      <Text style={[styles.caption, { color: art.accent }]}>{art.label}</Text>
      <View style={[styles.rule, { backgroundColor: art.accent }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  photo: {
    width: '100%',
    height: 170,
    borderRadius: 16,
  },
  illustration: {
    width: '100%',
    height: 170,
    justifyContent: 'space-between',
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 16,
  },
  topline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrow: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  food: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26,
  },
  heroFood: {
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  foodEmoji: {
    fontSize: 28,
  },
  heroEmoji: {
    fontSize: 38,
  },
  caption: {
    alignSelf: 'center',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  rule: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    opacity: 0.55,
  },
});

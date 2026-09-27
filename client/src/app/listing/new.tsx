import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  fieldStyles,
  Notice,
  PageHeading,
  Palette,
  PrimaryButton,
  Screen,
} from '@/components/app-ui';
import LocationPicker from '@/components/location-picker';
import { useAuth } from '@/providers/auth-provider';
import {
  PICKUP_RADIUS_OPTIONS,
  type FoodCategory,
  type FoodUnit,
  type PickupRadiusMiles,
} from '@/lib/database.types';
import { createFoodListing } from '@/lib/food-listings';
import { validateListing } from '@/lib/validation';

const categories: Array<{ label: string; value: FoodCategory }> = [
  { label: 'Produce', value: 'produce' },
  { label: 'Dairy', value: 'dairy' },
  { label: 'Bakery', value: 'bakery' },
  { label: 'Prepared', value: 'prepared' },
  { label: 'Pantry', value: 'pantry' },
  { label: 'Other', value: 'other' },
];

const units: FoodUnit[] = ['items', 'kg', 'lb', 'boxes', 'bags', 'meals'];

export default function NewListingScreen() {
  const router = useRouter();
  const canGoBack = router.canGoBack();
  const { profile } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<FoodCategory>('produce');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<FoodUnit>('boxes');
  const [pickupAddress, setPickupAddress] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [pickupRadiusMiles, setPickupRadiusMiles] = useState<PickupRadiusMiles>(25);
  const [pickupWindow, setPickupWindow] = useState<'today' | 'tomorrow'>('today');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    if (!profile || profile.account_type !== 'provider') {
      setError('Only food provider accounts can create listings.');
      return;
    }

    const input = {
      title,
      description,
      category,
      quantity,
      unit,
      pickupAddress,
      latitude,
      longitude,
      pickupRadiusMiles,
      pickupWindow,
    };
    const validationError = validateListing(input);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (latitude === null || longitude === null) {
      setError('Choose the pickup point on the map.');
      return;
    }

    setError(null);
    setIsSaving(true);
    try {
      await createFoodListing(
        {
          ...input,
          latitude,
          longitude,
        },
        profile,
      );
      router.replace('/(tabs)/listings');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to create this listing.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Screen>
      <PageHeading
        eyebrow="Share local supplies"
        title="Create a listing"
        subtitle="Add what is available and set a clear pickup point for nearby farmers."
      />

      <View style={fieldStyles.group}>
        <Text style={fieldStyles.label}>Food or supply name</Text>
        <TextInput
          accessibilityLabel="Food or supply name"
          autoCapitalize="sentences"
          maxLength={120}
          onChangeText={setTitle}
          placeholder="Fresh tomatoes"
          placeholderTextColor="#9AA095"
          value={title}
          style={fieldStyles.input}
        />
      </View>

      <View style={fieldStyles.group}>
        <Text style={fieldStyles.label}>Description (optional)</Text>
        <TextInput
          accessibilityLabel="Description"
          maxLength={1000}
          multiline
          onChangeText={setDescription}
          placeholder="Share a little more about this offer"
          placeholderTextColor="#9AA095"
          value={description}
          style={[fieldStyles.input, fieldStyles.multiline]}
        />
      </View>

      <View style={fieldStyles.group}>
        <Text style={fieldStyles.label}>Category</Text>
        <View style={styles.options}>
          {categories.map((option) => (
            <OptionChip
              key={option.value}
              label={option.label}
              selected={category === option.value}
              onPress={() => setCategory(option.value)}
            />
          ))}
        </View>
      </View>

      <View style={styles.quantityRow}>
        <View style={[fieldStyles.group, styles.quantityInput]}>
          <Text style={fieldStyles.label}>Quantity</Text>
          <TextInput
            accessibilityLabel="Quantity"
            keyboardType="decimal-pad"
            maxLength={12}
            onChangeText={setQuantity}
            placeholder="10"
            placeholderTextColor="#9AA095"
            value={quantity}
            style={fieldStyles.input}
          />
        </View>
        <View style={[fieldStyles.group, styles.unitInput]}>
          <Text style={fieldStyles.label}>Unit</Text>
          <View style={styles.options}>
            {units.map((option) => (
              <OptionChip
                key={option}
                label={option}
                selected={unit === option}
                onPress={() => setUnit(option)}
              />
            ))}
          </View>
        </View>
      </View>

      <View style={fieldStyles.group}>
        <Text style={fieldStyles.label}>Pickup address</Text>
        <TextInput
          accessibilityLabel="Pickup address"
          autoCapitalize="words"
          maxLength={300}
          onChangeText={setPickupAddress}
          placeholder="Street address, city, state"
          placeholderTextColor="#9AA095"
          value={pickupAddress}
          style={fieldStyles.input}
        />
      </View>

      <View style={fieldStyles.group}>
        <Text style={fieldStyles.label}>Pin the pickup location</Text>
        <Text style={styles.helper}>
          Tap the map where farmers should collect this supply.
        </Text>
        <LocationPicker
          latitude={latitude}
          longitude={longitude}
          onSelect={(nextLatitude, nextLongitude) => {
            setLatitude(nextLatitude);
            setLongitude(nextLongitude);
          }}
        />
        {latitude !== null && longitude !== null ? (
          <Text style={styles.coordinates}>
            Pickup point selected · {latitude.toFixed(5)}, {longitude.toFixed(5)}
          </Text>
        ) : null}
      </View>

      <View style={fieldStyles.group}>
        <Text style={fieldStyles.label}>Pickup area</Text>
        <Text style={styles.helper}>
          Farmers must be within this distance of the pickup point to see this offer.
        </Text>
        <View style={styles.options}>
          {PICKUP_RADIUS_OPTIONS.map((radius) => (
            <OptionChip
              key={radius}
              label={`${radius} mi`}
              selected={pickupRadiusMiles === radius}
              onPress={() => setPickupRadiusMiles(radius)}
            />
          ))}
        </View>
      </View>

      <View style={fieldStyles.group}>
        <Text style={fieldStyles.label}>Pickup window</Text>
        <View style={styles.windowOptions}>
          <OptionChip
            label="Today · next 4 hours"
            selected={pickupWindow === 'today'}
            onPress={() => setPickupWindow('today')}
          />
          <OptionChip
            label="Tomorrow · 9–11 AM"
            selected={pickupWindow === 'tomorrow'}
            onPress={() => setPickupWindow('tomorrow')}
          />
        </View>
        <Text style={styles.helper}>
          The listing automatically closes when its pickup window ends.
        </Text>
      </View>

      {error ? <Notice>{error}</Notice> : null}
      <PrimaryButton disabled={isSaving} onPress={() => void handleSubmit()}>
        {isSaving ? 'Publishing…' : 'Publish food listing'}
      </PrimaryButton>
      {canGoBack ? (
        <PrimaryButton
          variant="secondary"
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            }
          }}>
          Go back
        </PrimaryButton>
      ) : null}
    </Screen>
  );
}

function OptionChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.option, selected && styles.optionSelected]}>
      <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    borderWidth: 1,
    borderColor: '#DDE4D7',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: '#FFFFFF',
  },
  optionSelected: {
    backgroundColor: Palette.softGreen,
    borderColor: '#A9BD94',
  },
  optionText: {
    color: '#536151',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  optionTextSelected: {
    color: Palette.forest,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  quantityInput: {
    width: 110,
  },
  unitInput: {
    flex: 1,
  },
  windowOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  helper: {
    color: Palette.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  coordinates: {
    color: Palette.forest,
    fontSize: 12,
    fontWeight: '700',
  },
});

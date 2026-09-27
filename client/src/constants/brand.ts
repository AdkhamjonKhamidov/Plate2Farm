import type { ImageSourcePropType } from 'react-native';

export const BRAND_NAME = 'Leftover';
export const BRAND_TAGLINE = 'Leftovers, made good.';

export const BRAND_LOGO: ImageSourcePropType =
  require('../../assets/images/main_logo1.png');

// Use a remote URI or a static require('@/assets/branding/hero.jpg') for a bundled image.
export const BRAND_IMAGES = {
  hero: {
    uri: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=85',
  },
} as const;

export const BRAND_HERO_ACCESSIBILITY_LABEL = 'Fresh produce ready to be rescued';

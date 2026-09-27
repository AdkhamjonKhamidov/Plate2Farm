module.exports = ({ config }) => {
  const iosMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY?.trim();
  const androidMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY?.trim();
  const nativeMapsConfig = {
    ...(iosMapsApiKey ? { iosGoogleMapsApiKey: iosMapsApiKey } : {}),
    ...(androidMapsApiKey ? { androidGoogleMapsApiKey: androidMapsApiKey } : {}),
  };

  return {
    ...config,
    ios: {
      ...config.ios,
      infoPlist: {
        ...config.ios?.infoPlist,
        NSLocationWhenInUseUsageDescription:
          'Your location helps find nearby food pickup offers.',
      },
    },
    plugins: [
      ...(config.plugins ?? []),
      ...(Object.keys(nativeMapsConfig).length
        ? [['react-native-maps', nativeMapsConfig]]
        : []),
    ],
  };
};

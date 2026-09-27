# Brand assets

Place replacement brand files in this folder, then update `src/constants/brand.ts`:

- For a bundled logo, set `BRAND_LOGO` to a static require such as `require('@/assets/branding/logo.png')`. Until one is configured, the app uses a leaf mark.
- To change the landing photo, replace `BRAND_IMAGES.hero` with an image URL or a static require such as `require('@/assets/branding/hero.jpg')`. Update `BRAND_HERO_ACCESSIBILITY_LABEL` to describe the replacement image. It is cropped to fit the responsive hero card.

The configured logo is shared by the landing page, auth screens, and app splash mark.

# Leftover

Leftover helps good food find another purpose. **Leftovers, made good.**

## Run the app

```bash
npm install
npm run web
```

Start the Expo development server with `npm start` to run on a device or emulator.

## Project notes

- The landing screen adapts between compact and wide screens and scrolls when its content needs more room.
- Replace the logo and hero image through `src/constants/brand.ts`; see `assets/branding/README.md` for the asset workflow.
- The sign-in, sign-up, and password-reset forms are frontend structure only. No Supabase client or authentication calls are connected yet. Sign-up form values are shaped for a future Supabase `signUp` call, including `full_name` user metadata.

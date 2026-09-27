# Leftover

Leftover helps good food find another purpose. **Leftovers, made good.**

## Run the app

### Requirements

- Node.js (LTS) and npm
- For Android or iOS, an emulator/simulator or a device with Expo Go. iOS simulator requires macOS.

### Install dependencies

From the `client` folder:

```bash
npm install
```

### Start the app on any platform

From the `client` folder, run:

```bash
npx expo start
```

Expo starts one development server for all platforms. Use its terminal shortcuts:

- Press `w` to open the web app in your browser.
- Press `a` to open Android (with an Android emulator running).
- Press `i` to open the iOS simulator (macOS required).
- To use a physical phone, install Expo Go and scan the QR code shown by Expo.

You can also start the same Expo server with `npm start`.

-------------------- Developer notes --------------------

- The landing screen adapts between compact and wide screens and scrolls when its content needs more room.
- Replace the logo and hero image through `src/constants/brand.ts`; see `assets/branding/README.md` for the asset workflow.
- The sign-in, sign-up, and password-reset forms are frontend structure only. No Supabase client or authentication calls are connected yet. Sign-up form values are shaped for a future Supabase `signUp` call, including `full_name` user metadata.
- Type-check with `npx tsc --noEmit` and lint with `npm run lint`.

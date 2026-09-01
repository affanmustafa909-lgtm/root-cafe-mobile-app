# Roots Café — Customer Mobile App

Expo (dev client) React Native customer application for order-ahead pickup.

## Requirements

- Node.js 20+
- Running [backend](../backend) API (`http://localhost:3000`)
- Expo dev client build for push notifications (Expo Go alone is insufficient for native FCM tokens)

## Setup

```bash
cd mobile
cp .env.example .env
npm install
npm start
```

Set `EXPO_PUBLIC_API_URL` to your machine IP when testing on a physical device (not `localhost`).

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Metro bundler only (use this after the first native build) |
| `npm run android` | Native debug build for the local **x86_64** emulator |
| `npm run android:device` | Native debug build for a physical **arm64** Android phone |
| `npm run ios` | iOS simulator (native compile) |
| `npm test` | Unit tests |

JS/TS changes do not need a native rebuild — keep Metro running with `npm start` and reload the app. Only rerun `android` / `ios` after adding a native module or changing `app.config.ts` plugins.

## EAS dev client

```bash
npx eas build --profile development --platform ios
npx eas build --profile development --platform android
```

Configure `GOOGLE_SERVICES_JSON` (Android) and APNs credentials via EAS for production push delivery.

## Features (V1)

- Register / login (JWT + secure storage)
- Dynamic menu, product customizations, cart
- ASAP & scheduled pickup (config from `GET /settings/app`)
- Pay at café orders
- Real-time order tracking (Socket.IO + polling fallback)
- Push token registration (FCM via expo-notifications dev client)
- English default UI with German toggle
- Profile edit & GDPR account deletion

## Test account

`customer@rootscafe.local` / `Password123!` (from backend seed)

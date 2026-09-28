# Aslal Mobile

Aslal Mobile is the mobile operational client for the existing Aslal Growth OS. It is intentionally not a copy of the public website.

## Architecture
- Expo / React Native
- Existing Aslal authentication and workspace authorization
- Existing Aslal APIs
- SecureStore for session material
- Expo SQLite for persistent local/outbox state
- No direct MySQL/database access from the mobile app

## Contracts
- `docs/mobile/MOBILE-PRODUCT-CONTRACT.md`
- `docs/mobile/OFFLINE-SYNC-CONTRACT.md`
- `docs/mobile/ROLE-BASED-MOBILE-IA.md`

## Development
```bash
cd mobile
npm install
npm run typecheck
npx expo-doctor
npx expo start
```

If Expo dependencies need alignment:
```bash
npx expo install --fix
npx expo-doctor
```

## Offline foundation

This branch includes the persistent SQLite outbox schema. It does **not** claim that queued operations are synchronized to production yet.

Before advertising full offline mutations, implement an authenticated, workspace-scoped sync API with operation-id idempotency and explicit conflict responses.

## APK
```bash
npx eas project:init
npx eas build --platform android --profile preview
```

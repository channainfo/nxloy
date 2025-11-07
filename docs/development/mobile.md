# Mobile Development Guide

**Last Updated**: 2025-11-08

[← Back to README](../../README.md) | [Development Guides](../development/)

---

## Overview

The NxLoy mobile app is built with **React Native** and **Expo**, supporting iOS, Android, and web platforms with a unified codebase.

**Current Status**: 🚧 Development mode works, production builds need eas.json configuration

**Technology Stack**:
- **React Native**: 0.76.x
- **Expo**: Latest SDK
- **Navigation**: React Navigation
- **UI Components**: React Native Paper / Custom components
- **State Management**: Zustand (planned)

---

## Prerequisites

Before developing the mobile app, install these platform-specific tools:

### For iOS Development (macOS only)

**Xcode**: 14.0 or later ([Mac App Store](https://apps.apple.com/us/app/xcode/id497799835))
```bash
xcode-select --install
```

**CocoaPods**: 1.11.0 or later
```bash
sudo gem install cocoapods
```

**iOS Simulator**: Included with Xcode

### For Android Development

**Android Studio**: Latest stable ([Download](https://developer.android.com/studio))
- **Java JDK**: 17 or later (bundled with Android Studio)
- **Android SDK**: API Level 33+ (install via Android Studio)
- **Android Emulator**: Install via Android Studio AVD Manager

### For All Platforms

**Expo CLI**: Installed automatically with dependencies

**EAS CLI** (for builds):
```bash
npm install -g eas-cli
```

**Metro Bundler**: Included with React Native

---

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Install iOS Native Dependencies (macOS only)

```bash
cd apps/mobile/ios
pod install
cd ../../..
```

### 3. Configure Expo

```bash
cd apps/mobile
# Login to Expo account (optional for development)
npx expo login
```

---

## Development Workflow

### Start Metro Bundler

```bash
nx run mobile:start
# Metro bundler available at: http://localhost:8082
```

### Run on iOS Simulator (macOS only)

```bash
nx run mobile:run-ios

# Run on specific device
nx run mobile:run-ios --device="iPhone 15 Pro"

# Run on physical device
nx run mobile:run-ios --device="Your iPhone Name"
```

### Run on Android Emulator/Device

```bash
nx run mobile:run-android

# Run on specific emulator
nx run mobile:run-android --device="Pixel_7_API_33"

# Run on physical device (USB debugging enabled)
nx run mobile:run-android --device
```

### Run on Web (development only)

```bash
nx run mobile:serve
# Available at: http://localhost:8082
```

---

## Building for Production (📋 Planned - Needs eas.json)

**Note**: Production builds require `eas.json` configuration file which is not yet created.

### iOS Production Build (requires Apple Developer account + eas.json)

```bash
cd apps/mobile
# First, create eas.json with build profiles
eas build --platform ios --profile production
```

### Android Production Build (requires eas.json)

```bash
cd apps/mobile
eas build --platform android --profile production
```

### Generate APK for Testing (requires eas.json)

```bash
cd apps/mobile
eas build --platform android --profile preview
```

### Create eas.json

```bash
cd apps/mobile
eas build:configure
# Follow prompts to set up build profiles
```

---

## Testing

### Run Unit Tests

```bash
nx test mobile
```

### Run with Coverage

```bash
nx test mobile --coverage
```

### Test on Multiple Devices

- Use Expo Go app for quick testing on physical devices
- Scan QR code from Metro bundler output

---

## Debugging

### Enable React DevTools

```bash
# Shake device or press Cmd+D (iOS) / Cmd+M (Android)
# Select "Debug JS Remotely"
```

### View Logs

```bash
# iOS logs
npx react-native log-ios

# Android logs
npx react-native log-android
```

### Clear Metro Cache

```bash
nx run mobile:start --reset-cache
```

---

## Mobile Architecture

### Directory Structure

```
apps/mobile/
├── src/
│   ├── app/              # App entry point and navigation
│   ├── components/       # Reusable React Native components
│   ├── screens/          # Screen components
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   ├── types/            # TypeScript types (use @nxloy/shared-types)
│   └── assets/           # Images, fonts, etc.
├── ios/                  # iOS native code
├── android/              # Android native code
├── app.json              # Expo configuration
└── project.json          # Nx configuration
```

### Platform-Specific Code

When you need platform-specific implementations:

```typescript
// Using Platform module
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  container: {
    marginTop: Platform.OS === 'ios' ? 20 : 0,
  },
});

// Using platform-specific files
// MyComponent.ios.tsx - iOS version
// MyComponent.android.tsx - Android version
// MyComponent.tsx - Shared fallback
```

---

## Common Mobile Development Issues

### Metro bundler won't start

**Cause**: Port 8082 in use or cache corruption

**Solution**:
```bash
# Kill existing Metro process
lsof -ti:8082 | xargs kill

# Clear Metro cache
nx run mobile:start --reset-cache
```

### iOS build fails with "Command PhaseScriptExecution failed"

**Cause**: CocoaPods dependencies not installed or outdated

**Solution**:
```bash
cd apps/mobile/ios
pod deintegrate
pod install
cd ../../..
nx run mobile:run-ios
```

### Android build fails with "SDK location not found"

**Cause**: Android SDK path not configured

**Solution**:
```bash
# Create local.properties file
echo "sdk.dir=$HOME/Library/Android/sdk" > apps/mobile/android/local.properties

# Or for Linux
echo "sdk.dir=$HOME/Android/Sdk" > apps/mobile/android/local.properties
```

### Expo Go app shows "Unable to connect to Metro"

**Cause**: Firewall blocking connection or wrong network

**Solution**:
- Ensure phone and computer are on same WiFi network
- Try connecting via tunnel: `nx run mobile:start --tunnel`
- Check firewall settings to allow port 8082

### React Native version mismatch errors

**Cause**: Conflicting React Native versions in dependencies

**Solution**:
```bash
pnpm install
cd apps/mobile/ios
pod install --repo-update
cd ../../..
```

### "Build input file cannot be found" (iOS)

**Cause**: Xcode workspace issues

**Solution**:
```bash
cd apps/mobile/ios
xcodebuild clean
rm -rf ~/Library/Developer/Xcode/DerivedData/*
pod install
cd ../../..
```

---

## Best Practices

### Performance Optimization

- Use `React.memo()` for expensive components
- Implement `FlatList` for long lists (not `ScrollView` with `.map()`)
- Optimize images with appropriate sizes
- Use native driver for animations: `useNativeDriver: true`

### Code Organization

- Keep screens focused on navigation and layout
- Extract business logic into custom hooks
- Use shared components from `src/components/`
- Import shared types from `@nxloy/shared-types`

### Testing Mobile Components

- Test component rendering with React Native Testing Library
- Test navigation flows
- Test platform-specific behavior
- Use factories for test data (no mocks)

---

## Related Documentation

- [Backend Development](./backend.md) - NestJS API integration
- [Web Development](./web.md) - Next.js web counterpart
- [Architecture](../../ARCHITECTURE.md) - System architecture
- [Troubleshooting](../../README.md#troubleshooting) - Additional solutions

---

**Cross-Platform Development**: Changes to `@nxloy/shared-*` packages affect both web and mobile apps. Always test both platforms when modifying shared code.

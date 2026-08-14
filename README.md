# Wayk

An alarm app that doesn't let you snooze your way back to sleep. You pick a wake time, a "mission" you have to complete before the alarm will actually stop (push-ups, a math problem, photographing your bed made, etc.), and Wayk builds a personalized morning plan around it. This repo is the onboarding flow and app shell, built in React Native.

## Demo

_Full Video: [Watch here](https://drive.google.com/file/d/1R4oCvM3MKR30JF7ktZXXKV7O_MWrVMCn/view?usp=sharing)_

[Preview](https://github.com/user-attachments/assets/f47bae93-6a22-4472-9fd0-02a37e873185)

## Tech stack

- **React Native 0.86** (RN CLI, not Expo) + **React 19**, **TypeScript**
- **react-native-reanimated** / the built-in `Animated` API for screen transitions and micro-interactions
- **react-native-svg** for the custom illustrations (sunrise scene, wake-receipt art, speed gauge, signature pad)
- **react-native-safe-area-context** for safe-area handling across devices
- **@react-native-vector-icons** (Ionicons + Material Design Icons)
- **react-native-tracking-transparency** for the iOS ATT prompt
- Jest + `react-test-renderer` for the test setup

The flow is driven by a single typed `Screen` union in `App.tsx` rather than a routing library, which keeps full control over the custom per-screen transitions built with Reanimated/`Animated`. Sign-in, referral, and account-creation screens are built and ready to connect to backend services.

## Project structure

```text
App.tsx                  # root component — the screen state machine
index.js                 # RN entry point

src/
  screens/                # one file per onboarding screen (see below)
  components/             # shared pieces used by multiple screens
    LanguageSheet.tsx      # bottom sheet for language selection
    RollingText.tsx        # odometer-style rolling text transition
  theme/
    colors.ts              # shared color tokens

assets/
  images/                 # app-store rating badge, DNA illustration, etc.

android/                 # native Android project
ios/                      # native iOS project
```

## The flow

Onboarding is one continuous funnel, roughly in this order:

1. **Sky onboarding** — animated sunrise intro
2. **Plan intro** — value prop, App Store rating, "Build my plan" CTA
3. **Questionnaire** — sleep habits survey, split into segments around a few interstitials (energy levels, mission preview, biology explainer)
4. **Wake time / wake goal / wake target** — figures out the user's current routine and target
5. **Mission select** — pick the task that has to be completed to silence the alarm (Object Hunt, Push Ups, Squats, Math Problem, Sky Photo, Make Your Bed)
6. **Alarm setup** — days, alarm sound, mission-alarm pairing preview
7. **Referral source / code, speed gauge, notification permission, commitment** — a signature pad where the user actually signs a commitment to their wake time
8. **Setup loading** — animated progress screen while the plan is "assembled"
9. **Morning Plan preview** — a recap of the plan, shown before the referral/account gates
10. **Referral unlock → Create account** — a referral ask and a (currently mocked) sign-in gate
11. **Morning Plan (final)** — same recap screen, now the actual landing destination

Progress through the questionnaire/setup portion is tracked as a fraction of one continuous progress bar rather than resetting per segment, so the constants for each screen's `progress` value live in `QuestionnaireScreen.tsx`.

## Getting started

```sh
npm install

# iOS only, first run and after any native dependency changes
bundle install
bundle exec pod install --project-directory=ios
```

Start Metro:

```sh
npm start
```

Then, in a separate terminal:

```sh
npm run ios       # or
npm run android
```

## Scripts

- `npm start` — Metro bundler
- `npm run ios` / `npm run android` — build + launch on simulator/emulator
- `npm run lint` — ESLint
- `npm test` — Jest

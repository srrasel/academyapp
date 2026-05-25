# Bridge Academy (React Native)

Onboarding flow for **Bridge Academy – Become a Life Coach**, built with Expo and a modular folder structure.

## Folder structure

Each UI piece lives in its own folder with a **component file** and a **styles file** (React Native uses `StyleSheet` instead of `.css`):

```
src/
  components/
    PrimaryButton/
      PrimaryButton.js
      PrimaryButton.styles.js
    ...
  screens/
    WelcomeScreen/
      WelcomeScreen.js
      WelcomeScreen.styles.js
    ...
  navigation/
  theme/
  data/
```

## Run the app

```bash
npm install
npx expo start -c
```

Then scan the QR code with **Expo Go** (must be updated from Play Store / App Store).

**Expo SDK 54** — if you see “incompatible with this version of Expo Go”, update the Expo Go app on your phone. The project was downgraded from SDK 56 for compatibility.

## Flow

### Onboarding
1. **Welcome** → Language → Create Account → Goal → Learning Journey  
2. **Start Learning** opens the main app (bottom tabs)

### Main app (5 screens + tabs)
| Screen | Tab / Stack |
|--------|-------------|
| Home | Home tab |
| My Learning | My Learning tab |
| Course Overview | Stack (from Home / My Learning) |
| All Units | Stack |
| Unit Detail | Stack |
| Lesson Video | Stack — from unit subunits |
| Lesson Audio | Stack |
| Unit Quiz | Stack |
| Progress Dashboard | Progress tab |
| Achievements & Certificates | Profile tab |
| Community | Placeholder tab |

## Custom images

Replace URLs in `src/data/images.js` with local files:

```js
welcome: require('../../assets/images/welcome.jpg'),
```

## Note on “CSS” files

React Native does not use browser CSS. Each component folder has a matching `*.styles.js` file (for example `PrimaryButton.styles.js`) — the same idea as a separate CSS file, using `StyleSheet.create()`.

## Project status

All 5 onboarding screens are wired with navigation. The Android bundle builds successfully (`npx expo export --platform android`).

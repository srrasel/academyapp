# Firebase Setup — Bridge Academy

This app uses **Firebase Auth**, **Firestore**, and **Storage**. A web **admin panel** lives in `admin/`.

## 1. Create a Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a project (e.g. `bridge-academy`)
3. Enable **Authentication → Email/Password**
4. Create a **Firestore** database (production mode)
5. Enable **Storage** (optional, for video/audio uploads)

## 2. Register the mobile app

1. Add a **Web app** in Firebase (Expo uses the JS SDK)
2. Copy the config values into `.env` at the project root:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

3. Restart Expo after changing env vars:

```bash
npx expo start -c
```

## 3. Admin panel env

Copy the same Firebase values into `admin/.env`:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Install and run:

```bash
cd admin
npm install
npm run dev
```

Or from the project root: `npm run admin`

## 4. Deploy security rules

Install Firebase CLI, login, and deploy:

```bash
npx firebase-tools login
npx firebase-tools deploy --only firestore:rules,firestore:indexes,storage --project YOUR_PROJECT_ID
```

**Or run the all-in-one bootstrap** (creates admin, seeds course, uploads translations):

```bash
npm run setup:firebase
```

This uses `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env` (defaults: `admin@bridgeacademy.com` / `BridgeAdmin2026!`).

## 5. Create your first admin user

1. Sign up in the mobile app with email/password
2. In Firebase Console → Firestore → `users/{uid}`, set:

```json
{ "role": "admin" }
```

Or open **Admin → Users** and click **Make admin** (requires an existing admin).

## 6. Seed course content

1. Log into the admin panel
2. Open **Dashboard**
3. Click **Seed General Psychology Course** (21 units, 199 lessons)
4. Click **Upload All Translations** to push all languages to Firebase

## 7. Without Firebase (local demo)

If `.env` is empty, the app runs in **guest mode**:

- Email sign-up/login stores a local session
- Progress saves to AsyncStorage
- Mock course data is used

## Firestore collections

| Collection | Purpose |
|------------|---------|
| `users` | Profiles, roles, onboarding |
| `users/{uid}/meta/progress` | Lesson completion, quiz scores |
| `courses` | Main course metadata |
| `units` | Course units |
| `lessons` | Video, audio, quiz content |
| `communityPosts` | Community feed |
| `appConfig` | Quote of the day, global settings |
| `translations/{locale}` | Translation metadata per language |
| `translations/{locale}/bundles/{ui\|course\|units\|lessons}` | Bundled JSON for offline app sync |

## 11. Translations (Firebase + admin)

1. Generate local translation files:

```bash
npm run translate
```

This also syncs files to `admin/public/` for the admin panel.

2. Start admin panel: `npm run admin`
3. Log in as admin → **Dashboard** → **Upload All Translations**
   Or use **Translations** page to upload per language.

4. Mobile app downloads translations from Firestore and caches them in AsyncStorage for offline use. Bundled JSON is used as fallback when Firebase is unavailable.

Manual sync only (no re-translate):

```bash
npm run sync:translations
```

## 12. Add users from admin

1. Admin → **Users** → **Add user**
2. Enter email, password, display name, role, and language
3. User can log in on the mobile app immediately

Note: Deleting a user profile in admin removes the Firestore document only. Remove the Auth account in Firebase Console if needed.

Deploy updated Firestore rules (includes `translations` collection):

```bash
firebase deploy --only firestore:rules
```

## 8. Google Sign-In

Uses **native** Google Sign-In (`@react-native-google-signin/google-signin`) — no browser, which avoids Google “Access blocked” / redirect_uri errors from web OAuth.

1. Firebase Console → **Authentication → Sign-in method → Google** → Enable
2. Copy the **Web client ID** into `.env` (must be `client_type` 3 from this Firebase project’s `google-services.json`):

```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=1035786415301-3hln8akff6qg0cf5mi12kgt77boa67n8.apps.googleusercontent.com
```

Do **not** paste a Web client ID from a different Google Cloud / Firebase project — Firebase will reject the ID token (`auth/invalid-credential`).

3. Android OAuth clients (package `com.bridgeacademy.app` + SHA-1) are created via Firebase when you add fingerprints. Keep `google-services.json` in the project root.

4. If Google still shows **Access blocked** / “app is in testing”:
   - Google Cloud Console → **OAuth consent screen** → add your Google account under **Test users**, or publish the app.
   - Confirm SHA-1 fingerprints match the APK signing key (see below).

### Android SHA fingerprints (Google Play App Signing)

Package name: `com.bridgeacademy.app`

Add these SHA fingerprints in Firebase Console → **Project settings** → your Android app → **Add fingerprint**.  
Without the upload key, Google Sign-In fails on Play Store / release builds signed with your upload keystore.

**Upload key** (Play Console → App signing → Upload key certificate — used for Google Sign-In on release APKs you upload):

| Type | Fingerprint |
|------|-------------|
| SHA-1 | `E8:5E:FC:66:18:DD:19:A5:CF:A0:17:31:D2:84:1C:7E:BC:94:E2:73` |
| SHA-256 | `6E:AD:B4:EB:7F:AC:16:D8:A0:32:6A:4B:64:4F:ED:9A:D0:F6:72:CE:CE:39:47:E3:41:3E:F6:53:09:2C:65:FD` |
| MD5 | `C0:A4:25:30:B8:A1:C6:2D:0F:79:40:CA:73:6C:4D:45` |

**App signing key** (Google Play may resign the app — also add if shown in Play Console):

| Type | Fingerprint |
|------|-------------|
| SHA-1 | `4E:9A:35:A0:A9:5D:26:C2:4E:74:F1:CD:94:0B:E0:B4:EB:5B:27:65` |
| SHA-256 | `EF:74:1B:EF:B6:91:10:62:B1:A8:2D:5B:3C:9D:18:AC:6C:FC:D7:A8:77:43:A3:DC:F9:C4:90:38:07:BB:D7:6F` |

**Legacy / other upload key** (keep if already registered):

| Type | Fingerprint |
|------|-------------|
| SHA-1 | `8D:98:00:FC:CD:D9:05:54:D1:1D:C4:19:A7:92:31:1D:C7:3D:EC:20` |
| SHA-256 | `95:B1:70:A2:4F:C1:25:D0:30:1E:CA:BF:E3:3B:EE:8E:90:23:3F:67:0F:5B:5D:2A:8B:15:2E:91:E1:A7:56:84` |

After adding fingerprints in Firebase, download a fresh `google-services.json`, wait a few minutes for Google OAuth clients to update, then rebuild the APK.

## 9. Facebook Sign-In

1. Firebase Console → **Authentication → Sign-in method → Facebook** → Enable  
   Paste your Meta **App ID** and **App Secret** there (secret stays in Firebase only).
2. Copy the **App ID** and **Client token** into the mobile app `.env` (never put the App Secret in the app):

```env
EXPO_PUBLIC_FACEBOOK_APP_ID=YOUR_NUMERIC_APP_ID
EXPO_PUBLIC_FACEBOOK_CLIENT_TOKEN=YOUR_CLIENT_TOKEN
```

Client token: Meta for Developers → your app → **Settings → Advanced → Security → Client token**.

3. In [Meta for Developers](https://developers.facebook.com/) → your app:
   - **Facebook Login → Settings** → Valid OAuth Redirect URIs:
     - `https://academy-4f825.firebaseapp.com/__/auth/handler`
     - `fbYOUR_APP_ID://authorize`
   - **Settings → Basic → Add Platform → Android**:
     - Package name: `com.bridgeacademy.app`
     - Class name: `com.bridgeacademy.app.MainActivity`
     - Key hashes (Base64 of SHA-1):
       - Upload key: `6F78ZhjdGaXPoBcx0oQcfryU4nM=`
       - Play App Signing: `Tpo1oKldJsJOdPHNlAvgtOtbJ2U=`
       - Legacy: `jZgA/M3ZBVTRHcQZp5IxHcc97CA=`

4. Rebuild the APK after changing Facebook env / plugins (`npx expo prebuild` runs inside `npm run build:apk:windows`).

Native Facebook Login uses the Facebook app / system sheet (not a Chrome tab) when possible.

### “Feature unavailable / updating additional details”

This message comes from **Meta**, not from Bridge Academy code. The app cannot override it.

Fix it in [Meta for Developers](https://developers.facebook.com/apps/):

1. Open your app → confirm mode is **Live** (not Development) if real users should sign in.
2. Complete any banners under **Required actions** / **App Review** (privacy policy URL, data use checkup, business verification if prompted).
3. Under **Use cases → Authentication / Facebook Login**, ensure `public_profile` and `email` are added and not stuck incomplete.
4. **Settings → Basic**: set **Privacy Policy URL**, **App icon**, **Category**, and contact email.
5. While the app is in Development (or Live but blocked for outsiders): **App roles → Roles** → add the Facebook account as **Administrator**, **Developer**, or **Tester**. Role users can usually log in even when public login is blocked.
6. Toggle Advanced Access for `email` / `public_profile` if Meta shows “Get advanced access” (or decrease then re-request if stuck on “Ready to publish”).

Until Meta clears that screen, Google / email sign-in still work.

## 10. Apple Sign-In

1. Firebase Console → **Authentication → Sign-in method → Apple** → Enable
2. Requires **iOS device** (not available in Expo Go on Android)
3. For production iOS builds, configure Apple Sign-In in Apple Developer portal and link to Firebase
4. `app.json` already includes `usesAppleSignIn: true`

## 11. Admin media uploads

1. Enable **Firebase Storage** in your project
2. Deploy storage rules: `firebase deploy --only storage`
3. In **Admin → Lessons**, upload video/audio files or paste URLs
4. Files are stored at `course-media/{unitId}/{lessonId}/`

## What's functional now

- Email auth + onboarding persistence
- Course/units/lessons from Firestore
- Video player (expo-av) with completion tracking
- Audio player with play/pause, skip, speed
- Multi-question quizzes with score saving
- Progress dashboard from real user data
- Community posts (read/create)
- Profile tab with sign out
- Admin CRUD for courses, units, lessons, users, community
- **Google & Apple sign-in** (Firebase Auth)
- **Admin video/audio/thumbnail uploads** to Firebase Storage

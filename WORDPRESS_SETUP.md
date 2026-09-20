# Connect WordPress (MasterStudy) → Bridge Academy App

Your site: [bridge-academy.vn](https://bridge-academy.vn/wp-admin/)  
Target course: [Life Coach Base Course – General Psychology](https://bridge-academy.vn/en/courses-3/general-course/)

| WordPress | Value |
|-----------|-------|
| Course URL | `https://bridge-academy.vn/en/courses-3/general-course/` |
| WordPress Post ID | **6382** |
| App course ID | `general-psychology` |
| Units | **21** (Introduction + 20 units) |
| Lessons | **199** (126 text + 73 quizzes) |

---

## ✅ Already done in this project

The app can import the **full curriculum** (all units + lesson titles + WordPress lesson IDs) from your public course page:

```bash
npm run import:course
```

This writes:

- `src/data/imported/course.json`
- `src/data/imported/units.json`
- `src/data/imported/lessons.json`

Enable in `.env`:

```env
EXPO_PUBLIC_USE_IMPORTED_COURSE=true
EXPO_PUBLIC_WORDPRESS_URL=https://bridge-academy.vn
EXPO_PUBLIC_WORDPRESS_COURSE_ID=6382
```

Restart Expo:

```bash
npx expo start -c
```

The app will show **Life Coach Base Course – General Psychology** with all 21 chapters and 199 lessons.

---

## What works now vs what needs WordPress access

| Feature | Status |
|---------|--------|
| All unit/chapter names | ✅ Imported |
| All lesson titles & order | ✅ Imported |
| Open text lesson in app | ✅ WebView (lesson page) |
| Quiz screen | ✅ Opens (sample questions until WP quiz API connected) |
| Full lesson HTML/video inside app | ⚠️ Needs login or API |
| Mark complete sync to WordPress | ⚠️ Needs MasterStudy API plugin |
| Student must purchase course on web | ⚠️ Enrolment checked on WordPress |

---

## What you need to enable on WordPress

### 1. Install MasterStudy LMS API plugin (recommended)

Your site currently has **partial** API only (`stm-lms/v1/courses` works; `ms_lms/v1/login` returns 404).

1. Log in: [wp-admin](https://bridge-academy.vn/wp-admin/)
2. **Plugins → Add New** → install **MasterStudy LMS API** (from your StylemixThemes license)
3. Activate and open **API Settings**
4. Docs: [MasterStudy LMS API Plugin Setup](https://docs.stylemixthemes.com/masterstudy-app-documentation/masterstudy-lms-api-plugin-setup)

After install, these should work:

```
https://bridge-academy.vn/wp-json/ms_lms/v1/login
https://bridge-academy.vn/wp-json/ms_lms/v1/course?id=6382
https://bridge-academy.vn/wp-json/ms_lms/v1/course_curriculum
```

### 2. Create an Application Password (for content sync)

1. wp-admin → **Users → Your Profile**
2. Scroll to **Application Passwords**
3. Create one named `Bridge Academy App`
4. Share the password securely (not in chat) so we can sync lesson content + quizzes to Firebase

### 3. Permalinks

**Settings → Permalinks → Post name** → Save

---

## How MasterStudy maps to the app

| MasterStudy (WordPress) | Bridge Academy app |
|-------------------------|-------------------|
| **Course** (post 6382) | Main course |
| **Section** (curriculum) | **Unit** / chapter |
| **Text lesson** | Text lesson (WebView) |
| **Quiz** | Quiz lesson |

---

## Option A — Sync WordPress → Firebase (recommended for production)

```
WordPress (edit courses)
        ↓  import script + admin
Firebase Firestore
        ↓
Mobile app (fast, offline)
```

1. Run `npm run import:course` to refresh structure
2. With WP API credentials, sync lesson **content** (video URLs, quiz questions) to Firestore
3. Use admin panel (`npm run admin`) to manage content

---

## Option B — App calls WordPress API directly

Requires MasterStudy API plugin + student login:

- `POST /wp-json/ms_lms/v1/login`
- `POST /wp-json/ms_lms/v1/course/lesson` (lesson content)
- `PUT /wp-json/ms_lms/v1/course/lesson/complete`

Code: `src/services/wordpressService.js`

---

## Re-import after you change the course on WordPress

Whenever you add/edit lessons on the website:

```bash
npm run import:course
npx expo start -c
```

---

## Send us to finish full download inside the app

1. Confirm **MasterStudy LMS API** plugin is installed  
2. A **test student account** (email + password) enrolled in course 6382  
3. Or an **Application Password** for an admin account  

Then we can connect:

- Real quiz questions from WordPress  
- Video/audio URLs inside the app (no browser login)  
- Progress sync back to WordPress when a lesson is completed  

---

## API reference

- [MasterStudy API v1](https://stylemixthemes.com/masterstudy/api.php)
- [MasterStudy REST v2](https://www.gpltimes.com/wordpress-plugins/masterstudy-lms-pro-wordpress-lms-review/) (`stm-lms/v2/` when available)

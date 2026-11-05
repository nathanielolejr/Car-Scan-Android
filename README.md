# Car Scan

An Android app that scans a vehicle QR code with the phone camera and checks it against an online
database. If the car exists, its details are shown; otherwise the app says **“Car not in registry.”**

- **App:** React Native + [Expo](https://expo.dev) (TypeScript) – develop entirely in VS Code
- **Database + login:** [Supabase](https://supabase.com) free tier (Postgres + email/password auth)

```
Login screen ──► Camera scanner ──► Supabase lookup ──► ✅ car details  /  ❌ not in registry
```

## 1. Set up the free database (≈5 min)

1. Create a free account at <https://supabase.com> and click **New project**.
2. Open **SQL Editor → New query**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql)
   and click **Run**. This creates the `cars` table, locks it so only signed-in users can read it,
   and adds 3 sample cars.
3. Create a user who can log in: **Authentication → Users → Add user → Create new user**
   (enter an email + password, tick *Auto Confirm User*).
4. *(Recommended)* **Authentication → Sign In / Providers → Email**: turn **off** “Allow new users to
   sign up” so only accounts you create can use the app.
5. Open **Project Settings → API** and copy the **Project URL** and the **anon public** key.

## 2. Configure the app

```bash
cp .env.example .env
```

Edit `.env` and paste the two values from step 1.5. (`.env` is git-ignored.)

## 3. Run it on your Android phone

1. Install **Expo Go** from the Play Store on your phone.
2. On your computer (Node 20+):

```bash
npm install
npx expo start
```

3. Scan the QR code shown in the terminal with Expo Go (phone and computer on the same Wi-Fi; if that
   fails use `npx expo start --tunnel`).
4. Sign in with the user you created, allow the camera, and scan.

## 4. Make QR codes for your cars

A car’s QR code just has to contain the **same text as the `qr_code` column**. The sample data uses
`CAR-0001`, `CAR-0002`, `CAR-0003`. Generate any of them with a free QR generator (e.g. qr-code-generator.com),
or print/show it on a screen and scan it. Anything not in the table shows **Car not in registry**.

### Adding cars

Supabase dashboard → **Table Editor → cars → Insert row**. (Or bulk-import a CSV.)

## 5. Share it with testers (installable APK)

Testers get a link, tap it on their Android phone and install – no Expo Go needed.

1. Make a free account at <https://expo.dev>, then:

```bash
npm install -g eas-cli
eas login
eas init
```

2. Give the build your Supabase values (`.env` is git-ignored, so EAS can't see it). The anon key is
   public by design, so plain-text visibility is fine:

```bash
eas env:create --environment preview --name EXPO_PUBLIC_SUPABASE_URL --value "https://YOUR-PROJECT-REF.supabase.co" --visibility plaintext
eas env:create --environment preview --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "YOUR-ANON-PUBLIC-KEY" --visibility plaintext
```

3. Build the APK (takes ~10–20 min on Expo's free cloud queue):

```bash
eas build -p android --profile preview
```

4. When it finishes, EAS prints an **install link / QR code**. Send that link to your testers. On first
   install, Android asks them to allow “Install unknown apps” for their browser – that's expected for
   APKs outside the Play Store.

**Logins for testers:** sign-up is disabled, so create accounts in Supabase (*Authentication → Users*),
or make one shared demo account. Remember any signed-in user can read the whole `cars` table, so keep
real personal data out of it while testing.

**Quick alternative (no build):** `npx expo start --tunnel` and share the QR code with people who have
Expo Go – it only works while your computer is running the command.

## Project layout

```
App.tsx                      entry: picks Login or Scanner based on session
src/context/AuthContext.tsx  Supabase session handling
src/lib/supabase.ts          Supabase client
src/lib/cars.ts              registry lookup (findCarByCode)
src/screens/LoginScreen.tsx  login UI
eas.json                     build profiles for sharing (APK)
src/screens/ScannerScreen.tsx  camera + scan overlay
src/components/ResultSheet.tsx found / not in registry / error card
supabase/schema.sql          table, security rules, sample data
```

## Notes

- The anon key is designed to be public; security comes from the row-level-security policy, which only
  lets signed-in users **read** `cars`.
- The app icon/splash are Expo’s defaults – replace the files in `assets/` with your own.

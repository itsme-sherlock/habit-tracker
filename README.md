# Habit Tracker

Habit Tracker is a React/Vite app packaged for Android with Capacitor.

## Build an Android APK

Install Node.js and Android Studio, including Android SDK 36. Android builds also
require JDK 17 or newer. From the project root, run:

```powershell
npm install
npm run android:apk
```

The debug APK is written to
`android/app/build/outputs/apk/debug/app-debug.apk`. Copy it to an Android
device and open it to install. If Android asks, allow installs from that source.

## Prepare a Google Play bundle

Google Play accepts Android App Bundles (`.aab`). Create and securely keep an
upload keystore outside the repository. For example, with the JDK's `keytool`:

```powershell
keytool -genkeypair -v -keystore "$HOME\habit-tracker-upload-key.jks" `
  -keyalg RSA -keysize 2048 -validity 10000 -alias upload
```

Set these environment variables in the same PowerShell session before building:

```powershell
$env:ANDROID_KEYSTORE_PATH = "$HOME\habit-tracker-upload-key.jks"
$env:ANDROID_KEYSTORE_PASSWORD = "<keystore password>"
$env:ANDROID_KEY_ALIAS = "upload"
$env:ANDROID_KEY_PASSWORD = "<key password>"
npm run android:bundle
```

The signed bundle is written to
`android/app/build/outputs/bundle/release/app-release.aab`. Keep the keystore
and passwords backed up securely; Google Play uses the signing identity to
accept future app updates. Do not commit the keystore or its passwords.

Before publishing, create a Google Play developer account and complete the Play
Console listing and policy requirements. The Android application ID is
`com.habittracker.app`; choose and set a unique application ID before the first
Play upload if this one is unavailable, since it cannot be changed for updates.

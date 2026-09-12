# Maximum Website Control & Zero-Publish Principle

All mobile app bridge integrations and web-to-native interactions must follow this core architectural rule:

## 1. Maximum Website Control (Zero-Publish Principle)
- **Primary Objective**: The React Native mobile shell (`SuperBookApp`) must remain a lightweight, thin wrapper around the Quiz-do web application (`super-book`).
- **Zero Unnecessary App Publishes**: Feature updates, styling changes, domain routing, authentication parameters, cache policies, or business logic updates must **never** require releasing a new mobile app binary (APK/AAB/IPA) to the Google Play Store or Apple App Store.
- The website deployed to production must hold **maximum authority** over application behavior.

## 2. Dynamic Configuration over Native Hardcoding
- Any native integration must accept dynamic, parametric configuration from the web app via the message bridge:
  - **Google Sign-In**: Pass options dynamically (`selectAccount`, `webClientId`, `scopes`, `offlineAccess`) via `REQUEST_GOOGLE_SIGN_IN` or `CONFIGURE_GOOGLE_SIGN_IN` rather than hardcoding them in native code.
  - **Status Bar & Theming**: The website controls status bar appearance (`backgroundColor`, `barStyle`) dynamically via `REQUEST_SET_STATUS_BAR`.
  - **Allowed Domains**: Dynamic domain white-listing via `REQUEST_SET_ALLOWED_DOMAINS` to avoid hardcoding domain lists in native binaries.
  - **Cache & Reload**: The website can trigger cache invalidation and page reloading via `REQUEST_CLEAR_CACHE` and `REQUEST_RELOAD`.
  - **Capability Negotiation**: The website can query native capabilities via `REQUEST_APP_INFO` to gracefully support both new and legacy installed shell versions.

## 3. Web-First Feature Implementation
- Always implement business logic, error handling, session lifecycle, and fallback flows in the website codebase first.
- The native layer only exists to bridge OS-level APIs (such as FCM push notifications, native Google credentials, system share sheets, and hardware back buttons).

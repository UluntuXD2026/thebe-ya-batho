
```
thebe-ya-batho
├─ backend
│  ├─ .env
│  ├─ middleware
│  │  └─ auth.js
│  ├─ models
│  │  ├─ ContactRequest.js
│  │  ├─ EmergencyAlert.js
│  │  ├─ Notifications.js
│  │  └─ User.js
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ requests.rest
│  ├─ routes
│  │  ├─ auth.js
│  │  ├─ contacts.js
│  │  ├─ emergency.js
│  │  └─ notifications.js
│  ├─ server.js
│  ├─ services
│  │  └─ notificationService.js
│  ├─ socket.js
│  └─ utils
│     └─ phone.js
├─ frontend
│  ├─ .claude
│  │  └─ settings.json
│  ├─ .expo
│  │  ├─ dev
│  │  │  └─ logs
│  │  │     └─ start.log
│  │  ├─ devices.json
│  │  ├─ README.md
│  │  ├─ static-tmp
│  │  │  └─ _error.js
│  │  ├─ types
│  │  │  └─ router.d.ts
│  │  └─ web
│  │     └─ cache
│  │        └─ production
│  │           └─ images
│  │              └─ favicon
│  │                 └─ favicon-a4e030697a7571b3e95d31860e4da55d2f98e5e861e2b55e414f45a8556828ba-contain-transparent
│  │                    └─ favicon-48.png
│  ├─ AGENTS.md
│  ├─ app.json
│  ├─ assets
│  │  ├─ expo.icon
│  │  │  ├─ Assets
│  │  │  │  ├─ expo-symbol 2.svg
│  │  │  │  └─ grid.png
│  │  │  └─ icon.json
│  │  ├─ icons
│  │  │  ├─ faceID.svg
│  │  │  ├─ fingerPrint.svg
│  │  │  ├─ location-icon.svg
│  │  │  └─ notification-icon.svg
│  │  └─ images
│  │     ├─ android-icon-background.png
│  │     ├─ android-icon-foreground.png
│  │     ├─ android-icon-monochrome.png
│  │     ├─ bell.png
│  │     ├─ expo-badge-white.png
│  │     ├─ expo-badge.png
│  │     ├─ expo-logo.png
│  │     ├─ favicon.png
│  │     ├─ icon.png
│  │     ├─ logo-glow.png
│  │     ├─ react-logo.png
│  │     ├─ react-logo@2x.png
│  │     ├─ react-logo@3x.png
│  │     ├─ splash-icon.png
│  │     ├─ tabIcons
│  │     │  ├─ explore.png
│  │     │  ├─ explore@2x.png
│  │     │  ├─ explore@3x.png
│  │     │  ├─ home.png
│  │     │  ├─ home@2x.png
│  │     │  └─ home@3x.png
│  │     ├─ tebeImages
│  │     │  └─ african-american.png
│  │     └─ tutorial-web.png
│  ├─ CLAUDE.md
│  ├─ expo-env.d.ts
│  ├─ LICENSE
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ README.md
│  ├─ scripts
│  │  └─ reset-project.js
│  ├─ src
│  │  ├─ app
│  │  │  ├─ explore.tsx
│  │  │  ├─ index.tsx
│  │  │  └─ _layout.tsx
│  │  ├─ components
│  │  │  ├─ animated-icon.module.css
│  │  │  ├─ animated-icon.tsx
│  │  │  ├─ animated-icon.web.tsx
│  │  │  ├─ app-tabs.tsx
│  │  │  ├─ app-tabs.web.tsx
│  │  │  ├─ external-link.tsx
│  │  │  ├─ hint-row.tsx
│  │  │  ├─ SimpleLogo.tsx
│  │  │  ├─ themed-text.tsx
│  │  │  ├─ themed-view.tsx
│  │  │  ├─ ui
│  │  │  │  └─ collapsible.tsx
│  │  │  └─ web-badge.tsx
│  │  ├─ constants
│  │  │  ├─ responsive.ts
│  │  │  └─ theme.ts
│  │  ├─ global.css
│  │  ├─ hooks
│  │  │  ├─ use-color-scheme.ts
│  │  │  ├─ use-color-scheme.web.ts
│  │  │  ├─ use-theme.ts
│  │  │  └─ useHardwareBack.ts
│  │  ├─ lib
│  │  │  ├─ api.ts
│  │  │  ├─ auth.ts
│  │  │  └─ config.ts
│  │  └─ screens
│  │     ├─ community
│  │     │  ├─ CommunityPage.tsx
│  │     │  ├─ InboxPage.tsx
│  │     │  └─ ManageContactsPage.tsx
│  │     ├─ emergency
│  │     │  ├─ EmergencyScreen.tsx
│  │     │  ├─ HelpMeScreen.tsx
│  │     │  ├─ PastEmergenciesScreen.tsx
│  │     │  └─ SOSScreen.tsx
│  │     ├─ homepage
│  │     │  ├─ HomePage.tsx
│  │     │  └─ Profilescreen.tsx
│  │     ├─ responder
│  │     │  └─ EmergencyRequestScreen.tsx
│  │     ├─ signin
│  │     │  ├─ BiometricSignInPage.tsx
│  │     │  ├─ LandingPage.tsx
│  │     │  ├─ SignInOTPPage.tsx
│  │     │  ├─ SignInPage.tsx
│  │     │  ├─ SignInSuccessPage.tsx
│  │     │  ├─ SignUpPage.tsx
│  │     │  ├─ SplashScreen.tsx
│  │     │  ├─ SplashScreen1.tsx
│  │     │  └─ SplashScreenTemp.tsx
│  │     └─ signup
│  │        ├─ AccountCreatedPage.tsx
│  │        ├─ OTPVerificationPage.tsx
│  │        ├─ PermissionRequestPage.tsx
│  │        └─ PersonalDetailsPage.tsx
│  └─ tsconfig.json
└─ package-lock.json

```
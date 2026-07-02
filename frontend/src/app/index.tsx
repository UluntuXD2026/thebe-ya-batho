import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useHardwareBack } from "@/hooks/useHardwareBack";
import { loginNumber } from "@/lib/api";
import HomePage from "@/screens/homepage/HomePage";
import LandingPage from "@/screens/signin/LandingPage";
import SignInOTPPage from "@/screens/signin/SignInOTPPage";
import SignInPage from "@/screens/signin/SignInPage";
import SignInSuccessPage from "@/screens/signin/SignInSuccessPage";
import SignUpPage from "@/screens/signin/SignUpPage";
import SplashScreen from "@/screens/signin/SplashScreenTemp";
import AccountCreatedPage from "@/screens/signup/AccountCreatedPage";
import OTPVerificationPage from "@/screens/signup/OTPVerificationPage";
import PermissionRequestPage from "@/screens/signup/PermissionRequestPage";
import PersonalDetailsPage from "@/screens/signup/PersonalDetailsPage";
import { clearToken, getToken, saveToken } from "@/lib/auth";

type Screen =
  | "splash"
  | "landing"
  | "signin"
  | "signinOtp"
  | "signinSuccess"
  | "signup"
  | "signupOtp"
  | "signupDetails"
  | "signupPermissions"
  | "signupDone"
  | "home";

// Mirrors each screen's own `onBack` target below, so the Android hardware
// back button reproduces exactly what pressing that screen's back button does.
// Screens with no entry here (splash, landing, success/done screens, home)
// have no "previous page" to return to, so hardware back falls through to
// the OS default (exit app) for those.
const BACK_TARGET: Partial<Record<Screen, Screen>> = {
  signin: "landing",
  signinOtp: "signin",
  signup: "landing",
  signupOtp: "signup",
  signupDetails: "signupOtp",
  signupPermissions: "signupDetails",
};

export default function HomeScreen() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [signinPhone, setSigninPhone] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [userFirstName, setUserFirstName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      const token = await getToken();
      const firstName = await AsyncStorage.getItem("firstName");

      if (token) {
        setAccessToken(token);
        if (firstName) setUserFirstName(firstName);
        setScreen("home");
      } else {
        setScreen("landing");
      }

      setLoading(false);
    };

    loadSession();
  }, []);

  useHardwareBack(
    useCallback(() => {
      const target = BACK_TARGET[screen];
      if (!target) return false;
      setScreen(target);
      return true;
    }, [screen]),
  );

  if (loading) {
    return <SplashScreen />;
  }

  // if (screen === "splash") {
  //   return <SplashScreen onFinish={() => setScreen("landing")} />;
  // }

  if (screen === "signin") {
    return (
      <SignInPage
        onBack={() => setScreen("landing")}
        onOtpSent={(phone) => {
          setSigninPhone(phone);
          setScreen("signinOtp");
        }}
      />
    );
  }

  if (screen === "signinOtp") {
    return (
      <SignInOTPPage
        phoneNumber={signinPhone}
        onBack={() => setScreen("signin")}
        onResend={loginNumber}
        onVerified={async (token, firstName) => {
          await saveToken(token);

          setAccessToken(token);

          const safeName = firstName ?? "";

          await AsyncStorage.setItem("firstName", safeName);
          setUserFirstName(safeName);

          setScreen("signinSuccess");
        }}
      />
    );
  }

  if (screen === "signinSuccess") {
    return <SignInSuccessPage onFinish={() => setScreen("home")} />;
  }

  if (screen === "signup") {
    return (
      <SignUpPage
        onBack={() => setScreen("landing")}
        onSignIn={() => setScreen("signin")}
        onCodeSent={(phone) => {
          setSignupPhone(phone);
          setScreen("signupOtp");
        }}
      />
    );
  }

  if (screen === "signupOtp") {
    return (
      <OTPVerificationPage
        phoneNumber={signupPhone}
        onBack={() => setScreen("signup")}
        onVerified={async (token, firstName) => {
          await saveToken(token);
          setAccessToken(token);
          
          const safeName = firstName ?? ""

          await AsyncStorage.setItem("firstName", safeName)
          setUserFirstName(safeName)

          setScreen("signupDetails");
        }}
      />
    );
  }

  if (screen === "signupDetails") {
    return (
      <PersonalDetailsPage
        token={accessToken}
        onBack={() => setScreen("signupOtp")}
        onContinue={(firstName) => {
          setUserFirstName(firstName);
          setScreen("signupPermissions");
        }}
      />
    );
  }

  if (screen === "signupPermissions") {
    return (
      <PermissionRequestPage
        onBack={() => setScreen("signupDetails")}
        onContinue={(granted) => {
          setLocationEnabled(granted.location);
          setNotificationsEnabled(granted.notifications);
          setScreen("signupDone");
        }}
      />
    );
  }

  if (screen === "signupDone") {
    return (
      <AccountCreatedPage
        phoneNumber={signupPhone}
        locationEnabled={locationEnabled}
        notificationsEnabled={notificationsEnabled}
        onFinish={() => setScreen("home")}
      />
    );
  }

  if (screen === "home") {
    return (
      <HomePage
        firstName={userFirstName}
        token={accessToken}
        onLogout={async () => {
          await clearToken();

          setAccessToken("");
          setUserFirstName("");
          setSigninPhone("");
          setSignupPhone("");
          setLocationEnabled(false);
          setNotificationsEnabled(false);

          // Go back to the start
          setScreen("landing");
        }}
      />
    );
  }

  return (
    <LandingPage
      onSignIn={() => setScreen("signin")}
      onCreateAccount={() => setScreen("signup")}
    />
  );
}

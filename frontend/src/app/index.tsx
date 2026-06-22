import { useState } from 'react';

import { loginNumber } from '@/lib/api';
import HomePage from '@/screens/homepage/HomePage';
import LandingPage from '@/screens/signin/LandingPage';
import SignInOTPPage from '@/screens/signin/SignInOTPPage';
import SignInPage from '@/screens/signin/SignInPage';
import SignInSuccessPage from '@/screens/signin/SignInSuccessPage';
import SignUpPage from '@/screens/signin/SignUpPage';
import SplashScreen from '@/screens/signin/SplashScreenTemp';
import AccountCreatedPage from '@/screens/signup/AccountCreatedPage';
import OTPVerificationPage from '@/screens/signup/OTPVerificationPage';
import PermissionRequestPage from '@/screens/signup/PermissionRequestPage';
import PersonalDetailsPage from '@/screens/signup/PersonalDetailsPage';

type Screen =
  | 'splash'
  | 'landing'
  | 'signin'
  | 'signinOtp'
  | 'signinSuccess'
  | 'signup'
  | 'signupOtp'
  | 'signupDetails'
  | 'signupPermissions'
  | 'signupDone'
  | 'home';

export default function HomeScreen() {
  const [screen, setScreen] = useState<Screen>('splash');
  const [signinPhone, setSigninPhone] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupToken, setSignupToken] = useState('');
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [userFirstName, setUserFirstName] = useState('');

  if (screen === 'splash') {
    return <SplashScreen onFinish={() => setScreen('landing')} />;
  }

  if (screen === 'signin') {
    return (
      <SignInPage
        onBack={() => setScreen('landing')}
        onOtpSent={phone => {
          setSigninPhone(phone);
          setScreen('signinOtp');
        }}
      />
    );
  }

  if (screen === 'signinOtp') {
    return (
      <SignInOTPPage
        phoneNumber={signinPhone}
        onBack={() => setScreen('signin')}
        onResend={loginNumber}
        onVerified={(_token, firstName) => {
          if (firstName) setUserFirstName(firstName);
          setScreen('signinSuccess');
        }}
      />
    );
  }

  if (screen === 'signinSuccess') {
    return <SignInSuccessPage onFinish={() => setScreen('home')} />;
  }

  if (screen === 'signup') {
    return (
      <SignUpPage
        onSignIn={() => setScreen('signin')}
        onCodeSent={phone => {
          setSignupPhone(phone);
          setScreen('signupOtp');
        }}
      />
    );
  }

  if (screen === 'signupOtp') {
    return (
      <OTPVerificationPage
        phoneNumber={signupPhone}
        onBack={() => setScreen('signup')}
        onVerified={token => {
          setSignupToken(token);
          setScreen('signupDetails');
        }}
      />
    );
  }

  if (screen === 'signupDetails') {
    return (
      <PersonalDetailsPage
        token={signupToken}
        onContinue={firstName => {
          setUserFirstName(firstName);
          setScreen('signupPermissions');
        }}
      />
    );
  }

  if (screen === 'signupPermissions') {
    return (
      <PermissionRequestPage
        onContinue={granted => {
          setLocationEnabled(granted.location);
          setNotificationsEnabled(granted.notifications);
          setScreen('signupDone');
        }}
      />
    );
  }

  if (screen === 'signupDone') {
    return (
      <AccountCreatedPage
        phoneNumber={signupPhone}
        locationEnabled={locationEnabled}
        notificationsEnabled={notificationsEnabled}
        onFinish={() => setScreen('home')}
      />
    );
  }

  if (screen === 'home') {
    return <HomePage firstName={userFirstName} />;
  }

  return (
    <LandingPage
      onSignIn={() => setScreen('signin')}
      onCreateAccount={() => setScreen('signup')}
    />
  );
}

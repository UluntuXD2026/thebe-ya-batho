import { useState } from 'react';

import LandingPage from '@/screens/signin/LandingPage';
import SignInPage from '@/screens/signin/SignInPage';
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
  | 'signup'
  | 'signupOtp'
  | 'signupDetails'
  | 'signupPermissions'
  | 'signupDone';

export default function HomeScreen() {
  const [screen, setScreen] = useState<Screen>('splash');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupToken, setSignupToken] = useState('');

  if (screen === 'splash') {
    return <SplashScreen onFinish={() => setScreen('landing')} />;
  }

  if (screen === 'signin') {
    return <SignInPage onBack={() => setScreen('landing')} />;
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
        onContinue={() => setScreen('signupPermissions')}
      />
    );
  }

  if (screen === 'signupPermissions') {
    return <PermissionRequestPage onContinue={() => setScreen('signupDone')} />;
  }

  if (screen === 'signupDone') {
    return (
      <AccountCreatedPage
        phoneNumber={signupPhone}
        onFinish={() => setScreen('landing')}
      />
    );
  }

  return (
    <LandingPage
      onSignIn={() => setScreen('signin')}
      onCreateAccount={() => setScreen('signup')}
    />
  );
}

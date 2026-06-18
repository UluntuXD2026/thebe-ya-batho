import { useState } from 'react';

import LandingPage from './signin/LandingPage';
import SignInPage from './signin/SignInPage';
import SignUpPage from './signin/SignUpPage';
import SplashScreen from './signin/SplashScreenTemp';

type Screen = 'splash' | 'landing' | 'signin' | 'signup';

export default function HomeScreen() {
  const [screen, setScreen] = useState<Screen>('splash');

  if (screen === 'splash') {
    return <SplashScreen onFinish={() => setScreen('landing')} />;
  }

  if (screen === 'signin') {
    return <SignInPage onBack={() => setScreen('landing')} />;
  }

  if (screen === 'signup') {
    return <SignUpPage onSignIn={() => setScreen('signin')} />;
  }

  return (
    <LandingPage
      onSignIn={() => setScreen('signin')}
      onCreateAccount={() => setScreen('signup')}
    />
  );
}

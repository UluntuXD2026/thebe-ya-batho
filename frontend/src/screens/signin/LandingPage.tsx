import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  StatusBar,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import SimpleLogo from '../../components/SimpleLogo';
import { useResponsive } from '../../constants/responsive';

const bgImage = require('../../../assets/images/tebeImages/african-american.png');

const COLORS = {
  primary: '#E8573A',       // coral-red CTA
  primaryDark: '#C94428',
  white: '#FFFFFF',
  whiteAlpha80: 'rgba(255,255,255,0.80)',
  whiteAlpha15: 'rgba(255,255,255,0.15)',
  whiteAlpha25: 'rgba(255,255,255,0.25)',
  overlay: 'rgba(0,0,0,0.32)',
};

const Logo: React.FC<{ moderateScale: (size: number, factor?: number) => number }> = ({
  moderateScale,
}) => (
  <View style={styles.logoRow}>
    <SimpleLogo
      color={COLORS.white}
      width={moderateScale(40)}
      height={moderateScale(42)}
    />
    <View style={styles.logoTextWrap}>
      <Text style={[styles.logoLine1, { fontSize: moderateScale(14) }]}>Thebe</Text>
      <Text style={[styles.logoLine2, { fontSize: moderateScale(14) }]}>Ya Batho</Text>
    </View>
  </View>
);

type LandingPageProps = {
  onSignIn?: () => void;
  onCreateAccount?: () => void;
};

const LandingPage: React.FC<LandingPageProps> = ({ onSignIn, onCreateAccount }) => {
  const { moderateScale } = useResponsive();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(btnAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleCreateAccount = () => {
    onCreateAccount?.();
  };

  const handleSignIn = () => {
    onSignIn?.();
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ImageBackground
        source={bgImage}
        style={styles.bg}
        resizeMode="cover"
      >
        {/* Dark gradient overlay */}
        <View style={styles.overlay} />

        <SafeAreaView style={styles.safe}>
          {/* ── Logo ── */}
          <Animated.View
            style={[
              styles.logoContainer,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Logo moderateScale={moderateScale} />
          </Animated.View>

          {/* ── Spacer – fills the portrait photo area ── */}
          <View style={styles.spacer} />

          {/* ── CTA Buttons ── */}
          <Animated.View style={[styles.btnContainer, { opacity: btnAnim }]}>
            {/* Primary: Create Account */}
            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={handleCreateAccount}
              activeOpacity={0.85}
            >
              <Text style={[styles.btnPrimaryText, { fontSize: moderateScale(16) }]}>
                Create Account
              </Text>
            </TouchableOpacity>

            {/* Secondary: Sign In */}
            <TouchableOpacity
              style={styles.btnSecondary}
              onPress={handleSignIn}
              activeOpacity={0.75}
            >
              <Text style={[styles.btnSecondaryText, { fontSize: moderateScale(16) }]}>
                Sign In
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

export default LandingPage;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#111',
  },

  // ── Background ──────────────────────────────────────────
  bg: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: COLORS.overlay,
  },

  // ── Layout ──────────────────────────────────────────────
  safe: {
    flex: 1,
    paddingHorizontal: 24,
  },
  spacer: {
    flex: 1,
  },

  // ── Logo ────────────────────────────────────────────────
  logoContainer: {
    marginTop: 12,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoTextWrap: {
    flexDirection: 'column',
  },
  logoLine1: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 16,
    letterSpacing: 0.3,
  },
  logoLine2: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 16,
    letterSpacing: 0.3,
  },

  // ── Buttons ─────────────────────────────────────────────
  btnContainer: {
    paddingBottom: 32,
    gap: 14,
  },
  btnPrimary: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    // subtle shadow for depth on the CTA
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  btnPrimaryText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  btnSecondary: {
    backgroundColor: COLORS.whiteAlpha15,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.whiteAlpha25,
  },
  btnSecondaryText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
});

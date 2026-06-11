import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  ScrollView,
} from 'react-native';

const COLORS = {
  primary: '#E8573A',
  primaryDark: '#C94428',
  black: '#111111',
  darkGray: '#333333',
  mediumGray: '#888888',
  pageBg: '#FFFFFF',
  badgeBg: '#EFEFEF',
  infoBorder: '#111111',
};

// ── Face ID Icon ──────────────────────────────────────────────────────────────
const FaceIDIcon: React.FC = () => (
  <View style={fid.wrap}>
    {/* Corner brackets - top left */}
    <View style={[fid.corner, fid.tl, fid.cornerTop]} />
    <View style={[fid.corner, fid.tl, fid.cornerLeft]} />
    {/* Top right */}
    <View style={[fid.corner, fid.tr, fid.cornerTop]} />
    <View style={[fid.corner, fid.tr, fid.cornerRight]} />
    {/* Bottom left */}
    <View style={[fid.corner, fid.bl, fid.cornerBottom]} />
    <View style={[fid.corner, fid.bl, fid.cornerLeft]} />
    {/* Bottom right */}
    <View style={[fid.corner, fid.br, fid.cornerBottom]} />
    <View style={[fid.corner, fid.br, fid.cornerRight]} />
    {/* Eyes */}
    <View style={[fid.eye, fid.eyeLeft]} />
    <View style={[fid.eye, fid.eyeRight]} />
    {/* Smile */}
    <View style={fid.smile} />
  </View>
);

const CORNER_SIZE = 22;
const CORNER_THICK = 4;
const BOX = 110;

const fid = StyleSheet.create({
  wrap: {
    width: BOX,
    height: BOX,
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    backgroundColor: COLORS.black,
  },
  cornerTop: { width: CORNER_SIZE, height: CORNER_THICK, borderRadius: 2 },
  cornerBottom: { width: CORNER_SIZE, height: CORNER_THICK, borderRadius: 2 },
  cornerLeft: { width: CORNER_THICK, height: CORNER_SIZE, borderRadius: 2 },
  cornerRight: { width: CORNER_THICK, height: CORNER_SIZE, borderRadius: 2 },
  // positions
  tl: { top: 0, left: 0 },
  tr: { top: 0, right: 0 },
  bl: { bottom: 0, left: 0 },
  br: { bottom: 0, right: 0 },
  // Face features
  eye: {
    position: 'absolute',
    width: 5,
    height: 14,
    borderRadius: 3,
    borderWidth: 3,
    borderColor: COLORS.black,
    backgroundColor: 'transparent',
    top: 28,
  },
  eyeLeft: { left: 28 },
  eyeRight: { right: 28 },
  smile: {
    position: 'absolute',
    width: 36,
    height: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    borderWidth: 3.5,
    borderTopWidth: 0,
    borderColor: COLORS.black,
    backgroundColor: 'transparent',
    bottom: 22,
  },
});

// ── Fingerprint Icon ──────────────────────────────────────────────────────────
const FingerprintIcon: React.FC = () => (
  <View style={fp.wrap}>
    {[56, 44, 32, 20, 10].map((size, i) => (
      <View
        key={i}
        style={[
          fp.arc,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: i === 4 ? 0 : 3,
            backgroundColor: i === 4 ? COLORS.black : 'transparent',
          },
        ]}
      />
    ))}
  </View>
);

const fp = StyleSheet.create({
  wrap: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arc: {
    position: 'absolute',
    borderColor: COLORS.black,
  },
});

// ── Main Component ────────────────────────────────────────────────────────────
const BiometricSignInPage: React.FC = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const faceAnim = useRef(new Animated.Value(0)).current;
  const fpAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
      Animated.timing(faceAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(fpAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start();

    // Auto-trigger biometric prompt on mount
    // LocalAuthentication.authenticateAsync({ ... })
  }, []);

  const handleBiometric = () => {
    // const result = await LocalAuthentication.authenticateAsync({
    //   promptMessage: 'Sign in to Thebe Ya Batho',
    //   fallbackLabel: 'Use OTP',
    // });
    // if (result.success) navigation.navigate('SignInSuccess', { method: 'Biometric' });
    console.log('Trigger biometric auth');
  };

  const handleUseOTP = () => {
    // navigation.navigate('SignInOTP');
    console.log('Use OTP instead');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.pageBg} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[styles.inner, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          {/* ── Heading ── */}
          <View style={styles.headingBlock}>
            <Text style={styles.title}>Quick access</Text>
            <Text style={styles.subtitle}>Confirm your identity instantly</Text>
          </View>

          {/* ── Face ID ── */}
          <Animated.View style={[styles.bioBlock, { opacity: faceAnim }]}>
            <TouchableOpacity
              onPress={handleBiometric}
              activeOpacity={0.75}
              style={styles.bioIconWrap}
            >
              <FaceIDIcon />
            </TouchableOpacity>
            <View style={styles.labelPill}>
              <Text style={styles.labelPillText}>Face ID</Text>
            </View>
          </Animated.View>

          {/* ── Fingerprint ── */}
          <Animated.View style={[styles.bioBlock, { opacity: fpAnim }]}>
            <TouchableOpacity
              onPress={handleBiometric}
              activeOpacity={0.75}
              style={styles.bioIconWrap}
            >
              <FingerprintIcon />
            </TouchableOpacity>
            <View style={styles.labelPill}>
              <Text style={styles.labelPillText}>Fingerprint</Text>
            </View>
          </Animated.View>

          {/* ── Privacy note ── */}
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>App never stores your biometric data.</Text>
          </View>

          {/* ── Use OTP instead ── */}
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={handleUseOTP}
            activeOpacity={0.85}
          >
            <Text style={styles.btnPrimaryText}>Use OTP Instead</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BiometricSignInPage;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.pageBg },
  scroll: { flexGrow: 1, paddingBottom: 40 },
  inner: { flex: 1, paddingHorizontal: 24, paddingTop: 48 },

  headingBlock: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.black, marginBottom: 8 },
  subtitle: { fontSize: 15, color: COLORS.mediumGray },

  bioBlock: { alignItems: 'center', marginBottom: 32 },
  bioIconWrap: { marginBottom: 12 },
  labelPill: {
    backgroundColor: COLORS.badgeBg,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  labelPillText: { fontSize: 13, color: COLORS.darkGray, fontWeight: '500' },

  infoBox: {
    borderWidth: 1,
    borderColor: COLORS.infoBorder,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 28,
  },
  infoText: { fontSize: 13, color: COLORS.black, textAlign: 'center' },

  btnPrimary: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  btnPrimaryText: { color: '#FFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.4 },
});

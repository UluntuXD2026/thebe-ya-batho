import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  ScrollView,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useResponsive } from '../../constants/responsive';

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
const faceIdXml = `<svg width="67" height="71" viewBox="0 0 67 71" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M11.1667 4.72045C7.46635 4.72045 4.46667 7.89057 4.46667 11.8011V23.6023H0V11.8011C0 5.28356 4.9995 0 11.1667 0H22.3333V4.72045H11.1667ZM55.8333 4.72045H44.6667V0H55.8333C62.0005 0 67 5.28356 67 11.8011V23.6023H62.5333V11.8011C62.5333 7.89057 59.5335 4.72045 55.8333 4.72045ZM22.3333 28.3227H17.8667V23.6023H22.3333V28.3227ZM49.1333 28.3227H44.6667V23.6023H49.1333V28.3227ZM21.8867 41.068C27.6933 49.2499 39.3067 49.2499 45.1133 41.068L48.6867 43.9002C41.0933 54.6001 25.9067 54.6001 18.3133 43.9002L21.8867 41.068ZM0 59.0057V47.2045H4.46667V59.0057C4.46667 62.9161 7.46635 66.0864 11.1667 66.0864H22.3333V70.8068H11.1667C4.9995 70.8068 0 65.5232 0 59.0057ZM67 47.2045V59.0057C67 65.5232 62.0005 70.8068 55.8333 70.8068H44.6667V66.0864H55.8333C59.5335 66.0864 62.5333 62.9161 62.5333 59.0057V47.2045H67Z" fill="black"/>
</svg>`;

const FaceIDIcon: React.FC<{ moderateScale: (size: number, factor?: number) => number }> = ({
  moderateScale,
}) => (
  <View style={[fid.wrap, { width: moderateScale(BOX), height: moderateScale(BOX) }]}>
    <SvgXml xml={faceIdXml} width={moderateScale(62)} height={moderateScale(66)} />
  </View>
);

const BOX = 110;

const fid = StyleSheet.create({
  wrap: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// ── Fingerprint Icon ──────────────────────────────────────────────────────────
const fingerprintXml = `<svg width="64" height="83" viewBox="0 0 64 83" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M62.7664 30.1597C62.6821 22.064 59.2804 14.7123 53.8104 9.39025C48.343 4.06803 40.7921 0.768005 32.433 0.768005C15.7476 0.770378 2.14287 13.8892 2.09946 29.9767V29.9667C2.074 32.0951 1.59205 34.216 0.829549 36.248C0.638271 36.7647 0.913764 37.3331 1.44418 37.5186C1.9746 37.7065 2.56117 37.4394 2.75489 36.9227C3.57354 34.7302 4.11408 32.3941 4.14476 29.9889V29.9814C4.1805 15.0012 16.8749 2.74764 32.433 2.75017C40.2311 2.75017 47.2542 5.82033 52.3619 10.7891C57.4672 15.7603 60.6421 22.6125 60.7211 30.1817C60.7237 30.4165 60.7237 30.6489 60.7237 30.8839C60.7237 40.1538 58.7627 48.4769 55.6235 56.2018C52.4868 63.9243 48.1594 71.0485 43.4288 77.8811C43.1126 78.336 43.2376 78.9515 43.7094 79.2556C44.1786 79.5597 44.8137 79.4385 45.1273 78.9837C49.9011 72.0868 54.3103 64.844 57.5284 56.9286C60.7465 49.0157 62.7688 40.4281 62.7688 30.8839C62.7688 30.6442 62.7688 30.402 62.7664 30.1597Z" fill="black" stroke="black" stroke-width="1.536"/>
<path d="M55.9526 30.7356C55.9526 30.5453 55.95 30.3524 55.9475 30.1596C55.876 23.8832 53.2419 18.1829 49.0036 14.0572C44.7679 9.93385 38.9129 7.37296 32.4331 7.37549C26.0426 7.37549 20.1645 9.86234 15.8854 13.8843C11.6063 17.9037 8.90835 23.4755 8.90835 29.6258C8.90835 29.7766 8.91096 29.925 8.91603 30.0732V30.0707C8.91864 30.2338 8.91864 30.3945 8.91864 30.5576C8.91864 34.3744 7.94446 38.018 6.45781 41.3503C4.97361 44.6801 2.98201 47.6934 0.980117 50.2296C0.635915 50.6647 0.722578 51.2877 1.1714 51.6189C1.62021 51.9525 2.26292 51.871 2.60451 51.4334C4.68278 48.8007 6.76366 45.6589 8.33452 42.1363C9.90538 38.6137 10.9636 34.7031 10.9636 30.5575C10.9636 30.382 10.9636 30.2064 10.961 30.0333V30.0308C10.9559 29.8949 10.9533 29.7588 10.9533 29.6253C10.9533 24.0436 13.3964 18.9859 17.3107 15.3076C21.2226 11.6319 26.5957 9.35513 32.4327 9.35766C38.354 9.35766 43.6786 11.6863 47.5574 15.4586C51.4285 19.2283 53.8382 24.4319 53.9021 30.1817C53.9047 30.3671 53.9071 30.55 53.9071 30.7355C53.9071 40.3762 51.0688 49.8438 47.0371 58.3499C43.0028 66.856 37.7778 74.3931 33.0549 80.1626C32.7055 80.5902 32.777 81.2133 33.2207 81.5543C33.6645 81.8931 34.3046 81.8214 34.6564 81.3936C39.4609 75.5251 44.7702 67.8695 48.8936 59.1803C53.0149 50.4893 55.9501 40.7545 55.9526 30.7356Z" fill="black" stroke="black" stroke-width="1.536"/>
<path d="M49.1567 31.6231C49.1567 31.1262 49.149 30.6318 49.1312 30.1374C48.9731 25.7027 47.1089 21.666 44.128 18.7366C41.1495 15.8073 37.0336 13.9804 32.4333 13.983C27.8584 13.983 23.6813 15.7777 20.6543 18.6724C17.6247 21.5696 15.7301 25.5841 15.7301 30.0139L15.7327 30.14C15.7327 30.2265 15.7327 30.3081 15.7327 30.3822C15.7327 36.4806 13.8863 42.1216 11.2827 47.0383C8.68412 51.9527 5.32827 56.1352 2.36755 59.2844C1.98499 59.6874 2.01306 60.3153 2.43136 60.6836C2.84966 61.0519 3.49726 61.0247 3.8772 60.6194C6.9272 57.3736 10.3901 53.0675 13.1034 47.9431C15.8141 42.8211 17.7752 36.8735 17.7778 30.3822C17.7778 30.2956 17.7752 30.2116 17.7752 30.13V30.1226V30.0137C17.7752 26.1377 19.4277 22.6324 22.0901 20.0863C24.7524 17.5377 28.4169 15.9655 32.4333 15.9655C36.4726 15.9655 40.0454 17.5524 42.6718 20.1283C45.2934 22.7041 46.9459 26.2688 47.0887 30.2042C47.104 30.6763 47.1142 31.1509 47.1142 31.6231C47.1168 40.8065 43.9393 50.0097 39.5327 58.2958C35.1288 66.5795 29.5083 73.941 24.6987 79.4436C24.3341 79.8614 24.3851 80.4868 24.8185 80.8402C25.2496 81.1962 25.8947 81.1417 26.2619 80.7241C31.1403 75.1373 36.8473 67.6721 41.3484 59.2029C45.8491 50.734 49.1541 41.2514 49.1567 31.6231Z" fill="black" stroke="black" stroke-width="1.536"/>
<path d="M33.4529 30.6591C33.4784 30.1102 33.0398 29.648 32.4787 29.6233C31.9126 29.601 31.4357 30.0237 31.4102 30.57C31.0277 38.8981 28.0875 46.9864 24.1348 54.1725C20.1821 61.3585 15.2223 67.6398 10.8666 72.3539C10.4891 72.7617 10.5249 73.3871 10.9456 73.753C11.3664 74.119 12.0141 74.0843 12.389 73.6739C16.8313 68.8659 21.883 62.4734 25.9377 55.1045C29.9872 47.7379 33.0499 39.3827 33.4529 30.6591Z" fill="black" stroke="black" stroke-width="1.536"/>
<path d="M42.335 31.2498C42.335 30.8913 42.3273 30.5329 42.3146 30.1719H42.3172C42.3172 30.167 42.3146 30.1596 42.3146 30.1521C42.3146 30.1521 42.3146 30.1447 42.3146 30.1398C42.2942 24.8596 37.8799 20.5906 32.4329 20.5881C26.9732 20.5906 22.5486 24.8794 22.5486 30.1719V30.1619C22.4824 37.4469 20.1236 44.3437 16.811 50.4494C13.4984 56.5527 9.24226 61.8502 5.43743 65.9191C5.05993 66.3246 5.08801 66.9523 5.50891 67.3207C5.92721 67.6866 6.57482 67.6568 6.95231 67.249C10.8387 63.0935 15.1993 57.675 18.619 51.3714C22.0386 45.0704 24.5225 37.8743 24.5938 30.1792V30.1717C24.5938 28.0681 25.4684 26.177 26.8889 24.7976C28.3093 23.4208 30.2654 22.5704 32.4329 22.5704C34.598 22.5704 36.5539 23.4208 37.9742 24.7976C39.3946 26.177 40.2694 28.0681 40.2719 30.1717V30.189V30.2039C40.2821 30.55 40.2897 30.9009 40.2897 31.2494C40.2947 39.6467 36.8955 48.4025 32.2748 56.3549C27.6591 64.3097 21.8372 71.4538 17.0966 76.6672C16.7243 77.0776 16.7651 77.7055 17.1909 78.0663C17.6143 78.4272 18.2594 78.3877 18.6317 77.9773C23.4361 72.6922 29.3344 65.4567 34.0573 57.3288C38.7725 49.1987 42.3297 40.1686 42.335 31.2498Z" fill="black" stroke="black" stroke-width="1.536"/>
</svg>`;

const FingerprintIcon: React.FC<{ moderateScale: (size: number, factor?: number) => number }> = ({
  moderateScale,
}) => (
  <View style={[fp.wrap, { width: moderateScale(80), height: moderateScale(80) }]}>
    <SvgXml xml={fingerprintXml} width={moderateScale(62)} height={moderateScale(80)} />
  </View>
);

const fp = StyleSheet.create({
  wrap: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// ── Main Component ────────────────────────────────────────────────────────────
const BiometricSignInPage: React.FC = () => {
  const { moderateScale } = useResponsive();
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
            <Text style={[styles.title, { fontSize: moderateScale(28) }]}>Quick access</Text>
            <Text style={styles.subtitle}>Confirm your identity instantly</Text>
          </View>

          {/* ── Face ID ── */}
          <Animated.View style={[styles.bioBlock, { opacity: faceAnim }]}>
            <TouchableOpacity
              onPress={handleBiometric}
              activeOpacity={0.75}
              style={styles.bioIconWrap}
            >
              <FaceIDIcon moderateScale={moderateScale} />
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
              <FingerprintIcon moderateScale={moderateScale} />
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
            <Text style={[styles.btnPrimaryText, { fontSize: moderateScale(16) }]}>
              Use OTP Instead
            </Text>
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

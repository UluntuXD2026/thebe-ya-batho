import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { logout } from '../../lib/api';

const COLORS = {
  primary: '#E8573A',
  black: '#111111',
  darkGray: '#333333',
  mediumGray: '#777777',
  borderGray: '#E8E8E8',
  pageBg: '#F5F5F5',
  cardBg: '#FFFFFF',
  trackingBg: '#EEEEEE',
  danger: '#D92D20',
};

interface Props {
  firstName?: string;
  token?: string;
  onBack: () => void;
  onLogout: () => void;
}

const ProfileScreen: React.FC<Props> = ({
  firstName,
  token,
  onBack,
  onLogout,
}) => {
  const [loggingOut, setLoggingOut] = useState(false);

  const displayName = firstName || 'User';

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      if (token) {
        await logout(token);
      }
    } catch (err) {
      console.log('Logout request failed:', err);
    } finally {
      setLoggingOut(false);
      onLogout();
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.avatarLarge} />

        <View style={styles.nameBlock}>
          <Text style={styles.name}>Hi, {displayName}</Text>
          <Text style={styles.subText}>Welcome back</Text>
        </View>

        {/* Simple info card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account</Text>

          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Name</Text>
            <Text style={styles.cardValue}>{displayName}</Text>
          </View>

          <View style={styles.cardRowLast}>
            <Text style={styles.cardLabel}>Status</Text>
            <Text style={styles.cardValue}>Active</Text>
          </View>
        </View>

        {/* Settings */}
        <TouchableOpacity style={styles.settingsRow} activeOpacity={0.7}>
          <Text style={styles.settingsText}>Settings</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          activeOpacity={0.8}
          onPress={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <ActivityIndicator color={COLORS.danger} />
          ) : (
            <Text style={styles.logoutText}>Log out</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.pageBg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.cardBg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.borderGray,
  },
  backBtn: { padding: 8 },
  backText: { fontSize: 16, fontWeight: '600', color: COLORS.primary },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.black },

  content: {
    padding: 20,
    alignItems: 'center',
  },

  avatarLarge: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: COLORS.trackingBg,
    marginBottom: 12,
  },

  nameBlock: {
    alignItems: 'center',
    marginBottom: 20,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.black,
  },
  subText: {
    fontSize: 13,
    color: COLORS.mediumGray,
    marginTop: 2,
  },

  card: {
    width: '100%',
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.borderGray,
  },
  cardRowLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  cardLabel: {
    fontSize: 14,
    color: COLORS.mediumGray,
  },
  cardValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
  },

  settingsRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 14,
  },
  settingsText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.black,
  },
  chevron: {
    fontSize: 18,
    color: COLORS.mediumGray,
  },

  logoutBtn: {
    width: '100%',
    marginTop: 28,
    paddingVertical: 14,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.danger,
  },
});
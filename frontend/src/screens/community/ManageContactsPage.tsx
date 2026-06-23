import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  FlatList,
} from 'react-native';

import {
  ReceivedContactRequest,
  acceptContactRequest,
  getReceivedContactRequests,
  rejectContactRequest,
  sendContactRequest,
} from '../../lib/api';

const COLORS = {
  primary: '#E8573A',
  primaryDark: '#C94428',
  black: '#111111',
  darkGray: '#333333',
  mediumGray: '#888888',
  lightGray: '#CCCCCC',
  borderGray: '#DDDDDD',
  inputBg: '#F4F4F4',
  pageBg: '#FFFFFF',
  cardBg: '#F7F7F7',
  pinkBack: '#FCE8E4',
  successGreen: '#2E8B57',
};

const requestName = (r: ReceivedContactRequest) =>
  [r.from.firstName, r.from.lastName].filter(Boolean).join(' ') || r.from.number;

type Tab = 'add' | 'requests';

interface Props {
  token?: string;
  onBack?: () => void;
}

const ManageContactsPage: React.FC<Props> = ({ token, onBack }) => {
  const [tab, setTab] = useState<Tab>('add');
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [requests, setRequests] = useState<ReceivedContactRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const refreshRequests = () => {
    if (!token) return;
    setLoadingRequests(true);
    getReceivedContactRequests(token)
      .then(all => setRequests(all.filter(r => r.status === 'pending')))
      .catch(() => setRequests([]))
      .finally(() => setLoadingRequests(false));
  };

  useEffect(() => {
    refreshRequests();
  }, [token]);

  const handleSendRequest = async () => {
    if (!token || phone.trim().length < 9) {
      setError('Enter a valid phone number');
      return;
    }
    setError('');
    setSuccess('');
    setSending(true);
    try {
      await sendContactRequest(token, `+27${phone.trim()}`);
      setSuccess('Request sent. They will show up here once accepted.');
      setPhone('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send request');
    } finally {
      setSending(false);
    }
  };

  const handleAccept = async (id: string) => {
    if (!token || processingId) return;
    setProcessingId(id);
    try {
      await acceptContactRequest(token, id);
      setRequests(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!token || processingId) return;
    setProcessingId(id);
    try {
      await rejectContactRequest(token, id);
      setRequests(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject request');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.pageBg} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Emergency Contacts</Text>
          <View style={styles.backBtnSpacer} />
        </View>

        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabPill, tab === 'add' ? styles.tabPillActive : styles.tabPillInactive]}
            onPress={() => setTab('add')}
            activeOpacity={0.75}
          >
            <Text style={[styles.tabText, tab === 'add' ? styles.tabTextActive : styles.tabTextInactive]}>
              Add Contact
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabPill, tab === 'requests' ? styles.tabPillActive : styles.tabPillInactive]}
            onPress={() => setTab('requests')}
            activeOpacity={0.75}
          >
            <Text style={[styles.tabText, tab === 'requests' ? styles.tabTextActive : styles.tabTextInactive]}>
              Requests{requests.length > 0 ? ` (${requests.length})` : ''}
            </Text>
          </TouchableOpacity>
        </View>

        {tab === 'add' ? (
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputWrap}>
              <Text style={styles.dialCode}>+27</Text>
              <TextInput
                style={styles.input}
                placeholder="__ __ __ __ __"
                placeholderTextColor={COLORS.lightGray}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                maxLength={9}
                returnKeyType="done"
              />
            </View>

            {!!error && <Text style={styles.errorText}>{error}</Text>}
            {!!success && <Text style={styles.successText}>{success}</Text>}

            <TouchableOpacity
              style={[styles.btnPrimary, sending && styles.btnDisabled]}
              onPress={handleSendRequest}
              activeOpacity={0.85}
              disabled={sending}
            >
              <Text style={styles.btnPrimaryText}>{sending ? 'Sending...' : 'Send Request'}</Text>
            </TouchableOpacity>

            <Text style={styles.helperText}>
              They need to already have an account on the app, and must accept your
              request before they appear in your Community list.
            </Text>
          </ScrollView>
        ) : (
          <FlatList
            data={requests}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.scroll}
            refreshing={loadingRequests}
            onRefresh={refreshRequests}
            ListEmptyComponent={<Text style={styles.helperText}>No pending requests</Text>}
            renderItem={({ item }) => (
              <View style={styles.requestRow}>
                <View style={styles.requestInfo}>
                  <Text style={styles.requestName}>{requestName(item)}</Text>
                  <Text style={styles.requestNumber}>{item.from.number}</Text>
                </View>
                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={[styles.acceptBtn, !!processingId && styles.btnDisabled]}
                    onPress={() => handleAccept(item._id)}
                    activeOpacity={0.75}
                    disabled={!!processingId}
                  >
                    <Text style={styles.acceptText}>
                      {processingId === item._id ? '...' : 'Accept'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.rejectBtn, !!processingId && styles.btnDisabled]}
                    onPress={() => handleReject(item._id)}
                    activeOpacity={0.75}
                    disabled={!!processingId}
                  >
                    <Text style={styles.rejectText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ManageContactsPage;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.pageBg },
  flex: { flex: 1 },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    marginBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.pinkBack,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: { fontSize: 26, color: COLORS.primary, lineHeight: 30, marginTop: -2 },
  backBtnSpacer: { width: 40 },
  title: { flex: 1, fontSize: 20, fontWeight: '700', color: COLORS.black, textAlign: 'center' },

  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 10,
    marginBottom: 16,
  },
  tabPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 24,
    alignItems: 'center',
  },
  tabPillActive: { backgroundColor: COLORS.primary },
  tabPillInactive: {
    backgroundColor: COLORS.pageBg,
    borderWidth: 1.5,
    borderColor: COLORS.borderGray,
  },
  tabText: { fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: '#FFF' },
  tabTextInactive: { color: COLORS.darkGray },

  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },

  label: { fontSize: 15, fontWeight: '600', color: COLORS.black, marginBottom: 10 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.borderGray,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    backgroundColor: COLORS.inputBg,
    marginBottom: 16,
  },
  dialCode: { fontSize: 16, color: COLORS.darkGray, fontWeight: '600', marginRight: 8 },
  input: { flex: 1, fontSize: 16, color: COLORS.darkGray, padding: 0, letterSpacing: 2 },

  errorText: { fontSize: 13, color: COLORS.primary, marginBottom: 12 },
  successText: { fontSize: 13, color: COLORS.successGreen, marginBottom: 12 },

  btnPrimary: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  btnDisabled: { opacity: 0.6 },
  btnPrimaryText: { color: '#FFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.4 },

  helperText: { fontSize: 13, color: COLORS.mediumGray, textAlign: 'center', lineHeight: 19 },

  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  requestInfo: { flex: 1 },
  requestName: { fontSize: 15, fontWeight: '600', color: COLORS.black },
  requestNumber: { fontSize: 13, color: COLORS.mediumGray, marginTop: 2 },
  requestActions: { flexDirection: 'row', gap: 8 },
  acceptBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  acceptText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  rejectBtn: {
    backgroundColor: COLORS.pageBg,
    borderWidth: 1.5,
    borderColor: COLORS.borderGray,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  rejectText: { color: COLORS.darkGray, fontSize: 13, fontWeight: '700' },
});

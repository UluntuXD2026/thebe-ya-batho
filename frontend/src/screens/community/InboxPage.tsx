import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  Animated,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useResponsive } from '../../constants/responsive';
import { MaxContentWidth } from '../../constants/theme';
import { useHardwareBack } from '../../hooks/useHardwareBack';

const COLORS = {
  primary: '#E8573A',
  black: '#111111',
  darkGray: '#222222',
  mediumGray: '#777777',
  lightGray: '#AAAAAA',
  borderGray: '#E5E5E5',
  pageBg: '#F2F2F7',
  headerBg: '#F2F2F7',
  bubbleBg: '#E9E9EB',       // received message bubble
  bubbleSent: '#E8573A',     // sent message bubble
  inputBarBg: '#1E2D4E',     // dark navy input bar
  inputFieldBg: '#FFFFFF',
  white: '#FFFFFF',
  timestampColor: '#8E8E93',
};

// ── Types ─────────────────────────────────────────────────────────────────────
type MessageType = 'text' | 'image';

interface Message {
  id: string;
  type: MessageType;
  text?: string;
  imageUri?: string;
  sender: 'them' | 'me';
  timestamp: string;
  showTimestamp?: boolean;
  showAvatar?: boolean;
}

// ── Mock messages ─────────────────────────────────────────────────────────────
const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    type: 'text',
    text: 'Be on the look out for a blue VW polo registration KWY 678 GP.',
    sender: 'them',
    timestamp: 'Today 14:12',
    showTimestamp: true,
    showAvatar: true,
  },
  {
    id: '2',
    type: 'image',
    imageUri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/2006_Volkswagen_Polo_%289N%29_5-door_hatchback_%282010-10-16%29_01.jpg/1280px-2006_Volkswagen_Polo_%289N%29_5-door_hatchback_%282010-10-16%29_01.jpg',
    sender: 'them',
    timestamp: 'Today 14:12',
    showAvatar: true,
  },
];

// ── Avatar ────────────────────────────────────────────────────────────────────
const Avatar: React.FC<{ visible: boolean; size: number }> = ({ visible, size }) => (
  <View style={[av.wrap, { width: size }]}>
    <View
      style={visible ? [av.circle, { width: size, height: size, borderRadius: size / 2 }] : { width: size, height: size }}
    />
  </View>
);
const av = StyleSheet.create({
  wrap: { marginRight: 8, justifyContent: 'flex-end' },
  circle: { backgroundColor: '#C9A87C' },
});

// ── Message bubble ────────────────────────────────────────────────────────────
const MessageBubble: React.FC<{ message: Message; avatarSize: number; imageMaxWidth: number }> = ({
  message, avatarSize, imageMaxWidth,
}) => {
  const isMe = message.sender === 'me';

  return (
    <View style={[bbl.row, isMe ? bbl.rowMe : bbl.rowThem]}>
      {/* Avatar on left for received */}
      {!isMe && <Avatar visible={!!message.showAvatar} size={avatarSize} />}

      <View style={[bbl.maxWidth, isMe && bbl.maxWidthMe]}>
        {/* Timestamp above bubble */}
        {message.showTimestamp && (
          <Text style={bbl.timestamp}>{message.timestamp}</Text>
        )}

        {message.type === 'text' ? (
          <View style={[bbl.bubble, isMe ? bbl.bubbleMe : bbl.bubbleThem]}>
            <Text style={[bbl.text, isMe ? bbl.textMe : bbl.textThem]}>
              {message.text}
            </Text>
          </View>
        ) : (
          <View style={bbl.imageWrap}>
            <Image
              source={{ uri: message.imageUri }}
              style={[bbl.image, { width: imageMaxWidth, height: imageMaxWidth * 0.75 }]}
              resizeMode="cover"
            />
          </View>
        )}
      </View>
    </View>
  );
};

const bbl = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 4,
    paddingHorizontal: 12,
  },
  rowThem: { justifyContent: 'flex-start' },
  rowMe: { justifyContent: 'flex-end' },
  maxWidth: { maxWidth: '72%' },
  maxWidthMe: { maxWidth: '72%' },

  timestamp: {
    fontSize: 12,
    color: COLORS.timestampColor,
    textAlign: 'center',
    alignSelf: 'center',
    marginBottom: 8,
    marginTop: 4,
    width: '100%',
  },

  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleThem: {
    backgroundColor: COLORS.bubbleBg,
    borderBottomLeftRadius: 4,
  },
  bubbleMe: {
    backgroundColor: COLORS.bubbleSent,
    borderBottomRightRadius: 4,
  },
  text: { fontSize: 15, lineHeight: 21 },
  textThem: { color: COLORS.darkGray },
  textMe: { color: COLORS.white },

  imageWrap: {
    borderRadius: 14,
    overflow: 'hidden',
    borderBottomLeftRadius: 4,
  },
  image: {
    borderRadius: 14,
  },
});

// ── Send icon ─────────────────────────────────────────────────────────────────
const sendXml = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2.5 21L23 12L2.5 3L2 10L17 12L2 14L2.5 21Z" fill="white"/>
</svg>`;

const SendIcon: React.FC = () => <SvgXml xml={sendXml} width={20} height={20} />;

// ── Input bar ─────────────────────────────────────────────────────────────────
interface InputBarProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onCamera: () => void;
  onVoice: () => void;
  onAttach: () => void;
}

const InputBar: React.FC<InputBarProps> = ({
  value, onChange, onSend, onCamera, onVoice, onAttach,
}) => {
  const canSend = value.trim().length > 0;

  return (
    <View style={inp.bar}>
      {/* + attach */}
      <TouchableOpacity style={inp.sideBtn} onPress={onAttach} activeOpacity={0.7}>
        <Text style={inp.sideBtnText}>+</Text>
      </TouchableOpacity>

      {/* Text field */}
      <View style={inp.fieldWrap}>
        <TextInput
          style={inp.field}
          value={value}
          onChangeText={onChange}
          placeholder=""
          placeholderTextColor={COLORS.lightGray}
          multiline
          returnKeyType="send"
          onSubmitEditing={onSend}
          blurOnSubmit={false}
        />
        {/* Sticker icon inside field */}
        <TouchableOpacity style={inp.stickerBtn} activeOpacity={0.7} />
      </View>

      {canSend ? (
        /* Send */
        <TouchableOpacity style={inp.sendBtn} onPress={onSend} activeOpacity={0.7}>
          <SendIcon />
        </TouchableOpacity>
      ) : (
        <>
          {/* Camera */}
          <TouchableOpacity style={inp.iconBtn} onPress={onCamera} activeOpacity={0.7} />

          {/* Voice */}
          <TouchableOpacity style={inp.iconBtn} onPress={onVoice} activeOpacity={0.7} />
        </>
      )}
    </View>
  );
};

const inp = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBarBg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    gap: 10,
  },
  sideBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sideBtnText: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: '300',
    lineHeight: 30,
    marginTop: -2,
  },
  fieldWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputFieldBg,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    minHeight: 40,
  },
  field: {
    flex: 1,
    fontSize: 15,
    color: COLORS.darkGray,
    maxHeight: 100,
    padding: 0,
  },
  stickerBtn: { marginLeft: 6 },
  iconBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// ── Main Component ────────────────────────────────────────────────────────────
interface Props {
  contactName?: string;
  contactAvatar?: string;
  onBack?: () => void;
}

const InboxPage: React.FC<Props> = ({
  contactName = 'Keamogetswe',
  onBack,
}) => {
  const r = useResponsive();
  const avatarSize = r.moderateScale(36);
  const imageMaxWidth = Math.min(r.width * 0.55, 220);

  useHardwareBack(
    useCallback(() => {
      if (onBack) {
        onBack();
        return true;
      }
      return false;
    }, [onBack]),
  );

  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const listRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, []);

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      type: 'text',
      text,
      sender: 'me',
      timestamp: 'Now',
      showAvatar: false,
    };
    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleBack = () => {
    onBack?.();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.headerBg} />

      <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>

          <View style={styles.contactInfo}>
            <View
              style={[
                styles.contactAvatar,
                { width: r.moderateScale(40), height: r.moderateScale(40), borderRadius: r.moderateScale(20) },
              ]}
            />
            <Text style={styles.contactName}>{contactName}</Text>
          </View>
        </View>

        {/* ── Messages ── */}
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <MessageBubble message={item} avatarSize={avatarSize} imageMaxWidth={imageMaxWidth} />
            )}
            contentContainerStyle={[
              styles.messageList,
              { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
            ]}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          />

          {/* ── Input bar ── */}
          <InputBar
            value={inputText}
            onChange={setInputText}
            onSend={handleSend}
            onCamera={() => console.log('Camera')}
            onVoice={() => console.log('Voice')}
            onAttach={() => console.log('Attach')}
          />
        </KeyboardAvoidingView>
      </Animated.View>
    </SafeAreaView>
  );
};

export default InboxPage;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.pageBg },
  flex: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.headerBg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.borderGray,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 32,
    color: COLORS.black,
    lineHeight: 36,
    marginTop: -4,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#C9A87C',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  contactName: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.darkGray,
  },

  // Message list
  messageList: {
    paddingVertical: 16,
    paddingBottom: 8,
  },
});

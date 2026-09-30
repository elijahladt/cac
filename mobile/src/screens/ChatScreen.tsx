import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChatMessage, SupportedLanguage, Resource, ActionPlan } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { sendChatMessage } from '../services/api';
import { getLocalizedResource } from '../data/resources';
import VoiceModal from '../components/VoiceModal';

interface Props {
  lang: SupportedLanguage;
  setLang: (l: SupportedLanguage) => void;
  openEmergency: () => void;
  voiceActive?: boolean;
}

export default function ChatScreen({ lang, setLang, openEmergency, voiceActive }: Props) {
  const t = TRANSLATIONS[lang];
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [voiceModalVisible, setVoiceModalVisible] = useState(Boolean(voiceActive));
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: t.chat_welcome,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const flatListRef = useRef<FlatList>(null);

  const quickPrompts = [
    { label: t.cat_utility_assistance, icon: 'flash', query: lang === 'es' ? 'Necesito ayuda para pagar mi factura de luz' : lang === 'tl' ? 'Kailangan ko ng tulong pambayad sa kuryente' : 'I need help paying my electric bill' },
    { label: t.cat_food_assistance, icon: 'nutrition', query: lang === 'es' ? 'Necesito comida para mis hijos' : lang === 'tl' ? 'Kailangan namin ng pagkain para sa pamilya' : 'I need food for my family' },
    { label: t.cat_housing, icon: 'home', query: lang === 'es' ? 'Ayuda con el alquiler y desalojo' : lang === 'tl' ? 'Tulong sa upa at pabahay' : 'Help with rent and housing' },
    { label: t.cat_healthcare, icon: 'medkit', query: lang === 'es' ? 'Clínica médica de bajo costo' : lang === 'tl' ? 'Klinika at tulong medikal' : 'Low cost medical clinic' },
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendChatMessage(text, lang);

      // Auto-adapt language if user spoke/typed in Spanish or Tagalog
      if (response.detectedLanguage && response.detectedLanguage !== lang) {
        setLang(response.detectedLanguage);
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggested_resources: response.resources,
        action_plan: response.actionPlan,
        urgency: response.urgency,
        emergency_alert: response.emergencyAlert,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Sorry, I encountered an issue connecting. Showing local verified resources.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleVoiceTranscription = (spokenText: string) => {
    handleSend(spokenText);
  };


  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.sender === 'user';

    return (
      <View style={[styles.msgWrapper, isUser ? styles.msgRight : styles.msgLeft]}>
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
          {item.emergency_alert && (
            <View style={styles.emergencyPill}>
              <Ionicons name="warning" size={16} color="#dc2626" />
              <Text style={styles.emergencyPillText}>Emergency Alert</Text>
            </View>
          )}

          <Text style={[styles.msgText, isUser ? styles.userText : styles.botText]}>
            {item.text}
          </Text>
          <Text style={[styles.timeText, isUser ? styles.userTime : styles.botTime]}>
            {item.timestamp}
          </Text>
        </View>

        {/* Resources Cards in Chat */}
        {item.suggested_resources && item.suggested_resources.length > 0 && (
          <View style={styles.resourceContainer}>
            <Text style={styles.sectionHeader}>{t.verified_resources_header || 'Verified Community Resources'}</Text>
            {item.suggested_resources.map((rawRes) => {
              const res = getLocalizedResource(rawRes, lang);
              return (
                <View key={res.id} style={styles.resourceCard}>
                  <View style={styles.resCardHeader}>
                    <Text style={styles.resTitle}>{res.name}</Text>
                    <View style={styles.verifiedTag}>
                      <Ionicons name="checkmark-circle" size={14} color="#059669" />
                      <Text style={styles.verifiedText}>{t.verified_badge || 'Verified'}</Text>
                    </View>
                  </View>
                  <Text style={styles.resDesc} numberOfLines={3}>
                    {res.description}
                  </Text>
                  <Text style={styles.resAddress}>
                    <Ionicons name="location-outline" size={12} color="#64748b" /> {res.address}, {res.city}
                  </Text>

                  <View style={styles.resBtnRow}>
                    <TouchableOpacity
                      style={styles.resActionBtn}
                      onPress={() => Linking.openURL(`tel:${res.phone.replace(/[^0-9]/g, '')}`)}
                    >
                      <Ionicons name="call" size={14} color="#0284c7" />
                      <Text style={styles.resActionText}>{t.call_now} ({res.phone})</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.resActionBtn}
                      onPress={() =>
                        Linking.openURL(
                          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            `${res.name}, ${res.address}, North Las Vegas, NV`
                          )}`
                        )
                      }
                    >
                      <Ionicons name="navigate" size={14} color="#0284c7" />
                      <Text style={styles.resActionText}>{t.view_map}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Action Plan in Chat */}
        {item.action_plan && item.action_plan.items.length > 0 && (
          <View style={styles.actionPlanContainer}>
            <View style={styles.actionPlanHeader}>
              <Ionicons name="clipboard" size={18} color="#0284c7" />
              <Text style={styles.actionPlanTitle}>{t.action_plan_title}</Text>
            </View>

            {item.action_plan.items.map((planItem) => (
              <View key={planItem.id} style={styles.planItemCard}>
                <View style={styles.planStepBadge}>
                  <Text style={styles.planStepText}>{t.action_plan_step} {planItem.step_number}</Text>
                </View>
                <Text style={styles.planItemTitle}>{planItem.title}</Text>
                <Text style={styles.planItemDesc}>{planItem.description}</Text>

                <Text style={styles.planDocsHeader}>{t.documents_needed}</Text>
                {planItem.documents_needed.map((doc, dIdx) => (
                  <Text key={dIdx} style={styles.planDocItem}>
                    • {doc}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Top Header Bar */}
      <View style={styles.topHeader}>
        <View style={styles.langSelector}>
          {(['en', 'es', 'tl'] as SupportedLanguage[]).map((l) => (
            <TouchableOpacity
              key={l}
              style={[styles.langBtn, lang === l && styles.langBtnActive]}
              onPress={() => setLang(l)}
            >
              <Text style={[styles.langBtnText, lang === l && styles.langBtnTextActive]}>
                {l.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.emergencyTopBtn} onPress={openEmergency}>
          <Ionicons name="warning" size={16} color="#dc2626" />
          <Text style={styles.emergencyTopBtnText}>911 / 988</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Category Chips */}
      <View style={styles.chipRow}>
        {quickPrompts.map((chip, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.chip}
            onPress={() => handleSend(chip.query)}
          >
            <Ionicons name={chip.icon as any} size={13} color="#0284c7" style={{ marginRight: 4 }} />
            <Text style={styles.chipText}>{chip.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Message Stream */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color="#0284c7" />
          <Text style={styles.loadingText}>Analyzing needs & finding local resources...</Text>
        </View>
      )}

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <TouchableOpacity
          style={styles.micBtn}
          onPress={() => setVoiceModalVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="mic" size={20} color="#0284c7" />
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          value={input}
          onChangeText={setInput}
          placeholder={t.chat_placeholder}
          placeholderTextColor="#94a3b8"
          multiline
        />

        <TouchableOpacity
          style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
          onPress={() => handleSend()}
          disabled={!input.trim() || loading}
        >
          <Ionicons name="arrow-up" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Voice Assistant Modal */}
      <VoiceModal
        visible={voiceModalVisible}
        onClose={() => setVoiceModalVisible(false)}
        lang={lang}
        onTranscriptionComplete={handleVoiceTranscription}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  langSelector: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    padding: 2,
  },
  langBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  langBtnActive: {
    backgroundColor: '#0284c7',
  },
  langBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  langBtnTextActive: {
    color: '#ffffff',
  },
  emergencyTopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fef2f2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  emergencyTopBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#dc2626',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0369a1',
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  msgWrapper: {
    marginBottom: 16,
    maxWidth: '92%',
  },
  msgLeft: {
    alignSelf: 'flex-start',
  },
  msgRight: {
    alignSelf: 'flex-end',
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userBubble: {
    backgroundColor: '#0284c7',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  msgText: {
    fontSize: 15,
    lineHeight: 21,
  },
  userText: {
    color: '#ffffff',
  },
  botText: {
    color: '#0f172a',
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
  userTime: {
    color: '#bae6fd',
  },
  botTime: {
    color: '#94a3b8',
  },
  emergencyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  emergencyPillText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '700',
  },
  resourceContainer: {
    marginTop: 12,
    gap: 10,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resourceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    elevation: 1,
  },
  resCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  resTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
    marginRight: 6,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  resDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
    marginVertical: 4,
  },
  resAddress: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 8,
  },
  resBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  resActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#f0f9ff',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  resActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0284c7',
  },
  actionPlanContainer: {
    marginTop: 12,
    backgroundColor: '#f0fdf4',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  actionPlanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  actionPlanTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#15803d',
  },
  planItemCard: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  planStepBadge: {
    backgroundColor: '#dcfce7',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  planStepText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#166534',
  },
  planItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  planItemDesc: {
    fontSize: 12,
    color: '#475569',
    marginVertical: 4,
  },
  planDocsHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803d',
    marginTop: 4,
  },
  planDocItem: {
    fontSize: 11,
    color: '#334155',
    lineHeight: 15,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#64748b',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 8,
  },
  micBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 100,
    color: '#0f172a',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0284c7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#94a3b8',
  },
});

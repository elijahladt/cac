import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Platform,
  Animated,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import {
  useAudioRecorder,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from 'expo-audio';
import { SupportedLanguage } from '../types';
import { getApiBaseUrl, API_BASE_URL } from '../services/api';

interface Props {
  visible: boolean;
  onClose: () => void;
  lang: SupportedLanguage;
  onTranscriptionComplete: (text: string) => void;
}

export default function VoiceModal({
  visible,
  onClose,
  lang: initialLang,
  onTranscriptionComplete,
}: Props) {
  const [activeLang, setActiveLang] = useState<SupportedLanguage>(initialLang);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [statusNote, setStatusNote] = useState<string | null>(null);

  // Pulse animation for mic button
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  // Native audio recorder hook from expo-audio (SDK 57)
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  // Web SpeechRecognition ref
  const webRecognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const inputRef = useRef<TextInput>(null);

  const samplePrompts: Record<SupportedLanguage, { label: string; text: string }[]> = {
    en: [
      { label: '⚡ Power Bill Relief', text: 'My power might get shut off and I need help getting food for my kids.' },
      { label: '🏠 Rental Assistance', text: 'I am behind on rent in North Las Vegas and received an eviction notice.' },
      { label: '🩺 Medical Clinic', text: 'I need a low-cost community health clinic for my family.' },
    ],
    es: [
      { label: '⚡ Luz y Comida', text: 'Mi factura de electricidad está muy alta y necesito comida para mis hijos.' },
      { label: '🏠 Ayuda de Alquiler', text: 'Necesito ayuda con el alquiler de mi casa en North Las Vegas.' },
      { label: '🩺 Clínica de Salud', text: 'Busco una clínica médica comunitaria de bajo costo.' },
    ],
    tl: [
      { label: '⚡ Kuryente at Pagkain', text: 'Mataas ang singil sa kuryente at kailangan ko ng pagkain para sa mga bata.' },
      { label: '🏠 Tulong sa Upa', text: 'Kailangan ko ng tulong pambayad sa upa sa North Las Vegas.' },
      { label: '🩺 Klinika', text: 'Naghahanap ako ng murang klinika para sa aking pamilya.' },
    ],
  };


  // Sync activeLang if initialLang changes
  useEffect(() => {
    setActiveLang(initialLang);
  }, [initialLang]);

  // Keyboard show/hide listeners
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (visible) {
      setTranscribedText('');
      setRecordingDuration(0);
      startRecording(activeLang);
    } else {
      stopRecording();
      Keyboard.dismiss();
    }
    return () => {
      stopRecording();
      Keyboard.dismiss();
    };
  }, [visible]);

  const startPulseAnimation = () => {
    pulseLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.current.start();
  };

  const stopPulseAnimation = () => {
    if (pulseLoop.current) {
      pulseLoop.current.stop();
    }
    pulseAnim.setValue(1);
  };

  const getLanguageCode = (l: SupportedLanguage) => {
    switch (l) {
      case 'es':
        return 'es-US';
      case 'tl':
        return 'fil-PH';
      default:
        return 'en-US';
    }
  };

  const startRecording = async (langToRecord = activeLang) => {
    Keyboard.dismiss();
    setIsRecording(true);
    startPulseAnimation();

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRecordingDuration((prev) => prev + 1);
    }, 1000);

    // 1. Browser Speech Recognition (Web & WebView)
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = getLanguageCode(langToRecord);

          recognition.onresult = (event: any) => {
            let current = '';
            for (let i = 0; i < event.results.length; i++) {
              current += event.results[i][0].transcript;
            }
            if (current) {
              setTranscribedText(current);
            }
          };

          recognition.onerror = (err: any) => {
            console.warn('Web speech recognition note:', err?.error);
          };

          recognition.start();
          webRecognitionRef.current = recognition;
        } catch (e) {
          console.warn('Web speech recognition start error:', e);
        }
      }
    }

    // 2. Native Mobile Audio Recording via expo-audio
    try {
      if (Platform.OS !== 'web') {
        const { granted } = await requestRecordingPermissionsAsync();
        if (granted) {
          await setAudioModeAsync({
            allowsRecording: true,
            playsInSilentMode: true,
          });
          await audioRecorder.prepareToRecordAsync();
          audioRecorder.record();
        }
      }
    } catch (e) {
      console.warn('Native audio recording setup note:', e);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    stopPulseAnimation();

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Stop web recognition
    if (webRecognitionRef.current) {
      try {
        webRecognitionRef.current.stop();
      } catch (e) {}
      webRecognitionRef.current = null;
    }

    // Stop native audio recorder
    let recordingUri: string | null = null;
    try {
      if (audioRecorder.isRecording) {
        await audioRecorder.stop();
        recordingUri = audioRecorder.uri;
      }
    } catch (e) {
      console.warn('Native audio recorder stop note:', e);
    }

    // If native recording produced an audio file and text is empty, transcribe via Whisper API
    if (recordingUri && !transcribedText.trim()) {
      setIsTranscribing(true);
      setStatusNote(null);
      try {
        let base64Data: string | null = null;
        if (Platform.OS !== 'web') {
          base64Data = await FileSystem.readAsStringAsync(recordingUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
        } else {
          const audioResponse = await fetch(recordingUri);
          const audioBlob = await audioResponse.blob();
          base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const result = reader.result as string;
              const b64 = result.includes(',') ? result.split(',')[1] : result;
              resolve(b64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(audioBlob);
          });
        }

        if (base64Data) {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 12000);
          const baseUrl = getApiBaseUrl();
          const res = await fetch(`${baseUrl}/api/voice/transcribe`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              audioBase64: base64Data,
              language: activeLang,
              mimeType: 'audio/m4a',
            }),
            signal: controller.signal,
          });
          clearTimeout(timer);

          if (res.ok) {
            const data = await res.json();
            if (data.transcript || data.text) {
              setTranscribedText(data.transcript || data.text);
              setStatusNote(null);
            }
          } else {
            const errData = await res.json().catch(() => ({}));
            if (errData?.error === 'OPENAI_QUOTA_EXHAUSTED' || res.status === 429) {
              setStatusNote(
                activeLang === 'es'
                  ? 'Nota: La cuenta de OpenAI no tiene saldo suficiente. Puede usar el micrófono de su teclado abajo para hablar.'
                  : activeLang === 'tl'
                  ? 'Paalala: Walang natitirang credits ang OpenAI account. Gamitin ang mikropono ng iyong keyboard sa ibaba.'
                  : 'Note: OpenAI API has no credits remaining on platform.openai.com. You can tap the button below to dictate using your keyboard microphone.'
              );
            } else {
              setStatusNote(
                activeLang === 'es'
                  ? 'No se pudo transcribir el audio. Use el teclado o frases rápidas.'
                  : activeLang === 'tl'
                  ? 'Hindi naisalin ang audio. Gamitin ang keyboard o mabilisang parirala.'
                  : 'Could not transcribe audio. You can use keyboard dictation or quick phrases.'
              );
            }
          }
        }
      } catch (err) {
        console.warn('Voice transcribe network note:', err);
        setStatusNote(
          activeLang === 'es'
            ? 'Error de conexión de audio. Use el micrófono de su teclado.'
            : activeLang === 'tl'
            ? 'Problema sa koneksyon. Gamitin ang mic ng keyboard.'
            : 'Audio connection issue. You can use your keyboard microphone.'
        );
      } finally {
        setIsTranscribing(false);
      }
    }
  };

  const handleConfirm = () => {
    Keyboard.dismiss();
    if (transcribedText.trim()) {
      onTranscriptionComplete(transcribedText.trim());
      onClose();
    }
  };

  const handleSelectQuickPrompt = (text: string) => {
    Keyboard.dismiss();
    setTranscribedText(text);
    stopRecording();
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardAvoid}
          >
            <View style={styles.modalContent}>
              {/* Header with Language Selector Pill and Close */}
              <View style={styles.header}>
                <View style={styles.langSelectorRow}>
                  {(['en', 'es', 'tl'] as SupportedLanguage[]).map((l) => (
                    <TouchableOpacity
                      key={l}
                      style={[styles.langPill, activeLang === l && styles.langPillActive]}
                      onPress={() => {
                        setActiveLang(l);
                        stopRecording();
                        startRecording(l);
                      }}
                    >
                      <Text style={[styles.langPillText, activeLang === l && styles.langPillTextActive]}>
                        {l === 'en' ? '🇺🇸 EN' : l === 'es' ? '🇪🇸 ES' : '🇵🇭 TL'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  onPress={() => {
                    Keyboard.dismiss();
                    onClose();
                  }}
                  style={styles.closeBtn}
                >
                  <Ionicons name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={{ maxHeight: 420 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* Center Mic Visualizer */}
                <View style={styles.visualizerContainer}>
                  <Animated.View
                    style={[
                      styles.pulseRing,
                      isRecording && {
                        transform: [{ scale: pulseAnim }],
                        opacity: pulseAnim.interpolate({
                          inputRange: [1, 1.3],
                          outputRange: [0.6, 0.1],
                        }),
                      },
                    ]}
                  />
                  <TouchableOpacity
                    style={[
                      styles.micCircle,
                      isRecording ? styles.micRecording : styles.micIdle,
                    ]}
                    onPress={() => {
                      Keyboard.dismiss();
                      if (isRecording) {
                        stopRecording();
                      } else {
                        startRecording();
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    {isTranscribing ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Ionicons
                        name={isRecording ? 'stop' : 'mic'}
                        size={32}
                        color="#ffffff"
                      />
                    )}
                  </TouchableOpacity>
                  <Text style={styles.timerText}>{formatTimer(recordingDuration)}</Text>
                  <Text style={styles.statusText}>
                    {isTranscribing
                      ? activeLang === 'es'
                        ? 'Transcribiendo audio...'
                        : activeLang === 'tl'
                        ? 'Isinasalin ang boses...'
                        : 'Transcribing voice...'
                      : isRecording
                      ? activeLang === 'es'
                        ? 'Escuchando en vivo... Hable ahora'
                        : activeLang === 'tl'
                        ? 'Nakikinig nang live... Magsalita na'
                        : 'Listening live... Speak now'
                      : activeLang === 'es'
                      ? 'Toque el micrófono o una frase rápida para hablar'
                      : activeLang === 'tl'
                      ? 'Pindutin ang mikropono o pumili sa ibaba'
                      : 'Tap mic or quick option to speak.'}
                  </Text>
                  {statusNote && (
                    <View style={styles.statusNoteBox}>
                      <Ionicons name="information-circle" size={16} color="#d97706" style={{ marginRight: 6 }} />
                      <Text style={styles.statusNoteText}>{statusNote}</Text>
                    </View>
                  )}
                </View>

                {/* 1-Tap Quick Spoken Phrases */}
                <View style={styles.quickPhrasesContainer}>
                  <Text style={styles.quickPhrasesLabel}>
                    {activeLang === 'es'
                      ? 'Frases Rápidas de Voz (ESPAÑOL):'
                      : activeLang === 'tl'
                      ? 'Mabilisang Parirala (TAGALOG):'
                      : 'Quick Voice Phrases (ENGLISH):'}
                  </Text>
                  <View style={styles.quickPhrasesRow}>
                    {samplePrompts[activeLang].map((p, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={styles.quickPhraseChip}
                        onPress={() => handleSelectQuickPrompt(p.text)}
                      >
                        <Text style={styles.quickPhraseChipText}>{p.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Transcribed Text Preview / Edit Box */}
                <View style={styles.previewContainer}>
                  <View style={styles.previewHeaderRow}>
                    <Text style={styles.previewLabel}>
                      {activeLang === 'es'
                        ? 'Mensaje Hablado:'
                        : activeLang === 'tl'
                        ? 'Sinasabing Mensahe:'
                        : 'Spoken Message:'}
                    </Text>
                    {keyboardVisible && (
                      <TouchableOpacity
                        style={styles.hideKeyboardChip}
                        onPress={() => Keyboard.dismiss()}
                      >
                        <Ionicons name="chevron-down" size={14} color="#0284c7" />
                        <Text style={styles.hideKeyboardText}>Hide Keyboard</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <TouchableOpacity
                    style={styles.dictateKeyboardBtn}
                    onPress={() => {
                      stopRecording();
                      inputRef.current?.focus();
                    }}
                  >
                    <Ionicons name="mic" size={16} color="#0369a1" />
                    <Text style={styles.dictateKeyboardBtnText}>
                      {activeLang === 'es'
                        ? 'Toque aquí para dictar con el micrófono de su teclado 🎙️'
                        : activeLang === 'tl'
                        ? 'Pindutin dito para magsalita gamit ang mic sa keyboard 🎙️'
                        : 'Tap here to speak using your keyboard microphone 🎙️'}
                    </Text>
                  </TouchableOpacity>

                  <TextInput
                    ref={inputRef}
                    style={styles.previewInput}
                    multiline
                    value={transcribedText}
                    onChangeText={setTranscribedText}
                    placeholder={
                      activeLang === 'es'
                        ? 'Sus palabras aparecerán aquí mientras habla... (o use el micrófono de su teclado)'
                        : activeLang === 'tl'
                        ? 'Lilitaw dito ang iyong sinasabi... (o gamitin ang mic sa keyboard)'
                        : 'Your words will appear here as you speak... (or use keyboard mic)'
                    }
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              </ScrollView>

              {/* Action Buttons */}
              <View style={styles.actionRow}>
                {isRecording ? (
                  <TouchableOpacity
                    style={styles.doneRecordingBtn}
                    onPress={() => {
                      Keyboard.dismiss();
                      stopRecording();
                    }}
                  >
                    <Ionicons name="checkmark" size={18} color="#ffffff" style={{ marginRight: 6 }} />
                    <Text style={styles.doneRecordingText}>
                      {activeLang === 'es' ? 'Terminar de Hablar' : activeLang === 'tl' ? 'Tapos Nang Magsalita' : 'Done Speaking'}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.sendBtn,
                      !transcribedText.trim() && styles.sendBtnDisabled,
                    ]}
                    onPress={handleConfirm}
                    disabled={!transcribedText.trim()}
                  >
                    <Ionicons name="arrow-up-circle" size={20} color="#ffffff" style={{ marginRight: 6 }} />
                    <Text style={styles.sendBtnText}>
                      {activeLang === 'es' ? 'Enviar a Nevada Nexus' : activeLang === 'tl' ? 'Ipadala sa Nevada Nexus' : 'Send to Nevada Nexus'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'flex-end',
  },
  keyboardAvoid: {
    width: '100%',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  langSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  langPillActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7',
  },
  langPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  langPillTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  visualizerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
  },
  pulseRing: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#0284c7',
  },
  micCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  micRecording: {
    backgroundColor: '#dc2626',
  },
  micIdle: {
    backgroundColor: '#0284c7',
  },
  timerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    textAlign: 'center',
  },
  quickPhrasesContainer: {
    marginTop: 10,
  },
  quickPhrasesLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  quickPhrasesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  quickPhraseChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quickPhraseChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  previewContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 12,
    minHeight: 80,
  },
  previewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  previewLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
  },
  hideKeyboardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  hideKeyboardText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284c7',
  },
  dictateKeyboardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#e0f2fe',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
  },
  dictateKeyboardBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0369a1',
    flex: 1,
  },
  previewInput: {
    fontSize: 14,
    color: '#0f172a',
    lineHeight: 20,
    maxHeight: 90,
  },
  actionRow: {
    marginTop: 14,
  },
  doneRecordingBtn: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
  },
  doneRecordingText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  sendBtn: {
    backgroundColor: '#0284c7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
  },
  sendBtnDisabled: {
    backgroundColor: '#94a3b8',
  },
  sendBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  statusNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 8,
    maxWidth: '90%',
  },
  statusNoteText: {
    fontSize: 11,
    color: '#92400e',
    fontWeight: '500',
    flex: 1,
    lineHeight: 15,
  },
});

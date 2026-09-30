import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SupportedLanguage, UserProfile, UserSurveyData } from './src/types';
import { TRANSLATIONS } from './src/i18n/translations';
import { getStoredUser, saveUser, clearUser, createDemoUser, updateUserSurvey } from './src/services/auth';
import AuthScreen from './src/screens/AuthScreen';
import SurveyScreen from './src/screens/SurveyScreen';
import ForYouScreen from './src/screens/ForYouScreen';
import ChatScreen from './src/screens/ChatScreen';
import ResourcesScreen from './src/screens/ResourcesScreen';
import DocumentScannerScreen from './src/screens/DocumentScannerScreen';
import CaseScreen from './src/screens/CaseScreen';
import EmergencyModal from './src/screens/EmergencyModal';
import VoiceModal from './src/components/VoiceModal';

type Tab = 'for_you' | 'chat' | 'resources' | 'documents' | 'case';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showSurvey, setShowSurvey] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('for_you');
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [emergencyVisible, setEmergencyVisible] = useState(false);
  const [voiceModalVisible, setVoiceModalVisible] = useState(false);

  // Load stored user on mount
  useEffect(() => {
    async function loadInitialUser() {
      const stored = await getStoredUser();
      if (stored) {
        setUser(stored);
        if (stored.surveyData?.languagePreference) {
          setLang(stored.surveyData.languagePreference);
        }
      } else {
        // Show Sign Up / Login screen by default
        setUser(null);
      }
      setLoading(false);
    }
    loadInitialUser();
  }, []);

  const handleAuthSuccess = async (authenticatedUser: UserProfile, isNewUser: boolean) => {
    setUser(authenticatedUser);
    if (isNewUser || !authenticatedUser.surveyCompleted) {
      setShowSurvey(true);
    } else {
      setShowSurvey(false);
      setActiveTab('for_you');
    }
  };

  const handleSurveyComplete = async (surveyData: UserSurveyData) => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      surveyCompleted: true,
      surveyData,
    };
    setUser(updated);
    setLang(surveyData.languagePreference);
    await updateUserSurvey(user.id, surveyData);
    setShowSurvey(false);
    setActiveTab('for_you');
  };

  const handleLogout = async () => {
    await clearUser();
    setUser(null);
    setShowSurvey(false);
  };

  const t = TRANSLATIONS[lang];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0284c7" />
        <Text style={styles.loadingText}>Loading Nevada Nexus...</Text>
      </View>
    );
  }

  // 1. Not logged in -> Show Sign Up / Login
  if (!user) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
          <ExpoStatusBar style="dark" />
          <AuthScreen onAuthSuccess={handleAuthSuccess} />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // 2. User needs or requested to take the survey
  if (showSurvey || !user.surveyCompleted) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
          <ExpoStatusBar style="dark" />
          <SurveyScreen
            userName={user.name}
            initialLanguage={lang}
            onComplete={handleSurveyComplete}
            onSkip={() => {
              setShowSurvey(false);
              setActiveTab('for_you');
            }}
          />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // 3. Main Authenticated Application
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <ExpoStatusBar style="dark" />
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

        {/* Top App Header with Civic Branding, User Profile, and SOS */}
        <View style={styles.appHeader}>
          <View style={styles.brandingRow}>
            <View style={styles.appLogo}>
              <Ionicons name="compass" size={20} color="#ffffff" />
            </View>
            <View>
              <Text style={styles.brandTitle}>Nevada Nexus</Text>
              <Text style={styles.brandSub}>
                NV-04 • {user.name.split(' ')[0]}
              </Text>
            </View>
          </View>

          <View style={styles.headerRightActions}>
            <TouchableOpacity
              style={styles.sosButton}
              onPress={() => setEmergencyVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="warning" size={13} color="#ffffff" style={{ marginRight: 4 }} />
              <Text style={styles.sosText}>911 / 988</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={18} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Screen Body */}
        <View style={styles.screenBody}>
          {activeTab === 'for_you' && (
            <ForYouScreen
              user={user}
              lang={lang}
              onNavigateTab={(targetTab) => setActiveTab(targetTab)}
              onOpenVoice={() => setVoiceModalVisible(true)}
              onEditSurvey={() => setShowSurvey(true)}
              onOpenEmergency={() => setEmergencyVisible(true)}
            />
          )}

          {activeTab === 'chat' && (
            <ChatScreen
              lang={lang}
              setLang={setLang}
              openEmergency={() => setEmergencyVisible(true)}
            />
          )}

          {activeTab === 'resources' && <ResourcesScreen lang={lang} />}
          {activeTab === 'documents' && <DocumentScannerScreen lang={lang} />}
          {activeTab === 'case' && <CaseScreen lang={lang} />}
        </View>

        {/* Bottom Tab Navigation Bar with 5 Tabs */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.tabBtn}
            onPress={() => setActiveTab('for_you')}
            activeOpacity={0.7}
          >
            <Ionicons
              name={activeTab === 'for_you' ? 'sparkles' : 'sparkles-outline'}
              size={20}
              color={activeTab === 'for_you' ? '#0284c7' : '#94a3b8'}
            />
            <Text style={[styles.tabLabel, activeTab === 'for_you' && styles.tabLabelActive]}>
              {t.tab_for_you || 'For You'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabBtn}
            onPress={() => setActiveTab('chat')}
            activeOpacity={0.7}
          >
            <Ionicons
              name={activeTab === 'chat' ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline'}
              size={20}
              color={activeTab === 'chat' ? '#0284c7' : '#94a3b8'}
            />
            <Text style={[styles.tabLabel, activeTab === 'chat' && styles.tabLabelActive]}>
              {t.tab_chat}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabBtn}
            onPress={() => setActiveTab('resources')}
            activeOpacity={0.7}
          >
            <Ionicons
              name={activeTab === 'resources' ? 'layers' : 'layers-outline'}
              size={20}
              color={activeTab === 'resources' ? '#0284c7' : '#94a3b8'}
            />
            <Text style={[styles.tabLabel, activeTab === 'resources' && styles.tabLabelActive]}>
              {t.tab_resources}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabBtn}
            onPress={() => setActiveTab('documents')}
            activeOpacity={0.7}
          >
            <Ionicons
              name={activeTab === 'documents' ? 'document-text' : 'document-text-outline'}
              size={20}
              color={activeTab === 'documents' ? '#0284c7' : '#94a3b8'}
            />
            <Text style={[styles.tabLabel, activeTab === 'documents' && styles.tabLabelActive]}>
              {t.tab_documents}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabBtn}
            onPress={() => setActiveTab('case')}
            activeOpacity={0.7}
          >
            <Ionicons
              name={activeTab === 'case' ? 'checkbox' : 'checkbox-outline'}
              size={20}
              color={activeTab === 'case' ? '#0284c7' : '#94a3b8'}
            />
            <Text style={[styles.tabLabel, activeTab === 'case' && styles.tabLabelActive]}>
              {t.tab_case}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Global Emergency Modal */}
        <EmergencyModal
          visible={emergencyVisible}
          onClose={() => setEmergencyVisible(false)}
          lang={lang}
        />

        {/* Global Voice Modal */}
        <VoiceModal
          visible={voiceModalVisible}
          onClose={() => setVoiceModalVisible(false)}
          lang={lang}
          onTranscriptionComplete={(text) => {
            setVoiceModalVisible(false);
            setActiveTab('chat');
          }}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
  },
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  brandingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  appLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#0284c7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  brandSub: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc2626',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 12,
  },
  sosText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  logoutBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  screenBody: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  tabBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 3,
    minWidth: 54,
  },
  tabLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
    marginTop: 3,
  },
  tabLabelActive: {
    color: '#0284c7',
  },
});

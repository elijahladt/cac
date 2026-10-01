import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserProfile, SupportedLanguage, Resource } from '../types';
import {
  VERIFIED_RESOURCES,
  VERIFIED_PROGRAMS,
  getLocalizedResource,
} from '../data/resources';
import { TRANSLATIONS } from '../i18n/translations';

interface Props {
  user: UserProfile;
  lang: SupportedLanguage;
  onNavigateTab: (tab: 'chat' | 'resources' | 'case' | 'intake' | 'eligibility' | 'documents') => void;
  onOpenVoice: () => void;
  onEditSurvey: () => void;
  onOpenEmergency: () => void;
}

export default function ForYouScreen({
  user,
  lang,
  onNavigateTab,
  onOpenVoice,
  onEditSurvey,
  onOpenEmergency,
}: Props) {
  const t = TRANSLATIONS[lang];
  const survey = user.surveyData;

  // Personalized resources matching user's primary needs
  const matchingResources = VERIFIED_RESOURCES.filter((r) => {
    if (!survey?.primaryNeeds || survey.primaryNeeds.length === 0) return true;
    return survey.primaryNeeds.includes(r.category);
  }).map((r) => getLocalizedResource(r, lang));

  const getReasonForRecommendation = (res: Resource) => {
    if (lang === 'es') {
      if (res.category === 'utility_assistance') {
        return 'Recomendado porque solicitó ayuda con las facturas de servicios públicos en North Las Vegas.';
      }
      if (res.category === 'food_assistance') {
        return `Recomendado para su hogar de ${survey?.householdSize || 1} personas. Alimentos frescos gratuitos sin requisitos complejos.`;
      }
      if (res.category === 'housing') {
        return 'Recomendado para apoyo de vivienda y prevención de desalojos de emergencia.';
      }
      return 'Recurso verificado de asistencia comunitaria en North Las Vegas.';
    }

    if (lang === 'tl') {
      if (res.category === 'utility_assistance') {
        return 'Inirerekomenda dahil humiling ka ng tulong pambayad sa kuryente sa North Las Vegas.';
      }
      if (res.category === 'food_assistance') {
        return `Inirerekomenda para sa pamilyang may ${survey?.householdSize || 1} miyembro. Libreng pagkain at pamilihan.`;
      }
      if (res.category === 'housing') {
        return 'Inirerekomenda para sa tulong sa upa at pagpigil sa pagpapaalis sa bahay.';
      }
      return 'Napatunayang programa ng komunidad sa North Las Vegas.';
    }

    if (res.category === 'utility_assistance') {
      return `Recommended because you requested utility bill assistance. Matches households with income in your range.`;
    }
    if (res.category === 'food_assistance') {
      return `Recommended for your household of ${survey?.householdSize || 1}. Free walk-in groceries with no income proof required.`;
    }
    if (res.category === 'housing') {
      return `Recommended based on your housing status (${survey?.housingStatus === 'at_risk' ? 'At risk of losing housing' : 'Housing support'}). Emergency diversion available.`;
    }
    return `Verified community assistance provider in North Las Vegas.`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Personalized Welcome Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileHeaderRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {user.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetingText}>Welcome back,</Text>
            <Text style={styles.userNameText}>{user.name}</Text>
          </View>
          <TouchableOpacity style={styles.editSurveyBtn} onPress={onEditSurvey}>
            <Ionicons name="options-outline" size={16} color="#0284c7" />
            <Text style={styles.editSurveyText}>Preferences</Text>
          </TouchableOpacity>
        </View>

        {/* Survey summary pill row */}
        {survey && (
          <View style={styles.householdPillRow}>
            <View style={styles.householdPill}>
              <Ionicons name="people" size={13} color="#0369a1" />
              <Text style={styles.householdPillText}>
                {survey.householdSize} {survey.householdSize === 1 ? 'Person' : 'People'}
              </Text>
            </View>

            <View style={styles.householdPill}>
              <Ionicons name="cash-outline" size={13} color="#0369a1" />
              <Text style={styles.householdPillText}>
                {survey.incomeRange === '$0'
                  ? 'No income'
                  : survey.incomeRange === 'under_1500'
                  ? '< $1,500/mo'
                  : survey.incomeRange === '1500_3000'
                  ? '$1.5k–$3k/mo'
                  : 'Income noted'}
              </Text>
            </View>

            <View style={styles.householdPill}>
              <Ionicons name="home-outline" size={13} color="#0369a1" />
              <Text style={styles.householdPillText}>
                {survey.housingStatus === 'at_risk'
                  ? 'At risk housing'
                  : survey.housingStatus === 'unhoused'
                  ? 'Unhoused'
                  : 'Housing noted'}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Voice Prompt Action Banner */}
      <View style={styles.voiceBanner}>
        <View style={styles.voiceBannerContent}>
          <Ionicons name="sparkles" size={20} color="#0284c7" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.voiceBannerTitle}>Need something specific?</Text>
            <Text style={styles.voiceBannerSub}>
              Tap the mic to tell the AI Copilot in English, Español, or Tagalog.
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.voiceBannerBtn} onPress={onOpenVoice} activeOpacity={0.8}>
          <Ionicons name="mic" size={20} color="#ffffff" style={{ marginRight: 6 }} />
          <Text style={styles.voiceBannerBtnText}>Speak to Navigator</Text>
        </TouchableOpacity>
      </View>

      {/* 3 Quick Action Protocol Cards */}
      <View style={styles.protocolGrid}>
        <TouchableOpacity
          style={[styles.protocolCard, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}
          onPress={() => onNavigateTab('eligibility')}
          activeOpacity={0.8}
        >
          <View style={styles.protocolIconCircle}>
            <Ionicons name="calculator" size={18} color="#16a34a" />
          </View>
          <Text style={styles.protocolTitle}>Eligibility Rules</Text>
          <Text style={styles.protocolSub}>FPL & AMI matching</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.protocolCard, { backgroundColor: '#f0f9ff', borderColor: '#bae6fd' }]}
          onPress={() => onNavigateTab('intake')}
          activeOpacity={0.8}
        >
          <View style={styles.protocolIconCircle}>
            <Ionicons name="paper-plane" size={18} color="#0284c7" />
          </View>
          <Text style={styles.protocolTitle}>Direct Intake</Text>
          <Text style={styles.protocolSub}>1-form queue dispatch</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.protocolCard, { backgroundColor: '#faf5ff', borderColor: '#e9d5ff' }]}
          onPress={() => onNavigateTab('intake')}
          activeOpacity={0.8}
        >
          <View style={styles.protocolIconCircle}>
            <Ionicons name="shield-checkmark" size={18} color="#9333ea" />
          </View>
          <Text style={styles.protocolTitle}>Track Referrals</Text>
          <Text style={styles.protocolSub}>Closed-loop milestones</Text>
        </TouchableOpacity>
      </View>

      {/* Priority Recommended Resources Section */}
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionTitle}>Recommended For Your Household</Text>
          <Text style={styles.sectionSub}>
            Ranked based on your intake responses & North Las Vegas eligibility
          </Text>
        </View>
        <TouchableOpacity onPress={() => onNavigateTab('resources')}>
          <Text style={styles.viewAllText}>View All ({VERIFIED_RESOURCES.length})</Text>
        </TouchableOpacity>
      </View>

      {/* Personalized Resource Cards */}
      {matchingResources.map((res) => (
        <View key={res.id} style={styles.resCard}>
          <View style={styles.resCardTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.resName}>{res.name}</Text>
              <Text style={styles.resAddress}>
                <Ionicons name="location-outline" size={12} color="#64748b" /> {res.address}, {res.city}
              </Text>
            </View>
            <View style={styles.verifiedTag}>
              <Ionicons name="shield-checkmark" size={13} color="#059669" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          </View>

          {/* AI Recommendation Reason */}
          <View style={styles.aiReasonBox}>
            <Ionicons name="bulb-outline" size={14} color="#0369a1" />
            <Text style={styles.aiReasonText}>{getReasonForRecommendation(res)}</Text>
          </View>

          <Text style={styles.resDesc} numberOfLines={2}>
            {res.description}
          </Text>

          <View style={styles.resMeta}>
            <Text style={styles.resMetaText}>⏰ {res.hours}</Text>
            <Text style={styles.resMetaText}>
              🗣️ {res.languages.map((l) => l.toUpperCase()).join(', ')}
            </Text>
          </View>

          {/* Call & Directions Action Row */}
          <View style={styles.cardBtnRow}>
            <TouchableOpacity
              style={styles.cardCallBtn}
              onPress={() => Linking.openURL(`tel:${res.phone.replace(/[^0-9]/g, '')}`)}
            >
              <Ionicons name="call" size={14} color="#ffffff" style={{ marginRight: 4 }} />
              <Text style={styles.cardCallBtnText}>{t.call_now} ({res.phone})</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cardMapBtn}
              onPress={() =>
                Linking.openURL(
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${res.name}, ${res.address}, North Las Vegas, NV`
                  )}`
                )
              }
            >
              <Ionicons name="navigate" size={14} color="#0284c7" style={{ marginRight: 4 }} />
              <Text style={styles.cardMapBtnText}>{t.view_map}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Quick Action Shortcuts */}
      <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 12 }]}>
        Helpful Navigation Tools
      </Text>

      <View style={styles.toolsGrid}>
        <TouchableOpacity
          style={styles.toolCard}
          onPress={() => onNavigateTab('chat')}
          activeOpacity={0.8}
        >
          <View style={[styles.toolIconCircle, { backgroundColor: '#e0f2fe' }]}>
            <Ionicons name="chatbubbles" size={22} color="#0284c7" />
          </View>
          <Text style={styles.toolTitle}>AI Copilot</Text>
          <Text style={styles.toolDesc}>Ask any question in your language</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolCard}
          onPress={() => onNavigateTab('documents')}
          activeOpacity={0.8}
        >
          <View style={[styles.toolIconCircle, { backgroundColor: '#dcfce7' }]}>
            <Ionicons name="camera" size={22} color="#059669" />
          </View>
          <Text style={styles.toolTitle}>Scan Bill</Text>
          <Text style={styles.toolDesc}>Extract past-due notices & amounts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolCard}
          onPress={() => onNavigateTab('case')}
          activeOpacity={0.8}
        >
          <View style={[styles.toolIconCircle, { backgroundColor: '#fef3c7' }]}>
            <Ionicons name="checkbox" size={22} color="#d97706" />
          </View>
          <Text style={styles.toolTitle}>Action Checklist</Text>
          <Text style={styles.toolDesc}>Track documents & application steps</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolCard}
          onPress={onOpenEmergency}
          activeOpacity={0.8}
        >
          <View style={[styles.toolIconCircle, { backgroundColor: '#fee2e2' }]}>
            <Ionicons name="warning" size={22} color="#dc2626" />
          </View>
          <Text style={styles.toolTitle}>Crisis Support</Text>
          <Text style={styles.toolDesc}>911, 988 Lifeline, 2-1-1 Nevada</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0284c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  greetingText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  userNameText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  editSurveyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  editSurveyText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284c7',
  },
  householdPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  householdPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  householdPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0369a1',
  },
  voiceBanner: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
  },
  voiceBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  voiceBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  voiceBannerSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 16,
  },
  voiceBannerBtn: {
    backgroundColor: '#0284c7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  voiceBannerBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  sectionSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284c7',
  },
  resCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 1,
  },
  resCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  resName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginRight: 6,
  },
  resAddress: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
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
  aiReasonBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#f0fdf4',
    padding: 8,
    borderRadius: 8,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  aiReasonText: {
    fontSize: 11,
    color: '#166534',
    flex: 1,
    lineHeight: 15,
    fontWeight: '500',
  },
  resDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
    marginVertical: 4,
  },
  resMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 10,
  },
  resMetaText: {
    fontSize: 11,
    color: '#64748b',
  },
  cardBtnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  cardCallBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0284c7',
    paddingVertical: 10,
    borderRadius: 10,
  },
  cardCallBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  cardMapBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f9ff',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  cardMapBtnText: {
    color: '#0284c7',
    fontSize: 12,
    fontWeight: '700',
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  toolCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  toolIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  toolTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
  },
  toolDesc: {
    fontSize: 11,
    color: '#64748b',
    lineHeight: 15,
  },
  protocolGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  protocolCard: {
    flex: 1,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    alignItems: 'center',
    textAlign: 'center',
  },
  protocolIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  protocolTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  protocolSub: {
    fontSize: 9,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 1,
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ActionPlanItem, SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { VERIFIED_RESOURCES } from '../data/resources';

interface Props {
  lang: SupportedLanguage;
}

export default function CaseScreen({ lang }: Props) {
  const t = TRANSLATIONS[lang];

  // Default active case plan
  const [items, setItems] = useState<ActionPlanItem[]>([
    {
      id: 'step-1',
      step_number: 1,
      title:
        lang === 'es'
          ? 'Contactar al programa NV Energy Project REACH'
          : lang === 'tl'
          ? 'Tawagan ang NV Energy Project REACH para sa tulong'
          : 'Apply for NV Energy Project REACH Disconnection Grant',
      description:
        'Immediate crisis funding up to $500 applied directly to electric utility account.',
      resource_name: 'NV Energy — Project REACH Assistance',
      resource_phone: '(702) 402-5555',
      resource_address: '6226 W Sahara Ave, North Las Vegas, NV',
      website: 'https://www.nvenergy.com/account-services/assistance-programs/project-reach',
      documents_needed: [
        'Past-due NV Energy disconnect notice or current bill',
        'State photo ID or Nevada driver license',
        'Last 30 days pay stubs or SSI benefit award letter',
      ],
      status: 'IN_PROGRESS',
      completed: false,
    },
    {
      id: 'step-2',
      step_number: 2,
      title:
        lang === 'es'
          ? 'Recoger despensa de alimentos en Three Square Food Bank'
          : lang === 'tl'
          ? 'Kumuha ng relief na pagkain sa Three Square Food Bank'
          : 'Visit Three Square Food Bank Campus for Emergency Groceries',
      description:
        'Free walk-in pantry offering fresh produce, pantry staples, and children meal packs. No income proof required.',
      resource_name: 'Three Square Food Bank — North Las Vegas Campus',
      resource_phone: '(702) 644-3663',
      resource_address: '4190 N Pecos Rd, North Las Vegas, NV',
      website: 'https://www.threesquare.org/',
      documents_needed: ['Self-attestation of food need (No ID strictly required)'],
      status: 'PENDING',
      completed: false,
    },
    {
      id: 'step-3',
      step_number: 3,
      title:
        lang === 'es'
          ? 'Solicitar beneficio de emergencia LIHEAP de Nevada'
          : lang === 'tl'
          ? 'Mag-apply sa Nevada DWSS LIHEAP Fast-Track Crisis'
          : 'Submit Fast-Track LIHEAP Crisis Application (Nevada DWSS)',
      description:
        'State annual energy assistance grants processed within 48 hours for households facing imminent shutoff.',
      resource_name: 'Nevada DWSS — Energy Assistance Program (LIHEAP)',
      resource_phone: '(702) 486-1404',
      resource_address: '700 Belrose St, North Las Vegas, NV',
      website: 'https://dwss.nv.gov/Energy/1_Energy_Assistance/',
      documents_needed: [
        'Past-due bill with 48-hour shut-off notice',
        'Proof of Nevada residency (lease or utility bill)',
        'Proof of identity for all household members',
      ],
      status: 'PENDING',
      completed: false,
    },
  ]);

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              completed: !item.completed,
              status: !item.completed ? 'COMPLETED' : 'IN_PROGRESS',
            }
          : item
      )
    );
  };

  const completedCount = items.filter((i) => i.completed).length;
  const progressPercent = Math.round((completedCount / items.length) * 100);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Case Header Card */}
      <View style={styles.caseHeaderCard}>
        <View style={styles.caseBadgeRow}>
          <View style={styles.caseBadge}>
            <Ionicons name="folder-open" size={14} color="#0284c7" />
            <Text style={styles.caseBadgeText}>Case #NV04-2026-ACTIVE</Text>
          </View>
          <Text style={styles.caseDate}>Updated Today</Text>
        </View>

        <Text style={styles.caseTitle}>Community Assistance Action Plan</Text>
        <Text style={styles.caseSubtitle}>
          District: Nevada’s 4th Congressional District • North Las Vegas
        </Text>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>Action Plan Progress</Text>
            <Text style={styles.progressPercentText}>{progressPercent}% Done</Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.progressStepsText}>
            {completedCount} of {items.length} steps completed
          </Text>
        </View>
      </View>

      {/* Identified Needs Pills */}
      <View style={styles.needsRow}>
        <Text style={styles.needsTitle}>Target Needs:</Text>
        <View style={styles.needPill}>
          <Ionicons name="flash" size={12} color="#0369a1" />
          <Text style={styles.needPillText}>Utility Assistance</Text>
        </View>
        <View style={styles.needPill}>
          <Ionicons name="nutrition" size={12} color="#0369a1" />
          <Text style={styles.needPillText}>Food Assistance</Text>
        </View>
      </View>

      {/* Action Plan Steps */}
      <Text style={styles.sectionHeader}>Action Steps & Required Documents</Text>

      {items.map((item) => (
        <View
          key={item.id}
          style={[styles.stepCard, item.completed && styles.stepCardCompleted]}
        >
          {/* Checkbox & Title */}
          <TouchableOpacity
            style={styles.stepHeaderRow}
            onPress={() => toggleItem(item.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, item.completed && styles.checkboxChecked]}>
              {item.completed && <Ionicons name="checkmark" size={16} color="#ffffff" />}
            </View>

            <View style={{ flex: 1 }}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumberText}>
                  {t.action_plan_step} {item.step_number}
                </Text>
              </View>
              <Text
                style={[styles.stepTitle, item.completed && styles.stepTitleCompleted]}
              >
                {item.title}
              </Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.stepDesc}>{item.description}</Text>

          {/* Location & Organization */}
          <View style={styles.orgBox}>
            <Text style={styles.orgName}>🏢 {item.resource_name}</Text>
            {item.resource_address && (
              <Text style={styles.orgAddress}>📍 {item.resource_address}</Text>
            )}
          </View>

          {/* Required Documents Checklist */}
          <View style={styles.docsBox}>
            <Text style={styles.docsTitle}>{t.documents_needed}</Text>
            {item.documents_needed.map((doc, idx) => (
              <View key={idx} style={styles.docRow}>
                <Ionicons name="document-text-outline" size={14} color="#0284c7" />
                <Text style={styles.docText}>{doc}</Text>
              </View>
            ))}
          </View>

          {/* Quick Contact Buttons */}
          <View style={styles.stepBtnRow}>
            {item.resource_phone && (
              <TouchableOpacity
                style={styles.stepCallBtn}
                onPress={() =>
                  Linking.openURL(`tel:${item.resource_phone?.replace(/[^0-9]/g, '')}`)
                }
              >
                <Ionicons name="call" size={14} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.stepCallBtnText}>
                  {t.call_now} ({item.resource_phone})
                </Text>
              </TouchableOpacity>
            )}

            {item.website && (
              <TouchableOpacity
                style={styles.stepWebBtn}
                onPress={() => Linking.openURL(item.website!)}
              >
                <Ionicons name="globe-outline" size={14} color="#0284c7" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}

      {/* Share / Summary Info */}
      <View style={styles.disclaimerBox}>
        <Ionicons name="information-circle-outline" size={18} color="#64748b" />
        <Text style={styles.disclaimerText}>
          Nevada Nexus is an assistive navigation tool designed for the Congressional App
          Challenge. Information is retrieved from verified public programs. Always verify
          hours and documentation before traveling.
        </Text>
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
  caseHeaderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  caseBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  caseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  caseBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284c7',
  },
  caseDate: {
    fontSize: 11,
    color: '#94a3b8',
  },
  caseTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
  },
  caseSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 14,
  },
  progressContainer: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  progressPercentText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284c7',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0284c7',
    borderRadius: 4,
  },
  progressStepsText: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 6,
  },
  needsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  needsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  needPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  needPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0369a1',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 10,
  },
  stepCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  stepCardCompleted: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  stepHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#94a3b8',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  stepNumberBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  stepNumberText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 19,
  },
  stepTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#64748b',
  },
  stepDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
    marginBottom: 10,
  },
  orgBox: {
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  orgName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  orgAddress: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  docsBox: {
    backgroundColor: '#f0f9ff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  docsTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284c7',
    marginBottom: 6,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 4,
  },
  docText: {
    fontSize: 11,
    color: '#0369a1',
    flex: 1,
    lineHeight: 15,
  },
  stepBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  stepCallBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0284c7',
    paddingVertical: 10,
    borderRadius: 10,
  },
  stepCallBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  stepWebBtn: {
    width: 42,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 10,
    padding: 12,
  },
  disclaimerText: {
    fontSize: 11,
    color: '#64748b',
    lineHeight: 15,
    flex: 1,
  },
});

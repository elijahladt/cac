import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SupportedLanguage } from '../types';

interface Props {
  lang: SupportedLanguage;
  onNavigateToIntake?: () => void;
}

export default function EligibilityScreen({ lang, onNavigateToIntake }: Props) {
  const [householdSize, setHouseholdSize] = useState(3);
  const [monthlyIncome, setMonthlyIncome] = useState(2150);
  const [zipCode, setZipCode] = useState('89030');
  const [hasPastDueUtility, setHasPastDueUtility] = useState(true);
  const [hasChildren, setHasChildren] = useState(true);
  const [hasSeniors, setHasSeniors] = useState(false);

  // 2026 Nevada FPL thresholds
  const fpl150 = Math.round((1255 + (householdSize - 1) * 448) * 1.5);
  const fpl200 = Math.round((1255 + (householdSize - 1) * 448) * 2.0);
  const ami80 = 4400 + (householdSize - 1) * 630;

  const programs = [
    {
      id: 'liheap',
      name: 'Nevada DWSS — LIHEAP Energy Assistance',
      category: 'Utility Assistance',
      limit: fpl150,
      limitLabel: '150% FPL',
      qualified: monthlyIncome <= fpl150 && zipCode.startsWith('890'),
      reason:
        monthlyIncome <= fpl150
          ? `Income ($${monthlyIncome}/mo) is below $${fpl150.toLocaleString()}/mo limit.`
          : `Income ($${monthlyIncome}/mo) exceeds $${fpl150.toLocaleString()}/mo limit.`,
    },
    {
      id: 'reach',
      name: 'NV Energy — Project REACH Grant',
      category: 'Electric Bill Relief',
      limit: fpl200,
      limitLabel: '200% FPL / Hardship',
      qualified: monthlyIncome <= fpl200 || hasPastDueUtility || hasSeniors,
      reason:
        monthlyIncome <= fpl200 || hasPastDueUtility
          ? 'Qualifies for emergency disconnection prevention grant.'
          : 'Exceeds income guidelines without active shutoff notice.',
    },
    {
      id: 'snap',
      name: 'Three Square — Food & SNAP Program',
      category: 'Food Assistance',
      limit: fpl200,
      limitLabel: '200% FPL',
      qualified: monthlyIncome <= fpl200,
      reason:
        monthlyIncome <= fpl200
          ? `Qualified under Nevada SNAP guidelines ($${fpl200.toLocaleString()}/mo).`
          : `Income exceeds SNAP threshold ($${fpl200.toLocaleString()}/mo).`,
    },
    {
      id: 'chap',
      name: 'HELP of Southern Nevada — CHAP Housing',
      category: 'Rental Support',
      limit: ami80,
      limitLabel: '80% Clark County AMI',
      qualified: monthlyIncome <= ami80,
      reason:
        monthlyIncome <= ami80
          ? `Qualifies under Clark County 80% AMI ($${ami80.toLocaleString()}/mo limit).`
          : `Income exceeds Clark County 80% AMI threshold.`,
    },
  ];

  const qualifiedCount = programs.filter((p) => p.qualified).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Title Card */}
      <View style={styles.headerCard}>
        <View style={styles.badgeRow}>
          <Ionicons name="calculator" size={14} color="#f59e0b" />
          <Text style={styles.badgeText}>Nevada Rules Engine</Text>
        </View>
        <Text style={styles.title}>Programmatic Eligibility Match</Text>
        <Text style={styles.subtitle}>
          Calculated instantly against 2026 Nevada FPL and Clark County AMI guidelines.
        </Text>
      </View>

      {/* Input Controls */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Household Profile</Text>

        <View style={styles.inputRow}>
          <Text style={styles.label}>Household Size:</Text>
          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => setHouseholdSize((prev) => Math.max(1, prev - 1))}
            >
              <Ionicons name="remove" size={16} color="#0f172a" />
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{householdSize}</Text>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => setHouseholdSize((prev) => Math.min(10, prev + 1))}
            >
              <Ionicons name="add" size={16} color="#0f172a" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.label}>Monthly Income ($):</Text>
          <TextInput
            style={styles.textInput}
            keyboardType="numeric"
            value={String(monthlyIncome)}
            onChangeText={(txt) => setMonthlyIncome(Number(txt) || 0)}
          />
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.label}>Zip Code:</Text>
          <TextInput
            style={styles.textInput}
            keyboardType="numeric"
            value={zipCode}
            onChangeText={setZipCode}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Past-Due Power/Gas Bill</Text>
          <Switch
            value={hasPastDueUtility}
            onValueChange={setHasPastDueUtility}
            trackColor={{ false: '#cbd5e1', true: '#0284c7' }}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Household has Children</Text>
          <Switch
            value={hasChildren}
            onValueChange={setHasChildren}
            trackColor={{ false: '#cbd5e1', true: '#0284c7' }}
          />
        </View>
      </View>

      {/* Summary Stat */}
      <View style={styles.matchBanner}>
        <Ionicons name="checkmark-circle" size={20} color="#059669" />
        <Text style={styles.matchBannerText}>
          {qualifiedCount} of {programs.length} Programs Qualified
        </Text>
      </View>

      {/* Evaluated Programs List */}
      <View style={styles.programsList}>
        {programs.map((p) => (
          <View
            key={p.id}
            style={[styles.programCard, p.qualified ? styles.programCardQualified : styles.programCardRuledOut]}
          >
            <View style={styles.cardHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.progCategory}>{p.category}</Text>
                <Text style={styles.progName}>{p.name}</Text>
              </View>
              <View
                style={[
                  styles.statusPill,
                  p.qualified ? styles.statusPillQualified : styles.statusPillRuledOut,
                ]}
              >
                <Text
                  style={[
                    styles.statusPillText,
                    p.qualified ? styles.statusPillTextQualified : styles.statusPillTextRuledOut,
                  ]}
                >
                  {p.qualified ? 'QUALIFIED' : 'RULED OUT'}
                </Text>
              </View>
            </View>

            <Text style={styles.progReason}>{p.reason}</Text>

            <View style={styles.limitRow}>
              <Text style={styles.limitLabel}>
                Limit ({p.limitLabel}): <Text style={styles.limitValue}>${p.limit.toLocaleString()}/mo</Text>
              </Text>
            </View>
          </View>
        ))}
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
    gap: 14,
  },
  headerCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 18,
    gap: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeText: {
    color: '#fbbf24',
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 13,
    width: 110,
    textAlign: 'right',
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    minWidth: 18,
    textAlign: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  switchLabel: {
    fontSize: 12,
    color: '#334155',
  },
  matchBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    padding: 12,
    borderRadius: 14,
  },
  matchBannerText: {
    color: '#065f46',
    fontWeight: '700',
    fontSize: 13,
  },
  programsList: {
    gap: 10,
  },
  programCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 8,
  },
  programCardQualified: {
    borderColor: '#a7f3d0',
  },
  programCardRuledOut: {
    borderColor: '#e2e8f0',
    opacity: 0.75,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  progCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  progName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPillQualified: {
    backgroundColor: '#d1fae5',
  },
  statusPillRuledOut: {
    backgroundColor: '#fee2e2',
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: '800',
  },
  statusPillTextQualified: {
    color: '#065f46',
  },
  statusPillTextRuledOut: {
    color: '#991b1b',
  },
  progReason: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 15,
  },
  limitRow: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 6,
  },
  limitLabel: {
    fontSize: 10,
    color: '#64748b',
  },
  limitValue: {
    fontWeight: '700',
    color: '#0f172a',
  },
});

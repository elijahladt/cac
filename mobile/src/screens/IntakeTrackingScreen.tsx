import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SupportedLanguage } from '../types';
import { getApiBaseUrl } from '../services/api';

interface Props {
  lang: SupportedLanguage;
}

export default function IntakeTrackingScreen({ lang }: Props) {
  const [activeTab, setActiveTab] = useState<'intake' | 'tracking'>('intake');

  // Intake state
  const [fullName, setFullName] = useState('Maria Santos');
  const [phone, setPhone] = useState('(702) 555-0192');
  const [address, setAddress] = useState('2415 E Craig Rd #104');
  const [zipCode, setZipCode] = useState('89030');
  const [householdSize, setHouseholdSize] = useState('3');
  const [monthlyIncome, setMonthlyIncome] = useState('2150');
  const [selectedProviders, setSelectedProviders] = useState<string[]>([
    'res-state-dwss-liheap',
    'res-three-square',
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  // Tracking state
  const [searchCode, setSearchCode] = useState('NVN-2026-89421');
  const [trackingData, setTrackingData] = useState<any>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  const fetchTracking = async (code: string) => {
    if (!code.trim()) return;
    setTrackingLoading(true);
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/tracking/${encodeURIComponent(code.trim().toUpperCase())}`);
      const data = await res.json();
      if (res.ok && data.intake) {
        setTrackingData(data.intake);
      } else {
        setTrackingData(null);
        Alert.alert('Not Found', data.message || `No referral found for "${code}".`);
      }
    } catch (e) {
      Alert.alert('Network Note', 'Could not retrieve tracking details.');
    } finally {
      setTrackingLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'tracking' && !trackingData) {
      fetchTracking(searchCode);
    }
  }, [activeTab]);

  const handleSubmitIntake = async () => {
    if (!fullName.trim() || !phone.trim()) {
      Alert.alert('Required Fields', 'Please provide your full legal name and phone number.');
      return;
    }

    setSubmitting(true);
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/intake/direct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicant: {
            fullName,
            phone,
            address,
            city: 'North Las Vegas',
            zipCode,
          },
          household: {
            size: Number(householdSize) || 1,
            monthlyIncome: Number(monthlyIncome) || 0,
            housingStatus: 'at_risk',
            hasChildren: true,
            hasSeniors: false,
            hasDisability: false,
          },
          serviceDetails: {
            primaryNeeds: ['utility_assistance', 'food_assistance'],
            utilityProvider: 'NV Energy',
            pastDueAmount: '$218.50',
            urgentStatement: '10-day power shutoff notice and food assistance for family.',
          },
          targetProviderIds: selectedProviders,
          language: lang,
        }),
      });

      const data = await res.json();
      if (res.ok && data.submission) {
        setCreatedCode(data.submission.confirmationCode);
        setSearchCode(data.submission.confirmationCode);
        setTrackingData(data.submission);
        Alert.alert(
          'Intake Dispatched!',
          `Your confirmation code is ${data.submission.confirmationCode}. Transmitted directly to provider queues.`
        );
      } else {
        Alert.alert('Submission Error', data.error || 'Failed to submit intake.');
      }
    } catch (e: any) {
      Alert.alert('Network Error', e?.message || 'Could not connect to intake service.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleProvider = (id: string) => {
    setSelectedProviders((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Segmented Tabs */}
      <View style={styles.tabHeader}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'intake' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('intake')}
        >
          <Ionicons
            name="paper-plane"
            size={14}
            color={activeTab === 'intake' ? '#0284c7' : '#64748b'}
          />
          <Text style={[styles.segmentText, activeTab === 'intake' && styles.segmentTextActive]}>
            Direct Intake
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'tracking' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('tracking')}
        >
          <Ionicons
            name="shield-checkmark"
            size={14}
            color={activeTab === 'tracking' ? '#0284c7' : '#64748b'}
          />
          <Text style={[styles.segmentText, activeTab === 'tracking' && styles.segmentTextActive]}>
            Track Referrals
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* =========================================
            TAB 1: DIRECT ELECTRONIC INTAKE
           ========================================= */}
        {activeTab === 'intake' && (
          <View style={styles.sectionGap}>
            <View style={styles.headerCard}>
              <Text style={styles.headerTitle}>Direct Electronic Intake</Text>
              <Text style={styles.headerSubtitle}>
                Single unified form. Transmits your packet directly to provider queues with zero duplicate PDF forms.
              </Text>
            </View>

            {createdCode && (
              <View style={styles.successBanner}>
                <Ionicons name="checkmark-circle" size={20} color="#059669" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.successTitle}>Active Referral Created!</Text>
                  <Text style={styles.successCode}>Code: {createdCode}</Text>
                </View>
                <TouchableOpacity
                  style={styles.viewTrackBtn}
                  onPress={() => setActiveTab('tracking')}
                >
                  <Text style={styles.viewTrackText}>View Track</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.formCard}>
              <Text style={styles.cardTitle}>1. Applicant Contact</Text>
              <TextInput
                style={styles.input}
                placeholder="Full Legal Name"
                value={fullName}
                onChangeText={setFullName}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone Number (SMS updates)"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
              <TextInput
                style={styles.input}
                placeholder="Street Address"
                value={address}
                onChangeText={setAddress}
              />
              <TextInput
                style={styles.input}
                placeholder="Zip Code"
                keyboardType="numeric"
                value={zipCode}
                onChangeText={setZipCode}
              />
            </View>

            <View style={styles.formCard}>
              <Text style={styles.cardTitle}>2. Household & Income</Text>
              <View style={styles.twoCol}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Size (e.g. 3)"
                  keyboardType="numeric"
                  value={householdSize}
                  onChangeText={setHouseholdSize}
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Income $/mo"
                  keyboardType="numeric"
                  value={monthlyIncome}
                  onChangeText={setMonthlyIncome}
                />
              </View>
            </View>

            <View style={styles.formCard}>
              <Text style={styles.cardTitle}>3. Target Provider Queues</Text>

              {[
                { id: 'res-state-dwss-liheap', name: 'Nevada DWSS LIHEAP', sub: 'Electric & Gas Crisis Grant' },
                { id: 'res-three-square', name: 'Three Square Food Bank', sub: 'Food & SNAP Enrollment' },
                { id: 'res-nv-energy-reach', name: 'NV Energy Project REACH', sub: 'Disconnection Prevention' },
                { id: 'res-help-southern-nevada', name: 'HELP of Southern Nevada', sub: 'CHAP Rental Assistance' },
              ].map((prov) => {
                const checked = selectedProviders.includes(prov.id);
                return (
                  <TouchableOpacity
                    key={prov.id}
                    style={[styles.checkRow, checked && styles.checkRowActive]}
                    onPress={() => toggleProvider(prov.id)}
                  >
                    <Ionicons
                      name={checked ? 'checkbox' : 'square-outline'}
                      size={18}
                      color={checked ? '#0284c7' : '#94a3b8'}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.checkName}>{prov.name}</Text>
                      <Text style={styles.checkSub}>{prov.sub}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
              onPress={handleSubmitIntake}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="send" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                  <Text style={styles.submitBtnText}>Submit Electronic Intake</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* =========================================
            TAB 2: CLOSED-LOOP REFERRAL TRACKING
           ========================================= */}
        {activeTab === 'tracking' && (
          <View style={styles.sectionGap}>
            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                placeholder="Confirmation code (e.g. NVN-2026-89421)"
                value={searchCode}
                onChangeText={setSearchCode}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={styles.searchBtn}
                onPress={() => fetchTracking(searchCode)}
                disabled={trackingLoading}
              >
                {trackingLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Ionicons name="search" size={16} color="#ffffff" />
                )}
              </TouchableOpacity>
            </View>

            {trackingData && (
              <View style={styles.sectionGap}>
                {/* Applicant Summary */}
                <View style={styles.formCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.codeText}>{trackingData.confirmationCode}</Text>
                    <Text style={styles.dateText}>
                      {new Date(trackingData.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.applicantName}>{trackingData.applicant.fullName}</Text>
                  <Text style={styles.applicantDetail}>
                    {trackingData.applicant.phone} • {trackingData.applicant.address}
                  </Text>
                </View>

                {/* Referrals */}
                {trackingData.referrals.map((ref: any) => (
                  <View key={ref.id} style={styles.refCard}>
                    <View style={styles.refHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.refProvider}>{ref.providerName}</Text>
                        <Text style={styles.refProgram}>{ref.programName}</Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          ref.status === 'ACCEPTED'
                            ? styles.statusAccepted
                            : ref.status === 'ACTION_REQUIRED'
                            ? styles.statusActionReq
                            : styles.statusInReview,
                        ]}
                      >
                        <Text style={styles.statusBadgeText}>{ref.status}</Text>
                      </View>
                    </View>

                    {ref.benefitAmountPledged && (
                      <View style={styles.pledgeBox}>
                        <Ionicons name="checkmark-circle" size={14} color="#059669" />
                        <Text style={styles.pledgeText}>
                          Pledged: {ref.benefitAmountPledged}
                        </Text>
                      </View>
                    )}

                    {ref.caseworkerNote && (
                      <Text style={styles.noteText}>"{ref.caseworkerNote}"</Text>
                    )}

                    {/* Timeline */}
                    <View style={styles.timelineContainer}>
                      <Text style={styles.timelineHeader}>Milestones</Text>
                      {ref.timeline.map((m: any, idx: number) => (
                        <View key={m.id || idx} style={styles.milestoneRow}>
                          <View style={styles.timelineDot} />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.milestoneTitle}>{m.title}</Text>
                            <Text style={styles.milestoneDesc}>{m.description}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  tabHeader: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 8,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    gap: 6,
  },
  segmentBtnActive: {
    backgroundColor: '#e0f2fe',
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  segmentTextActive: {
    color: '#0284c7',
  },
  content: {
    padding: 14,
    paddingBottom: 40,
  },
  sectionGap: {
    gap: 12,
  },
  headerCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    gap: 4,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#94a3b8',
    fontSize: 11,
    lineHeight: 15,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  successTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065f46',
  },
  successCode: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#047857',
    fontWeight: '700',
  },
  viewTrackBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#059669',
    borderRadius: 8,
  },
  viewTrackText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 12,
    color: '#0f172a',
    backgroundColor: '#ffffff',
  },
  twoCol: {
    flexDirection: 'row',
    gap: 8,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  checkRowActive: {
    backgroundColor: '#f0f9ff',
    borderColor: '#7dd3fc',
  },
  checkName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  checkSub: {
    fontSize: 10,
    color: '#64748b',
  },
  submitBtn: {
    backgroundColor: '#0284c7',
    paddingVertical: 13,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: '#94a3b8',
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    backgroundColor: '#ffffff',
  },
  searchBtn: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeText: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'monospace',
    color: '#0284c7',
  },
  dateText: {
    fontSize: 10,
    color: '#94a3b8',
  },
  applicantName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  applicantDetail: {
    fontSize: 11,
    color: '#64748b',
  },
  refCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  refHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  refProvider: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  refProgram: {
    fontSize: 11,
    color: '#64748b',
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusInReview: {
    backgroundColor: '#dbeafe',
  },
  statusAccepted: {
    backgroundColor: '#d1fae5',
  },
  statusActionReq: {
    backgroundColor: '#fef3c7',
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0f172a',
  },
  pledgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ecfdf5',
    padding: 8,
    borderRadius: 8,
  },
  pledgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065f46',
  },
  noteText: {
    fontSize: 11,
    color: '#475569',
    fontStyle: 'italic',
  },
  timelineContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 8,
    gap: 6,
  },
  timelineHeader: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  milestoneRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  timelineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0284c7',
    marginTop: 4,
  },
  milestoneTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f172a',
  },
  milestoneDesc: {
    fontSize: 10,
    color: '#64748b',
  },
});

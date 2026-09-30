import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  ResourceCategory,
  SupportedLanguage,
  IncomeRange,
  HousingStability,
  UserSurveyData,
} from '../types';

interface Props {
  userName: string;
  initialLanguage?: SupportedLanguage;
  onComplete: (survey: UserSurveyData) => void;
  onSkip?: () => void;
}

export default function SurveyScreen({
  userName,
  initialLanguage = 'en',
  onComplete,
  onSkip,
}: Props) {
  // Step tracker (1 to 5)
  const [step, setStep] = useState(1);

  // Survey responses
  const [primaryNeeds, setPrimaryNeeds] = useState<ResourceCategory[]>([
    'utility_assistance',
  ]);
  const [householdSize, setHouseholdSize] = useState<number>(3);
  const [incomeRange, setIncomeRange] = useState<IncomeRange>('under_1500');
  const [housingStatus, setHousingStatus] = useState<HousingStability>('at_risk');
  const [languagePreference, setLanguagePreference] =
    useState<SupportedLanguage>(initialLanguage);

  // Finished state prompt
  const [isFinished, setIsFinished] = useState(false);

  const toggleNeed = (need: ResourceCategory) => {
    if (primaryNeeds.includes(need)) {
      if (primaryNeeds.length > 1) {
        setPrimaryNeeds(primaryNeeds.filter((n) => n !== need));
      } else {
        Alert.alert('Selection Required', 'Please keep at least one primary need selected.');
      }
    } else {
      setPrimaryNeeds([...primaryNeeds, need]);
    }
  };

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinalSubmit = () => {
    onComplete({
      primaryNeeds,
      householdSize,
      incomeRange,
      housingStatus,
      languagePreference,
    });
  };

  if (isFinished) {
    return (
      <View style={styles.container}>
        <View style={styles.completionCard}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={54} color="#059669" />
          </View>
          <Text style={styles.completionTitle}>Your Profile is Ready!</Text>
          <Text style={styles.completionPrompt}>
            Thanks, {userName}! Based on your answers, our AI Copilot is ready. You can also tap the microphone button at any time to just tell me what you're looking for in your own words.
          </Text>

          <View style={styles.summaryBadgeBox}>
            <Text style={styles.summaryBadgeTitle}>Selected Priorities:</Text>
            <Text style={styles.summaryBadgeItem}>
              • {primaryNeeds.length} Assistance Needs identified
            </Text>
            <Text style={styles.summaryBadgeItem}>
              • Household of {householdSize}
            </Text>
            <Text style={styles.summaryBadgeItem}>
              • Preferred Language: {languagePreference === 'es' ? 'Español' : languagePreference === 'tl' ? 'Tagalog' : 'English'}
            </Text>
          </View>

          <TouchableOpacity style={styles.finishBtn} onPress={handleFinalSubmit}>
            <Text style={styles.finishBtnText}>View My Personalized Resources</Text>
            <Ionicons name="arrow-forward" size={18} color="#ffffff" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Progress Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          {step > 1 ? (
            <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={20} color="#0f172a" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 28 }} />
          )}

          <Text style={styles.stepIndicator}>Step {step} of 5</Text>

          {onSkip ? (
            <TouchableOpacity onPress={onSkip}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 28 }} />
          )}
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${(step / 5) * 100}%` }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* QUESTION 1: Primary Need */}
        {step === 1 && (
          <View style={styles.questionBlock}>
            <Text style={styles.questionNumber}>Question 1</Text>
            <Text style={styles.questionTitle}>What brings you here today?</Text>
            <Text style={styles.questionSub}>
              Select the primary categories of assistance you or your family need right now.
            </Text>

            <View style={styles.optionsList}>
              {[
                { key: 'food_assistance', emoji: '🍞', label: 'Food assistance / Grocery help' },
                { key: 'utility_assistance', emoji: '💡', label: 'Utility or bill payment assistance (water, power)' },
                { key: 'housing', emoji: '🏠', label: 'Housing or rental support / Shelter' },
                { key: 'healthcare', emoji: '🩺', label: 'Low-cost healthcare or mental health' },
                { key: 'jobs', emoji: '📚', label: 'Job training or employment help' },
              ].map((opt) => {
                const isSelected = primaryNeeds.includes(opt.key as ResourceCategory);
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[styles.bigOptionBtn, isSelected && styles.bigOptionBtnSelected]}
                    onPress={() => toggleNeed(opt.key as ResourceCategory)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.optionEmoji}>{opt.emoji}</Text>
                    <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                      {opt.label}
                    </Text>
                    <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                      {isSelected && <Ionicons name="checkmark" size={14} color="#ffffff" />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* QUESTION 2: Household Size */}
        {step === 2 && (
          <View style={styles.questionBlock}>
            <Text style={styles.questionNumber}>Question 2</Text>
            <Text style={styles.questionTitle}>
              How many people are in your household (including yourself)?
            </Text>
            <Text style={styles.questionSub}>
              Assistance programs scale income and grant sizes based on family size.
            </Text>

            {/* Counter display */}
            <View style={styles.counterBox}>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => setHouseholdSize(Math.max(1, householdSize - 1))}
              >
                <Ionicons name="remove" size={28} color="#0284c7" />
              </TouchableOpacity>

              <View style={styles.counterValueContainer}>
                <Text style={styles.counterValueText}>{householdSize}</Text>
                <Text style={styles.counterSubText}>
                  {householdSize === 1 ? 'Person' : 'People'}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => setHouseholdSize(Math.min(10, householdSize + 1))}
              >
                <Ionicons name="add" size={28} color="#0284c7" />
              </TouchableOpacity>
            </View>

            {/* Quick selector buttons */}
            <View style={styles.quickGrid}>
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.quickPill,
                    householdSize === num && styles.quickPillActive,
                  ]}
                  onPress={() => setHouseholdSize(num)}
                >
                  <Text
                    style={[
                      styles.quickPillText,
                      householdSize === num && styles.quickPillTextActive,
                    ]}
                  >
                    {num} {num === 1 ? 'person' : 'people'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* QUESTION 3: Income Range */}
        {step === 3 && (
          <View style={styles.questionBlock}>
            <Text style={styles.questionNumber}>Question 3</Text>
            <Text style={styles.questionTitle}>Household Income Range</Text>
            <Text style={styles.questionSub}>
              Select your approximate gross monthly household income. No exact numbers needed.
            </Text>

            <View style={styles.optionsList}>
              {[
                { key: '$0', label: '$0 / No current income' },
                { key: 'under_1500', label: 'Under $1,500 per month' },
                { key: '1500_3000', label: '$1,500 – $3,000 per month' },
                { key: '3000_plus', label: '$3,000+ per month' },
                { key: 'prefer_not_to_say', label: 'Prefer not to say (Skip for now)' },
              ].map((opt) => {
                const isSelected = incomeRange === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[styles.radioOptionBtn, isSelected && styles.radioOptionBtnSelected]}
                    onPress={() => setIncomeRange(opt.key as IncomeRange)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                    <Text style={[styles.radioLabel, isSelected && styles.radioLabelSelected]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* QUESTION 4: Housing Stability Status */}
        {step === 4 && (
          <View style={styles.questionBlock}>
            <Text style={styles.questionNumber}>Question 4</Text>
            <Text style={styles.questionTitle}>Housing Stability Status</Text>
            <Text style={styles.questionSub}>
              Helps us connect you with immediate shelter or long-term rent relief.
            </Text>

            <View style={styles.optionsList}>
              {[
                { key: 'stable', label: 'I have stable housing (renting or owning)' },
                { key: 'couch_surfing', label: 'Staying with friends/family temporarily (couch surfing)' },
                { key: 'at_risk', label: 'At risk of losing housing soon' },
                { key: 'unhoused', label: 'Currently unhoused / Staying outside or in a vehicle' },
              ].map((opt) => {
                const isSelected = housingStatus === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[styles.radioOptionBtn, isSelected && styles.radioOptionBtnSelected]}
                    onPress={() => setHousingStatus(opt.key as HousingStability)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                    <Text style={[styles.radioLabel, isSelected && styles.radioLabelSelected]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* QUESTION 5: Language Preference */}
        {step === 5 && (
          <View style={styles.questionBlock}>
            <Text style={styles.questionNumber}>Question 5</Text>
            <Text style={styles.questionTitle}>Preferred Language</Text>
            <Text style={styles.questionSub}>
              Choose your preferred language for the AI Copilot, resources, and voice speech.
            </Text>

            <View style={styles.optionsList}>
              {[
                { key: 'en', flag: '🇺🇸', label: 'English' },
                { key: 'es', flag: '🇪🇸', label: 'Español' },
                { key: 'tl', flag: '🇵🇭', label: 'Tagalog' },
              ].map((opt) => {
                const isSelected = languagePreference === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[styles.langOptionBtn, isSelected && styles.langOptionBtnSelected]}
                    onPress={() => setLanguagePreference(opt.key as SupportedLanguage)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.flagEmoji}>{opt.flag}</Text>
                    <Text style={[styles.langLabel, isSelected && styles.langLabelSelected]}>
                      {opt.label}
                    </Text>
                    <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Next / Submit Button */}
        <TouchableOpacity style={styles.continueBtn} onPress={handleNext}>
          <Text style={styles.continueBtnText}>
            {step === 5 ? 'Finish & Build My Plan' : 'Next Step'}
          </Text>
          <Ionicons name="arrow-forward" size={18} color="#ffffff" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  backBtn: {
    padding: 4,
  },
  stepIndicator: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0284c7',
  },
  skipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0284c7',
    borderRadius: 3,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  questionBlock: {
    marginBottom: 24,
  },
  questionNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284c7',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  questionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 28,
    marginBottom: 6,
  },
  questionSub: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 20,
  },
  optionsList: {
    gap: 12,
  },
  bigOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  bigOptionBtnSelected: {
    backgroundColor: '#f0f9ff',
    borderColor: '#0284c7',
  },
  optionEmoji: {
    fontSize: 22,
    marginRight: 12,
  },
  optionLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    lineHeight: 20,
  },
  optionLabelSelected: {
    color: '#0369a1',
    fontWeight: '700',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7',
  },
  counterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
  },
  counterBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterValueContainer: {
    alignItems: 'center',
    paddingHorizontal: 36,
  },
  counterValueText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#0f172a',
  },
  counterSubText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  quickPill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  quickPillActive: {
    backgroundColor: '#0284c7',
  },
  quickPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  quickPillTextActive: {
    color: '#ffffff',
  },
  radioOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  radioOptionBtnSelected: {
    backgroundColor: '#f0f9ff',
    borderColor: '#0284c7',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioCircleSelected: {
    borderColor: '#0284c7',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0284c7',
  },
  radioLabel: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '600',
    flex: 1,
  },
  radioLabelSelected: {
    color: '#0369a1',
    fontWeight: '700',
  },
  langOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  langOptionBtnSelected: {
    backgroundColor: '#f0f9ff',
    borderColor: '#0284c7',
  },
  flagEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  langLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    flex: 1,
  },
  langLabelSelected: {
    color: '#0369a1',
  },
  continueBtn: {
    backgroundColor: '#0284c7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 10,
  },
  continueBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  completionCard: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: 16,
  },
  completionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
    textAlign: 'center',
  },
  completionPrompt: {
    fontSize: 14,
    color: '#334155',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  summaryBadgeBox: {
    width: '100%',
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginBottom: 24,
  },
  summaryBadgeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 8,
  },
  summaryBadgeItem: {
    fontSize: 13,
    color: '#15803d',
    lineHeight: 20,
  },
  finishBtn: {
    width: '100%',
    backgroundColor: '#0284c7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
  },
  finishBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});

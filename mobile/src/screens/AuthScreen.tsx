import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserProfile } from '../types';
import { signUpUser, signInUser } from '../services/auth';

interface Props {
  onAuthSuccess: (user: UserProfile, isNewUser: boolean) => void;
}

export default function AuthScreen({ onAuthSuccess }: Props) {
  const [isSignUp, setIsSignUp] = useState(true); // Default to Sign Up so new users register
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async () => {
    setErrorMessage('');
    setLoading(true);

    try {
      if (isSignUp) {
        const result = await signUpUser(name, email, password);
        if (result.success && result.user) {
          onAuthSuccess(result.user, true);
        } else {
          setErrorMessage(result.error || 'Registration failed. Please check your information.');
        }
      } else {
        const result = await signInUser(email, password);
        if (result.success && result.user) {
          onAuthSuccess(result.user, false);
        } else {
          setErrorMessage(result.error || 'Sign in failed. Please check your credentials.');
        }
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setIsSignUp(false);
    setEmail('elena@nexus.org');
    setPassword('password123');
    setErrorMessage('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Civic Logo & Branding Header */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Ionicons name="compass" size={32} color="#ffffff" />
          </View>
          <Text style={styles.brandTitle}>Nevada Nexus</Text>
          <Text style={styles.brandSubtitle}>
            Multimodal AI Community Assistance Navigator
          </Text>
          <View style={styles.badgeNV04}>
            <Text style={styles.badgeNV04Text}>
              Nevada’s 4th Congressional District • North Las Vegas
            </Text>
          </View>
        </View>

        {/* Auth Form Card */}
        <View style={styles.formCard}>
          {/* Tab Switcher */}
          <View style={styles.tabSwitcher}>
            <TouchableOpacity
              style={[styles.switchTab, isSignUp && styles.switchTabActive]}
              onPress={() => {
                setIsSignUp(true);
                setErrorMessage('');
              }}
            >
              <Text style={[styles.switchText, isSignUp && styles.switchTextActive]}>
                Create Account
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.switchTab, !isSignUp && styles.switchTabActive]}
              onPress={() => {
                setIsSignUp(false);
                setErrorMessage('');
              }}
            >
              <Text style={[styles.switchText, !isSignUp && styles.switchTextActive]}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>

          {/* Error Message Banner */}
          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color="#dc2626" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {isSignUp && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={18} color="#94a3b8" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Maria Santos"
                  placeholderTextColor="#94a3b8"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (errorMessage) setErrorMessage('');
                  }}
                  autoCapitalize="words"
                />
              </View>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={18} color="#94a3b8" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.input}
                placeholder="youremail@example.com"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errorMessage) setErrorMessage('');
                }}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color="#94a3b8" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.input}
                placeholder={isSignUp ? 'At least 6 characters' : 'Enter your password'}
                placeholderTextColor="#94a3b8"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errorMessage) setErrorMessage('');
                }}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#64748b"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Text style={styles.submitBtnText}>
                  {isSignUp ? 'Sign Up & Take Survey' : 'Sign In to My Account'}
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#ffffff" style={{ marginLeft: 6 }} />
              </>
            )}
          </TouchableOpacity>

          {/* Demo account shortcut helper */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>QUICK DEMO</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.demoBtn} onPress={handleFillDemo}>
            <Ionicons name="flash-outline" size={16} color="#0284c7" style={{ marginRight: 6 }} />
            <Text style={styles.demoBtnText}>
              Fill Pre-Registered Demo Account (Elena Ramos)
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.privacyNote}>
          Nevada Nexus respects your privacy. All user accounts and survey responses are securely stored on your device and are never sold or shared with third parties.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 36,
    alignItems: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBadge: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: '#0284c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 3,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  badgeNV04: {
    marginTop: 10,
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgeNV04Text: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0369a1',
  },
  formCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  switchTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  switchTabActive: {
    backgroundColor: '#ffffff',
    elevation: 1,
  },
  switchText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  switchTextActive: {
    color: '#0284c7',
    fontWeight: '700',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '600',
    flex: 1,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  input: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 14,
    color: '#0f172a',
  },
  eyeBtn: {
    padding: 6,
  },
  submitBtn: {
    backgroundColor: '#0284c7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 6,
  },
  submitBtnDisabled: {
    backgroundColor: '#94a3b8',
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    marginHorizontal: 10,
  },
  demoBtn: {
    backgroundColor: '#f0f9ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  demoBtnText: {
    color: '#0284c7',
    fontSize: 12,
    fontWeight: '700',
  },
  privacyNote: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 18,
    lineHeight: 16,
    paddingHorizontal: 16,
  },
});

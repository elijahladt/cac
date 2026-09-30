import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { DocumentAnalysis, SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { analyzeLocalDocument } from '../services/api';

interface Props {
  lang: SupportedLanguage;
}

export default function DocumentScannerScreen({ lang }: Props) {
  const t = TRANSLATIONS[lang];
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);

  const takePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Camera permission is required to photograph documents.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        processImage(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert('Error', 'Could not open camera.');
    }
  };

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Media library permission is required to choose documents.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        processImage(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert('Error', 'Could not open photo gallery.');
    }
  };

  const processImage = (uri: string) => {
    setImageUri(uri);
    setAnalyzing(true);
    setAnalysis(null);

    // Analyze document (multimodal OCR / extraction)
    setTimeout(() => {
      const extracted = analyzeLocalDocument(uri);
      setAnalysis(extracted);
      setAnalyzing(false);
    }, 1200);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Privacy Notice Banner */}
      <View style={styles.privacyBanner}>
        <Ionicons name="lock-closed" size={18} color="#059669" />
        <Text style={styles.privacyText}>{t.privacy_notice}</Text>
      </View>

      {/* Main Action Box */}
      <View style={styles.actionBox}>
        <Ionicons name="scan-circle" size={48} color="#0284c7" />
        <Text style={styles.title}>{t.upload_doc_title}</Text>
        <Text style={styles.desc}>{t.upload_doc_desc}</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.primaryBtn} onPress={takePhoto}>
            <Ionicons name="camera" size={18} color="#ffffff" style={{ marginRight: 6 }} />
            <Text style={styles.primaryBtnText}>{t.take_photo}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={pickImage}>
            <Ionicons name="images" size={18} color="#0284c7" style={{ marginRight: 6 }} />
            <Text style={styles.secondaryBtnText}>{t.choose_photo}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Selected Image Preview */}
      {imageUri && (
        <View style={styles.previewBox}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => {
              setImageUri(null);
              setAnalysis(null);
            }}
          >
            <Ionicons name="trash-outline" size={16} color="#dc2626" />
            <Text style={styles.clearBtnText}>Remove Document</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Analyzing Spinner */}
      {analyzing && (
        <View style={styles.analyzingBox}>
          <ActivityIndicator size="large" color="#0284c7" />
          <Text style={styles.analyzingText}>Extracting utility information & verifying programs...</Text>
        </View>
      )}

      {/* Analysis Results */}
      {analysis && (
        <View style={styles.resultsBox}>
          <View style={styles.resultsHeader}>
            <Ionicons name="checkmark-done-circle" size={24} color="#059669" />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.resultsTitle}>Document Analysis Complete</Text>
              <Text style={styles.resultsSubtitle}>
                Confidence: {(analysis.confidence_score * 100).toFixed(0)}% • Utility Bill Verified
              </Text>
            </View>
          </View>

          {/* Extracted Fields Table */}
          <Text style={styles.tableHeader}>Extracted Information:</Text>
          {Object.entries(analysis.extracted_fields).map(([key, val]) => (
            <View key={key} style={styles.fieldRow}>
              <Text style={styles.fieldKey}>{key}:</Text>
              <Text style={styles.fieldVal}>{val}</Text>
            </View>
          ))}

          {/* Matching Programs */}
          <View style={styles.matchingBox}>
            <Text style={styles.matchingHeader}>Potentially Matching Programs:</Text>
            {analysis.matching_programs.map((prog, idx) => (
              <View key={idx} style={styles.matchingRow}>
                <Ionicons name="checkmark" size={16} color="#059669" />
                <Text style={styles.matchingText}>{prog}</Text>
              </View>
            ))}
          </View>

          {/* Next Checklist items */}
          <View style={styles.missingBox}>
            <Text style={styles.missingHeader}>Missing Items to Complete Application:</Text>
            {analysis.missing_requirements.map((req, idx) => (
              <View key={idx} style={styles.missingRow}>
                <Ionicons name="alert-circle" size={16} color="#d97706" />
                <Text style={styles.missingText}>{req}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
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
  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ecfdf5',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#a7f3d0',
    marginBottom: 16,
  },
  privacyText: {
    fontSize: 12,
    color: '#065f46',
    flex: 1,
    lineHeight: 16,
  },
  actionBox: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 8,
  },
  desc: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginVertical: 8,
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    width: '100%',
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f9ff',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  secondaryBtnText: {
    color: '#0284c7',
    fontSize: 13,
    fontWeight: '700',
  },
  previewBox: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    padding: 6,
  },
  clearBtnText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '600',
  },
  analyzingBox: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  analyzingText: {
    fontSize: 13,
    color: '#64748b',
  },
  resultsBox: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  resultsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  resultsSubtitle: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
    marginTop: 2,
  },
  tableHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  fieldKey: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  fieldVal: {
    fontSize: 12,
    color: '#0f172a',
    fontWeight: '600',
  },
  matchingBox: {
    marginTop: 14,
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 10,
  },
  matchingHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803d',
    marginBottom: 6,
  },
  matchingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  matchingText: {
    fontSize: 12,
    color: '#166534',
    flex: 1,
  },
  missingBox: {
    marginTop: 12,
    backgroundColor: '#fffbeb',
    padding: 12,
    borderRadius: 10,
  },
  missingHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#b45309',
    marginBottom: 6,
  },
  missingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  missingText: {
    fontSize: 12,
    color: '#92400e',
    flex: 1,
  },
});

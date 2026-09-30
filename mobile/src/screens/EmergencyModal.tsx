import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EMERGENCY_SERVICES } from '../emergency/pathways';
import { SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface Props {
  visible: boolean;
  onClose: () => void;
  lang: SupportedLanguage;
}

export default function EmergencyModal({ visible, onClose, lang }: Props) {
  const t = TRANSLATIONS[lang];

  const handleCall = (phoneNumber: string) => {
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    Linking.openURL(`tel:${cleanNumber}`);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="warning" size={24} color="#dc2626" />
              <Text style={styles.title}>{t.emergency_title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#475569" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>{t.emergency_desc}</Text>

          <ScrollView style={styles.list}>
            {EMERGENCY_SERVICES.map((item, idx) => (
              <View
                key={idx}
                style={[
                  styles.card,
                  item.emergency ? styles.emergencyCard : styles.standardCard,
                ]}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.serviceName}>{item.service}</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.available}</Text>
                  </View>
                </View>

                <Text style={styles.desc}>{item.description}</Text>

                <TouchableOpacity
                  style={[
                    styles.callButton,
                    item.emergency ? styles.callEmergencyBtn : styles.callStandardBtn,
                  ]}
                  onPress={() => handleCall(item.number)}
                >
                  <Ionicons name="call" size={18} color="#ffffff" style={{ marginRight: 8 }} />
                  <Text style={styles.callButtonText}>
                    {t.call_now} {item.number}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  closeBtn: {
    padding: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 18,
  },
  list: {
    marginBottom: 20,
  },
  card: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  emergencyCard: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
  },
  standardCard: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  desc: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 16,
    marginBottom: 10,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  callEmergencyBtn: {
    backgroundColor: '#dc2626',
  },
  callStandardBtn: {
    backgroundColor: '#0284c7',
  },
  callButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});

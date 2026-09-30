import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Linking,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Resource, ResourceCategory, SupportedLanguage } from '../types';
import {
  VERIFIED_RESOURCES,
  VERIFIED_PROGRAMS,
  getLocalizedResource,
  getLocalizedProgram,
} from '../data/resources';
import { TRANSLATIONS } from '../i18n/translations';

interface Props {
  lang: SupportedLanguage;
}

export default function ResourcesScreen({ lang }: Props) {
  const t = TRANSLATIONS[lang];
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  const categories = [
    { key: 'all', label: t.categories_all, icon: 'grid' },
    { key: 'utility_assistance', label: t.cat_utility_assistance, icon: 'flash' },
    { key: 'food_assistance', label: t.cat_food_assistance, icon: 'nutrition' },
    { key: 'housing', label: t.cat_housing, icon: 'home' },
    { key: 'healthcare', label: t.cat_healthcare, icon: 'medkit' },
    { key: 'jobs', label: t.cat_jobs, icon: 'briefcase' },
    { key: 'transportation', label: t.cat_transportation, icon: 'bus' },
    { key: 'childcare', label: t.cat_childcare, icon: 'happy' },
  ];

  const localizedResources = VERIFIED_RESOURCES.map((item) =>
    getLocalizedResource(item, lang)
  );

  const filteredResources = localizedResources.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getProgramsForResource = (resId: string) => {
    return VERIFIED_PROGRAMS.filter((p) => p.resource_id === resId).map((p) =>
      getLocalizedProgram(p, lang)
    );
  };

  const renderResource = ({ item }: { item: Resource }) => {
    const programs = getProgramsForResource(item.id);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => setSelectedResource(item)}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardAddress}>
              <Ionicons name="location-outline" size={12} color="#64748b" /> {item.address}, {item.city}
            </Text>
          </View>
          <View style={styles.verifiedTag}>
            <Ionicons name="shield-checkmark" size={14} color="#059669" />
            <Text style={styles.verifiedText}>{t.verified_badge || 'Verified'}</Text>
          </View>
        </View>

        <Text style={styles.cardDesc} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={13} color="#475569" />
            <Text style={styles.metaText}>{item.hours}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="globe-outline" size={13} color="#475569" />
            <Text style={styles.metaText}>{item.languages.map((l) => l.toUpperCase()).join(', ')}</Text>
          </View>
        </View>

        {programs.length > 0 && (
          <View style={styles.programPill}>
            <Ionicons name="bookmark" size={12} color="#0369a1" />
            <Text style={styles.programPillText}>
              {programs.length} {lang === 'es' ? 'Programa(s) Activo(s)' : lang === 'tl' ? 'Aktibong Programa' : 'Active Program(s)'} (e.g. {programs[0].name})
            </Text>
          </View>
        )}

        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => Linking.openURL(`tel:${item.phone.replace(/[^0-9]/g, '')}`)}
          >
            <Ionicons name="call" size={14} color="#0284c7" />
            <Text style={styles.actionBtnText}>{t.call_now} ({item.phone})</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() =>
              Linking.openURL(
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${item.name}, ${item.address}, North Las Vegas, NV`
                )}`
              )
            }
          >
            <Ionicons name="navigate" size={14} color="#0284c7" />
            <Text style={styles.actionBtnText}>{t.view_map}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#64748b" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search verified resources in North Las Vegas..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color="#94a3b8" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Category Horizontal Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[
              styles.catChip,
              selectedCategory === cat.key && styles.catChipActive,
            ]}
            onPress={() => setSelectedCategory(cat.key)}
          >
            <Ionicons
              name={cat.icon as any}
              size={14}
              color={selectedCategory === cat.key ? '#ffffff' : '#0369a1'}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.catChipText,
                selectedCategory === cat.key && styles.catChipTextActive,
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Resource Count */}
      <View style={styles.countBar}>
        <Text style={styles.countText}>
          Showing {filteredResources.length} verified community resources in NV-04
        </Text>
      </View>

      {/* Resources List */}
      <FlatList
        data={filteredResources}
        renderItem={renderResource}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />

      {/* Detail Modal */}
      {selectedResource && (
        <Modal visible={true} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedResource.name}</Text>
                <TouchableOpacity onPress={() => setSelectedResource(null)}>
                  <Ionicons name="close" size={24} color="#475569" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.verifiedTagModal}>
                  <Ionicons name="checkmark-circle" size={16} color="#059669" />
                  <Text style={styles.verifiedModalText}>
                    {lang === 'es'
                      ? `Recurso Verificado • ${new Date(selectedResource.last_verified_at).toLocaleDateString()}`
                      : lang === 'tl'
                      ? `Beripikadong Rekurso • ${new Date(selectedResource.last_verified_at).toLocaleDateString()}`
                      : `Authoritative NV-04 Verified Resource • Verified on ${new Date(selectedResource.last_verified_at).toLocaleDateString()}`}
                  </Text>
                </View>

                <Text style={styles.modalSectionTitle}>
                  {lang === 'es' ? 'Acerca de Esta Organización' : lang === 'tl' ? 'Tungkol sa Organisasyong Ito' : 'About This Organization'}
                </Text>
                <Text style={styles.modalText}>{selectedResource.description}</Text>

                <Text style={styles.modalSectionTitle}>
                  {lang === 'es' ? 'Contacto y Ubicación' : lang === 'tl' ? 'Kontak at Lokasyon' : 'Contact & Location'}
                </Text>
                <Text style={styles.modalDetailText}>📍 {selectedResource.address}, {selectedResource.city}, NV {selectedResource.zip}</Text>
                <Text style={styles.modalDetailText}>📞 {selectedResource.phone}</Text>
                <Text style={styles.modalDetailText}>⏰ {selectedResource.hours}</Text>
                <Text style={styles.modalDetailText}>
                  🗣️ {lang === 'es' ? 'Idiomas' : lang === 'tl' ? 'Mga Wika' : 'Languages'}: {selectedResource.languages.map((l) => l.toUpperCase()).join(', ')}
                </Text>

                {/* Programs */}
                {getProgramsForResource(selectedResource.id).map((prog) => (
                  <View key={prog.id} style={styles.modalProgCard}>
                    <Text style={styles.modalProgTitle}>{prog.name}</Text>
                    <Text style={styles.modalProgDesc}>{prog.description}</Text>
                    <Text style={styles.modalProgElig}>
                      <Text style={{ fontWeight: '700' }}>
                        {lang === 'es' ? 'Elegibilidad: ' : lang === 'tl' ? 'Kwalipikasyon: ' : 'Eligibility: '}
                      </Text>
                      {prog.eligibility_summary}
                    </Text>

                    <Text style={styles.modalProgReqHeader}>{t.documents_needed}</Text>
                    {prog.required_documents.map((doc, idx) => (
                      <Text key={idx} style={styles.modalProgReqItem}>• {doc}</Text>
                    ))}
                  </View>
                ))}

                <View style={styles.modalBtnRow}>
                  <TouchableOpacity
                    style={styles.modalPrimaryBtn}
                    onPress={() => Linking.openURL(`tel:${selectedResource.phone.replace(/[^0-9]/g, '')}`)}
                  >
                    <Ionicons name="call" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                    <Text style={styles.modalPrimaryBtnText}>{t.call_now} ({selectedResource.phone})</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalSecondaryBtn}
                    onPress={() => Linking.openURL(selectedResource.website)}
                  >
                    <Ionicons name="globe" size={16} color="#0284c7" style={{ marginRight: 6 }} />
                    <Text style={styles.modalSecondaryBtnText}>{t.website}</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    margin: 12,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
  },
  categoryScroll: {
    maxHeight: 44,
  },
  categoryContainer: {
    paddingHorizontal: 12,
    gap: 8,
    alignItems: 'center',
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  catChipActive: {
    backgroundColor: '#0284c7',
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0369a1',
  },
  catChipTextActive: {
    color: '#ffffff',
  },
  countBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  countText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  listContent: {
    padding: 12,
    paddingTop: 4,
    gap: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginRight: 6,
  },
  cardAddress: {
    fontSize: 12,
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
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  cardDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#475569',
  },
  programPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0f9ff',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  programPillText: {
    fontSize: 12,
    color: '#0369a1',
    fontWeight: '600',
    flex: 1,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#f0f9ff',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284c7',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
    marginRight: 10,
  },
  modalBody: {
    marginBottom: 20,
  },
  verifiedTagModal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ecfdf5',
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
  },
  verifiedModalText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
    flex: 1,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 12,
    marginBottom: 6,
  },
  modalText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 19,
  },
  modalDetailText: {
    fontSize: 13,
    color: '#334155',
    marginBottom: 4,
  },
  modalProgCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  modalProgTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0284c7',
    marginBottom: 4,
  },
  modalProgDesc: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 6,
    lineHeight: 16,
  },
  modalProgElig: {
    fontSize: 12,
    color: '#0f172a',
    marginBottom: 6,
  },
  modalProgReqHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginTop: 4,
  },
  modalProgReqItem: {
    fontSize: 11,
    color: '#475569',
    marginLeft: 6,
    marginTop: 2,
  },
  modalBtnRow: {
    marginTop: 20,
    gap: 10,
  },
  modalPrimaryBtn: {
    backgroundColor: '#0284c7',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  modalPrimaryBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  modalSecondaryBtn: {
    backgroundColor: '#f0f9ff',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  modalSecondaryBtnText: {
    color: '#0284c7',
    fontSize: 14,
    fontWeight: '700',
  },
});

/**
 * BlocklistEditor.tsx
 *
 * Lets parents add and remove custom words from the blocklist.
 * On every change, calls updateSettings which persists to Firestore and
 * rebuilds the mergedBlocklist Set in the store — the scan loop picks
 * up the new set on its next OCR frame without restart.
 *
 * Validation rules mirror what the OCR pipeline produces:
 *   - Lowercase alpha-only (non-alpha characters are stripped by wordMatcher)
 *   - 2–18 characters (shorter strings are filtered out by wordMatcher)
 *   - Not already in the list
 */

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, Alert,
} from 'react-native';
import { useParentalControlsStore } from '../../store/useParentalControlsStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useStrings } from '../../hooks/useStrings';
import { colors } from '../../constants/colors';

export const BlocklistEditor: React.FC = () => {
  const strings = useStrings();
  const { settings, updateSettings } = useParentalControlsStore();
  const { user } = useAuthStore();
  const [input, setInput] = useState('');

  const handleAdd = () => {
    const word = input.trim().toLowerCase().replace(/[^a-z]/g, '');
    if (word.length < 2) {
      Alert.alert('Too short', 'Word must be at least 2 letters.');
      return;
    }
    if (settings.customBlocklist.includes(word)) {
      Alert.alert('Already blocked', `"${word}" is already on the list.`);
      return;
    }
    if (user) {
      updateSettings(user.uid, { customBlocklist: [...settings.customBlocklist, word] });
    }
    setInput('');
  };

  const handleRemove = (word: string) => {
    if (user) {
      updateSettings(user.uid, { customBlocklist: settings.customBlocklist.filter(w => w !== word) });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder={strings.blocklistPlaceholder}
          placeholderTextColor={colors.textSecondary}
          value={input}
          onChangeText={setInput}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={handleAdd}
        />
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd} accessibilityLabel="Add word to blocklist" accessibilityRole="button">
          <Text style={styles.addBtnText}>{strings.blocklistAddBtn}</Text>
        </TouchableOpacity>
      </View>

      {settings.customBlocklist.length === 0 ? (
        <Text style={styles.empty}>{strings.blocklistEmpty}</Text>
      ) : (
        <FlatList
          data={settings.customBlocklist}
          keyExtractor={w => w}
          scrollEnabled={false}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.chip}>
              <Text style={styles.chipWord}>{item}</Text>
              <TouchableOpacity onPress={() => handleRemove(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} accessibilityLabel={`Remove ${item} from blocklist`} accessibilityRole="button">
                <Text style={styles.removeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  input: {
    flex: 1, backgroundColor: colors.white, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 15, color: colors.textPrimary,
    borderWidth: 1.5, borderColor: colors.borderPrimary,
  },
  addBtn: {
    backgroundColor: colors.primary, borderRadius: 12,
    paddingHorizontal: 18, justifyContent: 'center',
  },
  addBtnText: { color: colors.white, fontWeight: '700', fontSize: 15 },
  empty: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 16 },
  list: { gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFF0F0', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: '#FFCCCC',
  },
  chipWord: { fontSize: 15, fontWeight: '600', color: colors.textPrimary, textTransform: 'capitalize' },
  removeBtn: { fontSize: 16, color: colors.error, fontWeight: '700' },
});

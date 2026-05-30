import React, { useState, useEffect } from 'react';
import { Modal, View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { colors } from '../tokens/colors';
import { spacing, borderRadius } from '../tokens/spacing';
import { NeoText, NeoButton, NeoInput, NeoIcon } from '../atoms';
import { SettingsToggle } from '../molecules';

export interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (score: string, deuce: boolean, courts: string) => void;
  initialScore: string;
  initialDeuce: boolean;
  initialCourts: string;
}

export default function SettingsModal({
  visible,
  onClose,
  onSave,
  initialScore,
  initialDeuce,
  initialCourts,
}: SettingsModalProps) {
  const [score, setScore] = useState(initialScore);
  const [deuce, setDeuce] = useState(initialDeuce);
  const [courts, setCourts] = useState(initialCourts);

  // Sync state when modal opens
  useEffect(() => {
    if (visible) {
      setScore(initialScore);
      setDeuce(initialDeuce);
      setCourts(initialCourts);
    }
  }, [visible, initialScore, initialDeuce, initialCourts]);

  const handleSave = () => {
    onSave(score, deuce, courts);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Modal Card (Neo 2 Elevation) */}
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <NeoText variant="headlineMd" color={colors.onBackground}>
              ⚙️ ตั้งค่าระบบ
            </NeoText>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <NeoIcon name="close" size={18} color={colors.onBackground} />
            </Pressable>
          </View>

          <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollContent}>
            {/* Input 1: Total Courts */}
            <View style={styles.inputGroup}>
              <NeoText variant="bodyBold" style={styles.label}>
                จำนวนสนาม (Courts)
              </NeoText>
              <NeoInput
                value={courts}
                onChangeText={setCourts}
                placeholder="ระบุจำนวนสนาม"
                keyboardType="numeric"
              />
            </View>

            {/* Input 2: Winning Score */}
            <View style={styles.inputGroup}>
              <NeoText variant="bodyBold" style={styles.label}>
                แต้มที่ชนะ (Winning Score)
              </NeoText>
              <NeoInput
                value={score}
                onChangeText={setScore}
                placeholder="ระบุแต้มที่ชนะ (เช่น 21, 30)"
                keyboardType="numeric"
              />
            </View>

            {/* Input 3: Deuce Switch */}
            <SettingsToggle
              label="เปิดใช้งานดิวส์ (Enable Deuce)"
              description="เมื่อคะแนนเสมอกันที่ 20-20 ต้องชนะห่าง 2 แต้ม"
              value={deuce}
              onValueChange={setDeuce}
              style={styles.toggle}
            />
          </ScrollView>

          {/* Footer Save Button */}
          <View style={styles.footer}>
            <NeoButton
              variant="primary"
              title="บันทึกการตั้งค่า"
              onPress={handleSave}
              fullWidth
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(28, 27, 27, 0.6)', // transparent black matching onBackground
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.background,
    width: '100%',
    maxHeight: '80%',
    borderWidth: spacing.strokeThick,
    borderColor: colors.onBackground,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    // 8px solid shadow
    shadowColor: colors.onBackground,
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: spacing.strokeThick,
    borderBottomColor: colors.onBackground,
    backgroundColor: colors.surfaceContainerLow,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.onBackground,
    backgroundColor: colors.tertiaryContainer, // pink tint
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.onBackground,
    shadowOffset: { width: 1.5, height: 1.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 1,
  },
  scrollBody: {
    padding: spacing.md,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.xs,
  },
  toggle: {
    borderBottomWidth: 0,
    paddingVertical: spacing.sm,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1.5,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
  },
});

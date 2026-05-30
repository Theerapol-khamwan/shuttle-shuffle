import React from 'react';
import { Modal, View, StyleSheet, Pressable, ViewStyle, ScrollView } from 'react-native';
import { colors } from '../tokens/colors';
import { spacing, borderRadius } from '../tokens/spacing';
import { NeoText, NeoIcon } from '../atoms';

export interface ModalTemplateProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  style?: ViewStyle;
}

export default function ModalTemplate({
  visible,
  onClose,
  title,
  children,
  footer,
  style,
}: ModalTemplateProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Modal Card (Neo 2 Elevation) */}
        <View style={[styles.card, style]}>
          {/* Header */}
          <View style={styles.header}>
            <NeoText variant="headlineMd" color={colors.onBackground}>
              {title}
            </NeoText>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <NeoIcon name="close" size={18} color={colors.onBackground} />
            </Pressable>
          </View>

          {/* Body */}
          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            {children}
          </ScrollView>

          {/* Footer */}
          {footer && (
            <View style={styles.footer}>
              {footer}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(28, 27, 27, 0.6)',
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
    backgroundColor: colors.tertiaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.onBackground,
    shadowOffset: { width: 1.5, height: 1.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 1,
  },
  body: {
    padding: spacing.md,
  },
  bodyContent: {
    paddingBottom: spacing.xl,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1.5,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
  },
});

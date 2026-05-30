import React from 'react';
import { View, StyleSheet, Switch, ViewStyle } from 'react-native';
import { colors } from '../tokens/colors';
import { spacing } from '../tokens/spacing';
import { NeoText } from '../atoms';

export interface SettingsToggleProps {
  label: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
  description?: string;
  style?: ViewStyle;
}

export default function SettingsToggle({
  label,
  value,
  onValueChange,
  description,
  style,
}: SettingsToggleProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.textContainer}>
        <NeoText variant="bodyBold" color={colors.onBackground}>
          {label}
        </NeoText>
        {description && (
          <NeoText variant="bodySm" color={colors.outline} style={styles.description}>
            {description}
          </NeoText>
        )}
      </View>
      <View style={styles.switchWrapper}>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{
            false: colors.surfaceContainerHighest,
            true: colors.primaryContainer,
          }}
          thumbColor={value ? colors.primary : colors.outline}
          ios_backgroundColor={colors.surfaceContainerHighest}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: spacing.md,
    borderBottomWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.outlineVariant,
  },
  textContainer: {
    flex: 1,
    paddingRight: spacing.md,
  },
  description: {
    marginTop: 2,
    fontSize: 12,
  },
  switchWrapper: {
    transform: [{ scale: 0.9 }],
  },
});

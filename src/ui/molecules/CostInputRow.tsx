import React from 'react';
import { View, StyleSheet, TextInput, ViewStyle } from 'react-native';
import { colors } from '../tokens/colors';
import { spacing, borderRadius } from '../tokens/spacing';
import { NeoText, NeoButton } from '../atoms';
import { FONT_THAI } from '../tokens/typography';

export interface CostInputRowProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  unit?: string;
  style?: ViewStyle;
  inputType?: 'keyboard' | 'stepper';
  step?: number;
  min?: number;
}

export default function CostInputRow({
  label,
  value,
  onChangeText,
  placeholder = '0',
  unit = 'THB',
  style,
  inputType = 'keyboard',
  step = 1,
  min = 0,
}: CostInputRowProps) {
  const handleStep = (delta: number) => {
    const current = parseFloat(value) || 0;
    // Handle floating point precision issues for steppers (e.g. 0.5 steps)
    const next = Math.max(min, Math.round((current + delta) * 10) / 10);
    onChangeText(next.toString());
  };

  return (
    <View style={[styles.container, style]}>
      {/* Label */}
      <View style={styles.labelContainer}>
        <NeoText variant="bodyBold" color={colors.onBackground}>
          {label}
        </NeoText>
      </View>

      {/* Input + Unit */}
      <View style={styles.inputWrapper}>
        {inputType === 'stepper' && (
          <NeoButton 
            variant="ghost" 
            title="-" 
            size="sm"
            onPress={() => handleStep(-step)} 
            style={styles.stepperBtn} 
          />
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.outline}
          keyboardType="numeric"
          style={styles.input}
          editable={inputType === 'keyboard'}
        />
        {inputType === 'stepper' && (
          <NeoButton 
            variant="ghost" 
            title="+" 
            size="sm"
            onPress={() => handleStep(step)} 
            style={styles.stepperBtn} 
          />
        )}
        {unit && (
          <NeoText variant="labelSm" color={colors.outline} style={styles.unitText}>
            {unit}
          </NeoText>
        )}
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
  labelContainer: {
    flex: 1,
    paddingRight: spacing.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepperBtn: {
    minWidth: 40,
    marginHorizontal: 4,
  },
  input: {
    borderWidth: 2,
    borderColor: colors.onBackground,
    borderRadius: borderRadius.sm,
    backgroundColor: '#ffffff',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: 16,
    fontFamily: FONT_THAI,
    color: colors.onBackground,
    width: 60, // slightly narrower to fit steppers
    textAlign: 'center',
    fontWeight: 'bold',
  },
  unitText: {
    marginLeft: spacing.sm,
    width: 32,
    textAlign: 'left',
  },
});

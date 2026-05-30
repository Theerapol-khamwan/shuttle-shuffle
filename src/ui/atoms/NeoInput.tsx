import React, { useState } from 'react';
import { TextInput, StyleSheet, View, TextInputProps, ViewStyle } from 'react-native';
import { colors } from '../tokens/colors';
import { spacing, borderRadius } from '../tokens/spacing';
import { FONT_THAI } from '../tokens/typography';

export interface NeoInputProps extends Omit<TextInputProps, 'style'> {
  required?: boolean;
  style?: ViewStyle;
  inputStyle?: any;
}

export default function NeoInput({
  value,
  onChangeText,
  placeholder,
  onSubmitEditing,
  required = false,
  style,
  inputStyle,
  ...props
}: NeoInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const displayPlaceholder = required && placeholder ? `${placeholder} *` : placeholder;

  return (
    <View style={[styles.container, style]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={displayPlaceholder}
        placeholderTextColor={colors.outline}
        onSubmitEditing={onSubmitEditing}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={[
          styles.input,
          {
            backgroundColor: isFocused ? colors.primaryContainer : '#ffffff',
          },
          inputStyle,
        ]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    borderWidth: spacing.strokeThick,
    borderColor: colors.onBackground,
    borderRadius: borderRadius.DEFAULT,
    padding: spacing.md,
    fontSize: 16,
    fontFamily: FONT_THAI,
    color: colors.onBackground,
  },
});

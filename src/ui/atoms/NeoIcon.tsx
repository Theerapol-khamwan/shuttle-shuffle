import React from 'react';
import { View, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../tokens/colors';
import { spacing } from '../tokens/spacing';
import NeoText from './NeoText';

export interface NeoIconProps {
  name: string;
  size?: number;
  color?: string;
  badge?: boolean;
  style?: ViewStyle;
}

const iconMap: Record<string, string> = {
  add: '＋',
  plus: '＋',
  remove: '－',
  minus: '－',
  settings: '⚙️',
  gear: '⚙️',
  close: '✕',
  x: '✕',
  crown: '👑',
  king: '👑',
  star: '⭐',
  check: '✓',
  edit: '✏️',
  delete: '🗑️',
  trash: '🗑️',
  history: '⏳',
  court: '🏸',
  user: '👤',
  back: '←',
  'arrow-back': '←',
  hamburger: '☰',
  menu: '☰',
  trophy: '🏆',
};

export default function NeoIcon({
  name,
  size = 24,
  color = colors.onBackground,
  badge = false,
  style,
}: NeoIconProps) {
  const iconSymbol = iconMap[name] || name;

  // If badge is true, wrap in thick-bordered circle
  if (badge) {
    const badgeSize = size * 1.6;
    const badgeStyle: ViewStyle = {
      width: badgeSize,
      height: badgeSize,
      borderRadius: badgeSize / 2,
      borderWidth: spacing.strokeThin,
      borderColor: colors.onBackground,
      backgroundColor: colors.surfaceContainerLow,
      alignItems: 'center',
      justifyContent: 'center',
      ...style,
    };

    return (
      <View style={badgeStyle}>
        <NeoText
          style={{
            fontSize: size,
            lineHeight: size + 4,
            textAlign: 'center',
          }}
          color={color}
        >
          {iconSymbol}
        </NeoText>
      </View>
    );
  }

  // Otherwise, just render the text
  return (
    <NeoText
      style={[
        styles.iconText,
        {
          fontSize: size,
          lineHeight: size + 4,
        },
        style as TextStyle,
      ]}
      color={color}
    >
      {iconSymbol}
    </NeoText>
  );
}

const styles = StyleSheet.create({
  iconText: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

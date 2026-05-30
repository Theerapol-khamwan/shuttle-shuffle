import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { textStyles, FONT_THAI, FONT_THAI_BOLD } from '../tokens/typography';
import { colors } from '../tokens/colors';

export type NeoTextVariant =
  | 'display'
  | 'headline'
  | 'headlineMobile'
  | 'headlineMd'
  | 'body'
  | 'bodyBold'
  | 'bodySm'
  | 'label'
  | 'labelSm'
  | 'score'
  | 'scoreXl';

export interface NeoTextProps extends TextProps {
  variant?: NeoTextVariant;
  color?: string;
}

const variantStyles: Record<NeoTextVariant, any> = {
  display: textStyles.displayLg,
  headline: textStyles.headlineLg,
  headlineMobile: textStyles.headlineLgMobile,
  headlineMd: textStyles.headlineMd,
  body: textStyles.bodyMd,
  bodyBold: textStyles.bodyBold,
  bodySm: textStyles.bodySm,
  label: textStyles.labelLg,
  labelSm: textStyles.labelSm,
  score: textStyles.scoreLg,
  scoreXl: textStyles.scoreXl,
};

const isThaiText = (text: any): boolean => {
  if (typeof text !== 'string') return false;
  return /[\u0e00-\u0e7f]/.test(text);
};

export default function NeoText({
  variant = 'body',
  color = colors.onBackground,
  style,
  children,
  ...props
}: NeoTextProps) {
  const baseStyle = variantStyles[variant];
  
  // Thai font fallback logic for premium Thai text rendering
  let fontFamilyOverride = {};
  if (children && isThaiText(children)) {
    const isBold =
      variant === 'display' ||
      variant === 'headline' ||
      variant === 'headlineMobile' ||
      variant === 'headlineMd' ||
      variant === 'bodyBold' ||
      variant === 'label' ||
      variant === 'labelSm' ||
      variant === 'score' ||
      variant === 'scoreXl';
    fontFamilyOverride = {
      fontFamily: isBold ? FONT_THAI_BOLD : FONT_THAI,
    };
  }

  return (
    <Text
      style={[
        baseStyle,
        { color },
        fontFamilyOverride,
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

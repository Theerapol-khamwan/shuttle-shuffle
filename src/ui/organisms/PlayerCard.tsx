import React from 'react';
import { View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { colors } from '../tokens/colors';
import { spacing, borderRadius } from '../tokens/spacing';
import { NeoText, NeoIcon, NeoBadge } from '../atoms';

export interface PlayerCardProps {
  name: string;
  gamesPlayed: number;
  skillLevel?: number;
  onDelete?: () => void;
  onChangeSkill?: () => void;
  status?: 'playing' | 'waiting' | 'resting';
  style?: ViewStyle;
}

export default function PlayerCard({
  name,
  gamesPlayed,
  skillLevel,
  onDelete,
  onChangeSkill,
  status = 'waiting',
  style,
}: PlayerCardProps) {
  const isResting = status === 'resting';
  const isPlaying = status === 'playing';

  // Get initials
  const initials = name ? name.trim().slice(0, 2).toUpperCase() : '??';

  // Generate avatar background color based on name hash
  const getAvatarBg = (str: string) => {
    const hash = str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const variants = [
      colors.primaryContainer, // yellow
      colors.secondaryContainer, // blue
      colors.tertiaryContainer, // pink
    ];
    return variants[hash % variants.length];
  };

  const avatarBg = isResting ? colors.surfaceContainer : getAvatarBg(name);

  // Status Badge
  let badgeLabel = 'WAITING';
  let badgeVariant: any = 'status';
  if (isPlaying) {
    badgeLabel = 'PLAYING';
    badgeVariant = 'active';
  } else if (isResting) {
    badgeLabel = 'RESTING';
    badgeVariant = 'level'; // simple gray border badge
  }

  return (
    <View
      style={[
        styles.container,
        isResting && styles.restingContainer,
        style,
      ]}
    >
      {/* 48px Avatar */}
      <View
        style={[
          styles.avatar,
          { backgroundColor: avatarBg, opacity: isResting ? 0.6 : 1 },
        ]}
      >
        <NeoText variant="label" style={styles.avatarText}>
          {initials}
        </NeoText>
      </View>

      {/* Info Column */}
      <View style={styles.infoColumn}>
        <NeoText variant="headlineMd" style={styles.nameText}>
          {name}
        </NeoText>
        <View style={styles.statusRow}>
          <NeoBadge variant={badgeVariant} label={badgeLabel} />
          {skillLevel !== undefined && (
            <Pressable onPress={onChangeSkill}>
              <NeoBadge 
                variant="level" 
                label={skillLevel === 1 ? 'Beginner' : skillLevel === 3 ? 'Advanced' : 'Intermediate'} 
              />
            </Pressable>
          )}
          <NeoText variant="bodySm" color={colors.outline} style={styles.gamesText}>
            เล่นแล้ว: {gamesPlayed} เกม
          </NeoText>
        </View>
      </View>

      {/* Delete / Actions */}
      {onDelete && (
        <Pressable onPress={onDelete} style={styles.deleteButton}>
          <NeoIcon name="trash" size={20} color={colors.error} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: spacing.strokeThick,
    borderColor: colors.onBackground,
    borderRadius: borderRadius.md,
    backgroundColor: '#ffffff',
    padding: spacing.md,
    marginVertical: spacing.sm,
    // Solid shadow
    shadowColor: colors.onBackground,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  restingContainer: {
    opacity: 0.8,
    backgroundColor: colors.surfaceContainerLow,
    shadowOffset: { width: 2, height: 2 },
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.onBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
  },
  infoColumn: {
    flex: 1,
    marginRight: spacing.sm,
  },
  nameText: {
    fontSize: 18,
    lineHeight: 22,
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: 4,
  },
  gamesText: {
    fontSize: 12,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    flexShrink: 0,
    borderColor: colors.onBackground,
    backgroundColor: colors.tertiaryContainer, // light pink
    shadowColor: colors.onBackground,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
});

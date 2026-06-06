/**
 * ShareScoreboardModal
 *
 * Modal สำหรับ:
 * - เปิด/ปิด LAN Server
 * - แสดง QR Code ให้เพื่อนสแกน
 * - แสดง URL + ปุ่มคัดลอก
 * - แสดงจำนวน clients ที่เชื่อมต่อ
 * - คำเตือน keep-awake
 *
 * Design: Neo-Brutalist ตาม ShuttleShuffle Design System
 */

import React, { useCallback } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../tokens/colors';
import { spacing, borderRadius } from '../tokens/spacing';
import { NeoText, NeoButton, NeoIcon, NeoBadge } from '../atoms';
import { useLanServer } from '../../hooks/useLanServer';
import QRCode from 'react-native-qrcode-svg';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

interface ShareScoreboardModalProps {
  visible: boolean;
  matchId: string;
  onClose: () => void;
}

// ────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────

export default function ShareScoreboardModal({
  visible,
  matchId,
  onClose,
}: ShareScoreboardModalProps) {
  const insets = useSafeAreaInsets();
  const {
    running,
    starting,
    error,
    startServer,
    stopServer,
    getMatchUrl,
  } = useLanServer();

  const matchUrl = running ? getMatchUrl(matchId) : null;


  const handleCopyUrl = useCallback(async () => {
    if (!matchUrl) return;
    await Clipboard.setStringAsync(matchUrl);
    Alert.alert('คัดลอกแล้ว! ✅', matchUrl, [{ text: 'ตกลง' }]);
  }, [matchUrl]);

  const handleToggleServer = useCallback(async () => {
    if (running) {
      Alert.alert(
        'ปิด Server?',
        'เพื่อนที่กำลังดูจอคะแนนจะขาดการเชื่อมต่อ',
        [
          { text: 'ยกเลิก', style: 'cancel' },
          { text: 'ปิด Server', style: 'destructive', onPress: stopServer },
        ]
      );
    } else {
      await startServer();
    }
  }, [running, startServer, stopServer]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}
          onPress={e => e.stopPropagation()}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Handle */}
            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.header}>
              <View>
                <NeoText variant="headlineMd" style={styles.title}>
                  📡 แชร์จอคะแนน
                </NeoText>
                <NeoText variant="bodySm" color={colors.onSurfaceVariant}>
                  เพื่อนสแกนดูคะแนน real-time ได้เลย
                </NeoText>
              </View>
              <NeoButton
                variant="icon"
                icon={<NeoIcon name="close" size={24} color={colors.onBackground} />}
                onPress={onClose}
                style={styles.closeBtn}
              />
            </View>

            {/* Server Status Banner */}
            <View style={[
              styles.statusBanner,
              running ? styles.statusBannerOn : styles.statusBannerOff,
            ]}>
              <View style={[styles.statusDot, { backgroundColor: running ? '#22c55e' : '#aaa' }]} />
              <NeoText variant="label" style={styles.statusText}>
                {running ? 'Server กำลังทำงาน' : starting ? 'กำลังเริ่ม...' : 'Server ปิดอยู่'}
              </NeoText>
              {running && (
                <View style={styles.liveBadge}>
                  <NeoText variant="labelSm">LIVE</NeoText>
                </View>
              )}
            </View>

            {/* Error */}
            {error && (
              <View style={styles.errorBox}>
                <NeoText variant="bodySm" color={colors.error}>
                  ⚠️ {error}
                </NeoText>
              </View>
            )}

            {/* QR Code Area */}
            {running && (
              <View style={styles.qrSection}>
                {matchUrl && (
                  <View style={styles.qrContainer}>
                    <View style={styles.qrImageWrapper}>
                      <QRCode
                        value={matchUrl}
                        size={240}
                        color={colors.onBackground}
                        backgroundColor={colors.background}
                      />
                    </View>
                    <NeoText variant="labelSm" style={styles.qrCaption}>
                      เปิดกล้องสแกนเพื่อดูจอคะแนน
                    </NeoText>
                  </View>
                )}

                {/* URL display */}
                {matchUrl && (
                  <Pressable style={styles.urlBox} onPress={handleCopyUrl}>
                    <NeoText variant="label" style={styles.urlLabel}>URL</NeoText>
                    <NeoText variant="bodySm" style={styles.urlText} numberOfLines={1}>
                      {matchUrl}
                    </NeoText>
                    <NeoIcon name="content-copy" size={18} color={colors.primary} />
                  </Pressable>
                )}

                {/* Keep-awake warning */}
                <View style={styles.warningBox}>
                  <NeoText variant="labelSm" style={styles.warningTitle}>
                    ⚠️ สำคัญ
                  </NeoText>
                  <NeoText variant="bodySm" color={colors.onSurfaceVariant}>
                    เปิดแอปค้างไว้ อย่า minimize หรือปิดหน้าจอ
                    เพราะ server จะหยุดทำงานเมื่อแอปอยู่เบื้องหลัง
                  </NeoText>
                </View>
              </View>
            )}

            {/* Instructions when off */}
            {!running && !starting && (
              <View style={styles.instructionBox}>
                <NeoText variant="body" style={styles.instructionTitle}>
                  วิธีใช้งาน
                </NeoText>
                <View style={styles.stepsList}>
                  {[
                    '① กด "เปิด Server" ด้านล่าง',
                    '② สแกน QR Code ที่ปรากฏขึ้น',
                    '③ เพื่อนเปิดเบราว์เซอร์ใน Wi-Fi เดียวกัน',
                    '④ คะแนนอัพเดท Real-time ทั้งสองทิศทาง',
                  ].map((step, i) => (
                    <View key={i} style={styles.stepRow}>
                      <NeoText variant="bodySm" color={colors.onBackground}>
                        {step}
                      </NeoText>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Action Button */}
            <NeoButton
              variant="primary"
              title={
                starting
                  ? '⏳ กำลังเริ่ม Server...'
                  : running
                  ? '🛑 ปิด Server'
                  : '📡 เปิด Server'
              }
              backgroundColor={
                running ? colors.errorContainer : colors.primaryContainer
              }
              disabled={starting}
              onPress={handleToggleServer}
              fullWidth
              style={styles.actionBtn}
            />

            {/* Wi-Fi Requirement Note */}
            <NeoText variant="labelSm" style={styles.note}>
              ต้องอยู่ใน Wi-Fi วงเดียวกัน • ทำงาน Offline 100%
            </NeoText>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ────────────────────────────────────────────────────────────
// Styles
// ────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    borderTopWidth: spacing.strokeThick,
    borderLeftWidth: spacing.strokeThick,
    borderRightWidth: spacing.strokeThick,
    borderColor: colors.onBackground,
    maxHeight: '92%',
  },
  scrollContent: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.outlineVariant,
    borderRadius: borderRadius.full,
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontWeight: '800',
    marginBottom: 2,
  },
  closeBtn: {
    minWidth: 40,
    minHeight: 40,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: spacing.strokeThin,
    borderColor: colors.outlineVariant,
  },
  statusBannerOn: {
    backgroundColor: '#f0fff0',
    borderColor: '#22c55e',
  },
  statusBannerOff: {
    backgroundColor: colors.surfaceContainerLow,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    flex: 1,
  },
  liveBadge: {
    marginLeft: 'auto',
  },
  errorBox: {
    padding: spacing.md,
    backgroundColor: colors.errorContainer,
    borderRadius: borderRadius.md,
    borderWidth: spacing.strokeThin,
    borderColor: colors.error,
  },
  qrSection: {
    gap: spacing.md,
    alignItems: 'center',
  },
  qrPlaceholder: {
    width: 240,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: borderRadius.lg,
    borderWidth: spacing.strokeThick,
    borderColor: colors.outlineVariant,
  },
  qrLoadingText: {
    color: colors.onSurfaceVariant,
  },
  qrContainer: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  qrImageWrapper: {
    padding: spacing.sm,
    backgroundColor: colors.background,
    borderWidth: spacing.strokeThick,
    borderColor: colors.onBackground,
    borderRadius: borderRadius.md,
    shadowColor: colors.onBackground,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  qrCaption: {
    textAlign: 'center',
    color: colors.onSurfaceVariant,
    letterSpacing: 0.5,
  },
  urlBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: borderRadius.md,
    borderWidth: spacing.strokeThin,
    borderColor: colors.outlineVariant,
    width: '100%',
  },
  urlLabel: {
    color: colors.primary,
    minWidth: 30,
  },
  urlText: {
    flex: 1,
    fontFamily: 'monospace',
    fontSize: 12,
  },
  warningBox: {
    width: '100%',
    padding: spacing.md,
    backgroundColor: '#fffbeb',
    borderRadius: borderRadius.md,
    borderWidth: spacing.strokeThin,
    borderColor: '#f59e0b',
    gap: 4,
  },
  warningTitle: {
    color: '#92400e',
    marginBottom: 2,
  },
  instructionBox: {
    width: '100%',
    padding: spacing.md,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: borderRadius.md,
    borderWidth: spacing.strokeThin,
    borderColor: colors.outlineVariant,
    gap: spacing.sm,
  },
  instructionTitle: {
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  stepsList: {
    gap: spacing.xs,
  },
  stepRow: {
    paddingLeft: spacing.xs,
  },
  actionBtn: {
    minHeight: 56,
  },
  note: {
    textAlign: 'center',
    color: colors.onSurfaceVariant,
    letterSpacing: 0.3,
  },
});

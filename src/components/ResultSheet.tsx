import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Car, CarStatus } from '../lib/cars';
import { colors, radius } from '../theme';

export type ScanResult =
  | { phase: 'loading'; code: string }
  | { phase: 'found'; code: string; car: Car }
  | { phase: 'missing'; code: string }
  | { phase: 'error'; code: string; message: string };

type Props = {
  result: ScanResult;
  onScanAgain: () => void;
  onRetry: () => void;
};

const STATUS_STYLE: Record<CarStatus, { label: string; fg: string; bg: string }> = {
  active: { label: 'Active', fg: colors.success, bg: colors.successBg },
  expired: { label: 'Expired', fg: colors.warning, bg: colors.warningBg },
  suspended: { label: 'Suspended', fg: colors.danger, bg: colors.dangerBg },
};

export default function ResultSheet({ result, onScanAgain, onRetry }: Props) {
  const insets = useSafeAreaInsets();
  const slide = useRef(new Animated.Value(60)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slide, { toValue: 0, useNativeDriver: true, bounciness: 6 }),
      Animated.timing(fade, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
  }, [slide, fade]);

  return (
    <Animated.View
      style={[
        styles.sheet,
        { paddingBottom: insets.bottom + 18, opacity: fade, transform: [{ translateY: slide }] },
      ]}
    >
      <View style={styles.grabber} />
      {result.phase === 'loading' && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.mutedText}>Checking registry…</Text>
        </View>
      )}

      {result.phase === 'found' && <Found car={result.car} onScanAgain={onScanAgain} />}

      {result.phase === 'missing' && (
        <View style={styles.centered}>
          <View style={[styles.iconCircle, { backgroundColor: colors.dangerBg }]}>
            <Ionicons name="close-circle" size={44} color={colors.danger} />
          </View>
          <Text style={styles.heading}>Car not in registry</Text>
          <Text style={styles.mutedText}>No vehicle matches this QR code.</Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeLabel}>SCANNED VALUE</Text>
            <Text style={styles.codeValue} numberOfLines={2}>
              {result.code}
            </Text>
          </View>
          <PrimaryButton label="Scan again" icon="scan" onPress={onScanAgain} />
        </View>
      )}

      {result.phase === 'error' && (
        <View style={styles.centered}>
          <View style={[styles.iconCircle, { backgroundColor: colors.warningBg }]}>
            <Ionicons name="cloud-offline" size={40} color={colors.warning} />
          </View>
          <Text style={styles.heading}>Couldn’t check the registry</Text>
          <Text style={styles.mutedText}>{result.message}</Text>
          <View style={styles.row}>
            <PrimaryButton label="Retry" icon="refresh" onPress={onRetry} />
            <SecondaryButton label="Cancel" onPress={onScanAgain} />
          </View>
        </View>
      )}
    </Animated.View>
  );
}

function Found({ car, onScanAgain }: { car: Car; onScanAgain: () => void }) {
  const status = STATUS_STYLE[car.status] ?? STATUS_STYLE.active;
  const title = [car.year, car.make, car.model].filter(Boolean).join(' ');

  return (
    <View>
      <View style={styles.foundHeader}>
        <View style={[styles.iconCircleSmall, { backgroundColor: colors.successBg }]}>
          <Ionicons name="checkmark-circle" size={30} color={colors.success} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.foundLabel}>REGISTERED VEHICLE</Text>
          <Text style={styles.foundTitle} numberOfLines={1}>
            {title}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: status.bg }]}>
          <Text style={[styles.badgeText, { color: status.fg }]}>{status.label}</Text>
        </View>
      </View>

      <View style={styles.plate}>
        <Text style={styles.plateText}>{car.plate_number}</Text>
      </View>

      <View style={styles.details}>
        <Detail icon="color-palette-outline" label="Color" value={car.color} />
        <Detail icon="person-outline" label="Owner" value={car.owner_name} />
        <Detail icon="document-text-outline" label="Notes" value={car.notes} />
      </View>

      <PrimaryButton label="Scan next car" icon="scan" onPress={onScanAgain} />
    </View>
  );
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | null;
}) {
  if (!value) return null;
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={20} color={colors.textMuted} />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function PrimaryButton({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.primaryButton, pressed && { backgroundColor: colors.primaryDark }]}
    >
      <Ionicons name={icon} size={20} color="#fff" />
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.secondaryButton, pressed && { opacity: 0.7 }]}
    >
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.border,
    paddingHorizontal: 22,
    paddingTop: 10,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: 18,
  },
  centered: { alignItems: 'center', paddingVertical: 8 },
  mutedText: { color: colors.textMuted, fontSize: 15, marginTop: 8, textAlign: 'center' },
  heading: { color: colors.text, fontSize: 22, fontWeight: '800', marginTop: 14 },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleSmall: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeBox: {
    alignSelf: 'stretch',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: 14,
    marginTop: 18,
    marginBottom: 20,
  },
  codeLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  codeValue: { color: colors.text, fontSize: 15, marginTop: 4, fontFamily: 'monospace' },
  row: { flexDirection: 'row', gap: 12, alignSelf: 'stretch', marginTop: 20 },
  foundHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  foundLabel: { color: colors.success, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  foundTitle: { color: colors.text, fontSize: 20, fontWeight: '800', marginTop: 2 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  badgeText: { fontSize: 13, fontWeight: '700' },
  plate: {
    alignSelf: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: radius.sm,
    borderWidth: 3,
    borderColor: '#1E293B',
    paddingHorizontal: 28,
    paddingVertical: 10,
    marginVertical: 18,
  },
  plateText: { color: '#0F172A', fontSize: 30, fontWeight: '900', letterSpacing: 3 },
  details: { marginBottom: 18 },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  detailLabel: { color: colors.textMuted, fontSize: 14, width: 56 },
  detailValue: { color: colors.text, fontSize: 15, fontWeight: '600', flex: 1, textAlign: 'right' },
  primaryButton: {
    flexGrow: 1,
    flexDirection: 'row',
    alignSelf: 'stretch',
    gap: 8,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryButton: {
    height: 52,
    paddingHorizontal: 22,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: { color: colors.text, fontSize: 16, fontWeight: '600' },
});

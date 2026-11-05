import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ResultSheet from '../components/ResultSheet';
import type { ScanResult } from '../components/ResultSheet';
import { useAuth } from '../context/AuthContext';
import { findCarByCode } from '../lib/cars';
import { colors, radius } from '../theme';

export default function ScannerScreen() {
  const { session, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [permission, requestPermission] = useCameraPermissions();

  const [result, setResult] = useState<ScanResult | null>(null);
  const [torch, setTorch] = useState(false);
  // Guards against the camera firing several scan events before React re-renders.
  const busy = useRef(false);

  const frame = Math.min(width * 0.7, 300);
  const frameTop = height * 0.26;

  const lookup = useCallback(async (code: string) => {
    setResult({ phase: 'loading', code });
    try {
      const car = await findCarByCode(code);
      if (car) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        setResult({ phase: 'found', code, car });
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        setResult({ phase: 'missing', code });
      }
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      setResult({
        phase: 'error',
        code,
        message: e instanceof Error ? e.message : 'Check your internet connection and try again.',
      });
    }
  }, []);

  const onScanned = useCallback(
    ({ data }: { data: string }) => {
      if (busy.current) return;
      busy.current = true;
      void lookup(data);
    },
    [lookup],
  );

  const reset = useCallback(() => {
    busy.current = false;
    setResult(null);
  }, []);

  // --- Permission states -------------------------------------------------
  if (!permission) {
    return <View style={styles.fill} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.fill, styles.permission]}>
        <View style={styles.permissionIcon}>
          <Ionicons name="camera-outline" size={44} color={colors.primary} />
        </View>
        <Text style={styles.permissionTitle}>Camera access needed</Text>
        <Text style={styles.permissionBody}>
          Car Scan uses the camera only to read vehicle QR codes.
        </Text>
        <Pressable
          style={styles.permissionButton}
          onPress={() => (permission.canAskAgain ? requestPermission() : Linking.openSettings())}
        >
          <Text style={styles.permissionButtonText}>
            {permission.canAskAgain ? 'Allow camera' : 'Open settings'}
          </Text>
        </Pressable>
        <Pressable onPress={signOut} style={styles.linkButton}>
          <Text style={styles.linkText}>Sign out</Text>
        </Pressable>
      </View>
    );
  }

  const scanning = result === null;

  return (
    <View style={styles.fill}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={torch}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanning ? onScanned : undefined}
      />

      {/* Dimmed mask with a transparent cut-out for the scan frame */}
      <View style={styles.maskLayer} pointerEvents="none">
        <View style={[styles.mask, { height: frameTop }]} />
        <View style={{ flexDirection: 'row', height: frame }}>
          <View style={styles.mask} />
          <View style={{ width: frame, height: frame }}>
            <Corners />
            {scanning && <ScanLine size={frame} />}
          </View>
          <View style={styles.mask} />
        </View>
        <View style={[styles.mask, styles.flex]} />
      </View>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.userChip}>
          <Ionicons name="person-circle-outline" size={20} color={colors.text} />
          <Text style={styles.userText} numberOfLines={1}>
            {session?.user.email}
          </Text>
        </View>
        <View style={styles.headerButtons}>
          <RoundButton
            icon={torch ? 'flashlight' : 'flashlight-outline'}
            active={torch}
            label="Toggle flashlight"
            onPress={() => setTorch((t) => !t)}
          />
          <RoundButton icon="log-out-outline" label="Sign out" onPress={signOut} />
        </View>
      </View>

      {scanning && (
        <View style={[styles.hintWrap, { top: frameTop + frame + 28 }]} pointerEvents="none">
          <Text style={styles.hint}>Point the camera at a vehicle QR code</Text>
        </View>
      )}

      {result && (
        <ResultSheet
          // Re-mount on each new result so the entrance animation replays.
          key={result.phase}
          result={result}
          onScanAgain={reset}
          onRetry={() => void lookup(result.code)}
        />
      )}
    </View>
  );
}

function RoundButton({
  icon,
  onPress,
  label,
  active,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  label: string;
  active?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={label}
      style={[styles.roundButton, active && { backgroundColor: colors.primary }]}
    >
      <Ionicons name={icon} size={22} color="#fff" />
    </Pressable>
  );
}

function Corners() {
  return (
    <>
      <View style={[styles.corner, styles.tl]} />
      <View style={[styles.corner, styles.tr]} />
      <View style={[styles.corner, styles.bl]} />
      <View style={[styles.corner, styles.br]} />
    </>
  );
}

function ScanLine({ size }: { size: number }) {
  const y = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(y, {
          toValue: size - 6,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(y, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [y, size]);

  return <Animated.View style={[styles.scanLine, { transform: [{ translateY: y }] }]} />;
}

const CORNER = 34;
const CORNER_W = 5;

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  maskLayer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  mask: { flex: 1, backgroundColor: colors.overlay },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  userChip: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(11,18,32,0.7)',
    borderRadius: 999,
    paddingHorizontal: 12,
    height: 44,
  },
  userText: { color: colors.text, fontSize: 13, fontWeight: '600', flexShrink: 1 },
  headerButtons: { flexDirection: 'row', gap: 10 },
  roundButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(11,18,32,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintWrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  hint: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    backgroundColor: 'rgba(11,18,32,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  corner: { position: 'absolute', width: CORNER, height: CORNER, borderColor: colors.primary },
  tl: { top: 0, left: 0, borderTopWidth: CORNER_W, borderLeftWidth: CORNER_W, borderTopLeftRadius: 14 },
  tr: { top: 0, right: 0, borderTopWidth: CORNER_W, borderRightWidth: CORNER_W, borderTopRightRadius: 14 },
  bl: { bottom: 0, left: 0, borderBottomWidth: CORNER_W, borderLeftWidth: CORNER_W, borderBottomLeftRadius: 14 },
  br: { bottom: 0, right: 0, borderBottomWidth: CORNER_W, borderRightWidth: CORNER_W, borderBottomRightRadius: 14 },
  scanLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 6,
  },
  permission: { alignItems: 'center', justifyContent: 'center', padding: 32 },
  permissionIcon: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionTitle: { color: colors.text, fontSize: 24, fontWeight: '800', marginTop: 22 },
  permissionBody: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 8,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    height: 52,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 26,
  },
  permissionButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  linkButton: { marginTop: 18, padding: 8 },
  linkText: { color: colors.textMuted, fontSize: 15 },
});

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from 'react';
import type { ComponentRef } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../context/AuthContext';
import { colors, radius } from '../theme';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();
  const passwordRef = useRef<ComponentRef<typeof TextInput>>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !busy;

  async function submit() {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      const message = await signIn(email, password);
      if (message) setError(message);
    } catch {
      setError('Could not reach the server. Check your internet connection.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <LinearGradient colors={['#0B1220', '#12214A', '#0B1220']} style={styles.fill}>
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.brand}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.logo}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="car-sport" size={44} color="#fff" />
            </LinearGradient>
            <Text style={styles.title}>Car Scan</Text>
            <Text style={styles.subtitle}>Scan a vehicle QR code and check the registry instantly.</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign in</Text>

            <Text style={styles.label}>Email</Text>
            <View style={styles.inputRow}>
              <Ionicons name="mail-outline" size={20} color={colors.textMuted} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@company.com"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            </View>

            <Text style={styles.label}>Password</Text>
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />
              <TextInput
                ref={passwordRef}
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Your password"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
                returnKeyType="go"
                onSubmitEditing={submit}
              />
              <Pressable
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={10}
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textMuted}
                />
              </Pressable>
            </View>

            {error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Pressable
              onPress={submit}
              disabled={!canSubmit}
              style={({ pressed }) => [
                styles.button,
                !canSubmit && styles.buttonDisabled,
                pressed && styles.buttonPressed,
              ]}
            >
              {busy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign in</Text>
              )}
            </Pressable>
          </View>

          <Text style={styles.footer}>Accounts are issued by your administrator.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 },
  brand: { alignItems: 'center', marginBottom: 32 },
  logo: {
    width: 84,
    height: 84,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    elevation: 8,
    shadowColor: colors.primary,
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  title: { color: colors.text, fontSize: 32, fontWeight: '800', letterSpacing: 0.5 },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
    maxWidth: 300,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { color: colors.text, fontSize: 22, fontWeight: '700', marginBottom: 12 },
  label: { color: colors.textMuted, fontSize: 13, fontWeight: '600', marginTop: 14, marginBottom: 8 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    height: 54,
  },
  input: { flex: 1, color: colors.text, fontSize: 16, height: '100%' },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.dangerBg,
    borderRadius: radius.sm,
    padding: 12,
    marginTop: 16,
  },
  errorText: { color: '#FCA5A5', flex: 1, fontSize: 14 },
  button: {
    backgroundColor: colors.primary,
    height: 54,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
  },
  buttonDisabled: { opacity: 0.45 },
  buttonPressed: { backgroundColor: colors.primaryDark },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  footer: { color: colors.textMuted, fontSize: 13, textAlign: 'center', marginTop: 24 },
});

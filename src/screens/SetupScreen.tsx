import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '../theme';

/** Shown when the Supabase keys are missing from .env. */
export default function SetupScreen() {
  return (
    <View style={styles.container}>
      <Ionicons name="construct-outline" size={56} color={colors.warning} />
      <Text style={styles.title}>Database not connected</Text>
      <Text style={styles.body}>
        Create a file named <Text style={styles.code}>.env</Text> in the project root with your
        Supabase details, then restart Expo with <Text style={styles.code}>npx expo start -c</Text>.
      </Text>
      <View style={styles.box}>
        <Text style={styles.code}>EXPO_PUBLIC_SUPABASE_URL=...</Text>
        <Text style={styles.code}>EXPO_PUBLIC_SUPABASE_ANON_KEY=...</Text>
      </View>
      <Text style={styles.hint}>See README.md for the full setup.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  title: { color: colors.text, fontSize: 24, fontWeight: '800', marginTop: 18 },
  body: { color: colors.textMuted, fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 10 },
  box: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginTop: 20,
    alignSelf: 'stretch',
    gap: 6,
  },
  code: { color: '#93C5FD', fontFamily: 'monospace', fontSize: 13 },
  hint: { color: colors.textMuted, fontSize: 13, marginTop: 18 },
});

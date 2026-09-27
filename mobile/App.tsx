import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  bootstrap,
  clearSession,
  login,
  overview,
  refreshSession,
  setWorkspace,
  type Bootstrap,
  type Workspace,
} from "./src/api";

const DEEP_BLUE = "#0F3E8A";
const GROWTH_GOLD = "#E2B02A";
const SLATE = "#1E293B";
const ICE = "#F8FAFC";

type Overview = Awaited<ReturnType<typeof overview>>;

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [boot, setBoot] = useState<Bootstrap | null>(null);
  const [stats, setStats] = useState<Overview | null>(null);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);

  async function loadSession() {
    try {
      const session = await bootstrap();
      setBoot(session);
      const workspace = session.workspaces[0] ?? null;
      if (workspace) {
        await setWorkspace(workspace.id);
        setSelectedWorkspace(workspace);
      }
      try {
        setStats(await overview());
      } catch (overviewError) {
        setError(overviewError instanceof Error ? overviewError.message : "Dashboard data unavailable.");
      }
    } catch {
      setBoot(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSession();
  }, []);

  async function handleLogin() {
    setError("");
    setSigningIn(true);
    try {
      await login(email, password);
      await loadSession();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in.");
      setLoading(false);
    } finally {
      setSigningIn(false);
    }
  }

  async function chooseWorkspace(workspace: Workspace) {
    await setWorkspace(workspace.id);
    setSelectedWorkspace(workspace);
    setError("");
    try {
      setStats(await overview());
    } catch (overviewError) {
      setError(overviewError instanceof Error ? overviewError.message : "Dashboard data unavailable.");
    }
  }

  async function handleRefresh() {
    setError("");
    try {
      await refreshSession();
      const session = await bootstrap();
      setBoot(session);
      setStats(await overview());
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : "Session expired.");
    }
  }

  async function handleLogout() {
    await clearSession();
    setBoot(null);
    setStats(null);
    setSelectedWorkspace(null);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color={DEEP_BLUE} />
        <Text style={styles.muted}>Connecting to Aslal…</Text>
      </SafeAreaView>
    );
  }

  if (!boot) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />
        <ScrollView contentContainerStyle={styles.loginContainer}>
          <Text style={styles.brand}>ASLAL</Text>
          <Text style={styles.title}>Growth OS Mobile</Text>
          <Text style={styles.subtitle}>Sign in to your existing Aslal workspace.</Text>

          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="Email"
            placeholderTextColor="#64748B"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            secureTextEntry
            placeholder="Password"
            placeholderTextColor="#64748B"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable style={styles.primaryButton} onPress={handleLogin} disabled={signingIn}>
            {signingIn ? <ActivityIndicator color="white" /> : <Text style={styles.primaryText}>Sign in</Text>}
          </Pressable>

          <Text style={styles.footer}>Connected to aslaldigital.com</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>ASLAL</Text>
            <Text style={styles.welcome}>Welcome, {boot.user.name}</Text>
          </View>
          <Pressable onPress={handleLogout}>
            <Text style={styles.link}>Sign out</Text>
          </Pressable>
        </View>

        {boot.workspaces.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>WORKSPACE</Text>
            <Text style={styles.workspaceName}>{selectedWorkspace?.name ?? "Select workspace"}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {boot.workspaces.map((workspace) => (
                <Pressable
                  key={workspace.id}
                  onPress={() => chooseWorkspace(workspace)}
                  style={[styles.workspaceChip, selectedWorkspace?.id === workspace.id && styles.workspaceChipActive]}
                >
                  <Text style={[styles.workspaceChipText, selectedWorkspace?.id === workspace.id && styles.workspaceChipTextActive]}>
                    {workspace.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.row}>
          <Metric label="Leads" value={stats?.leads ?? "—"} />
          <Metric label="Hot leads" value={stats?.hotLeads ?? "—"} />
        </View>
        <View style={styles.row}>
          <Metric label="Visitors" value={stats?.visitors ?? "—"} />
          <Metric label="Events" value={stats?.events?.length ?? "—"} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>MOBILE FOUNDATION</Text>
          <Text style={styles.cardTitle}>One Aslal backend</Text>
          <Text style={styles.body}>
            This app uses the existing authentication, workspace session, API routes and production database. It does not connect directly to MySQL.
          </Text>
        </View>

        <Pressable style={styles.secondaryButton} onPress={handleRefresh}>
          <Text style={styles.secondaryText}>Refresh session & data</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: ICE },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: ICE, gap: 12 },
  loginContainer: { flexGrow: 1, justifyContent: "center", padding: 24 },
  container: { padding: 20, paddingBottom: 40, gap: 16 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  brand: { color: DEEP_BLUE, fontSize: 26, fontWeight: "900", letterSpacing: 2 },
  welcome: { color: SLATE, fontSize: 16, marginTop: 4 },
  title: { color: SLATE, fontSize: 32, fontWeight: "800", marginTop: 8 },
  subtitle: { color: "#64748B", fontSize: 16, lineHeight: 23, marginTop: 8, marginBottom: 28 },
  input: { backgroundColor: "white", borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 15, fontSize: 16, marginBottom: 12, color: SLATE },
  primaryButton: { backgroundColor: DEEP_BLUE, borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 4 },
  primaryText: { color: "white", fontSize: 16, fontWeight: "800" },
  secondaryButton: { borderWidth: 1, borderColor: DEEP_BLUE, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  secondaryText: { color: DEEP_BLUE, fontWeight: "800" },
  link: { color: DEEP_BLUE, fontWeight: "700" },
  card: { backgroundColor: "white", borderRadius: 18, padding: 18, borderWidth: 1, borderColor: "#E2E8F0", gap: 8 },
  sectionLabel: { color: GROWTH_GOLD, fontSize: 11, fontWeight: "900", letterSpacing: 1.4 },
  workspaceName: { color: SLATE, fontSize: 20, fontWeight: "800" },
  workspaceChip: { borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9, marginRight: 8 },
  workspaceChipActive: { backgroundColor: DEEP_BLUE, borderColor: DEEP_BLUE },
  workspaceChipText: { color: SLATE, fontWeight: "700" },
  workspaceChipTextActive: { color: "white" },
  row: { flexDirection: "row", gap: 12 },
  metric: { flex: 1, backgroundColor: "white", borderRadius: 18, padding: 18, borderWidth: 1, borderColor: "#E2E8F0" },
  metricValue: { color: DEEP_BLUE, fontSize: 28, fontWeight: "900" },
  metricLabel: { color: "#64748B", marginTop: 5 },
  cardTitle: { color: SLATE, fontSize: 20, fontWeight: "800" },
  body: { color: "#475569", lineHeight: 21 },
  error: { color: "#B91C1C", backgroundColor: "#FEF2F2", borderRadius: 12, padding: 12 },
  muted: { color: "#64748B" },
  footer: { textAlign: "center", color: "#64748B", marginTop: 20, fontSize: 12 },
});

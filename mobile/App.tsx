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
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { bootstrap, clearSession, getDeviceId, login, ping, refreshSession, setWorkspace, type Bootstrap, type Workspace } from "./src/api";
import { getMobileDatabase, listPendingOperations } from "./src/offline";
import { resolveMobileRole, tabsForRole, type MobileRole, type MobileTab, type SyncState } from "./src/contracts";

const DEEP_BLUE = "#0F3E8A";
const GROWTH_GOLD = "#E2B02A";
const SLATE = "#1E293B";
const ICE = "#F8FAFC";

type Overview = Awaited<ReturnType<typeof overview>>;

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [boot, setBoot] = useState<Bootstrap | null>(null);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [activeTab, setActiveTab] = useState<MobileTab>("today");
  const [syncState, setSyncState] = useState<SyncState>("LIMITED");
  const [pendingCount, setPendingCount] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);

  const mobileRole = useMemo<MobileRole | null>(
    () => (boot ? resolveMobileRole(boot.user.role, boot.user.permissions) : null), [boot],
  );
  const tabs = useMemo(() => (mobileRole ? tabsForRole(mobileRole) : []), [mobileRole]);

  async function loadSession() {
    try {
      const session = await bootstrap();
      setBoot(session);
      const workspace = session.workspaces[0] ?? null;
      if (workspace) {
        await setWorkspace(workspace.id);
        setSelectedWorkspace(workspace);
      }
      await getMobileDatabase();
      if (workspace) setPendingCount((await listPendingOperations(workspace.id)).length);
      setSyncState("LIVE");
    } catch {
      setBoot(null);
      setSyncState("OFFLINE");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadSession(); }, []);

  async function handleLogin() {
    setError("");
    setSigningIn(true);
    try { await login(email, password); await loadSession(); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to sign in."); setLoading(false); }
    finally { setSigningIn(false); }
  }

  async function chooseWorkspace(workspace: Workspace) {
    await setWorkspace(workspace.id);
    setSelectedWorkspace(workspace);
    setPendingCount((await listPendingOperations(workspace.id)).length);
    setError("");
  }

  async function handleRefresh() {
    setError("");
    setSyncState("SYNCING");
    try { await refreshSession(); await ping(); await loadSession(); }
    catch (e) { setSyncState("OFFLINE"); setError(e instanceof Error ? e.message : "Connection unavailable."); }
  }

  async function handleLogout() {
    await clearSession();
    setBoot(null);
    setSelectedWorkspace(null);
    setActiveTab("today");
    setPendingCount(0);
    setSyncState("LIMITED");
  }

  if (loading) return (
    <SafeAreaView style={styles.center}>
      <StatusBar style="dark" />
      <ActivityIndicator size="large" color={DEEP_BLUE} />
      <Text style={styles.muted}>Opening Aslal workspace…</Text>
    </SafeAreaView>
  );

  if (!boot) return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.loginContainer}>
        <Text style={styles.brand}>ASLAL</Text>
        <Text style={styles.title}>Your growth work, in your pocket.</Text>
        <Text style={styles.subtitle}>Capture leads, follow up, review journeys and monitor your workspace without turning the mobile app into a website copy.</Text>
        <TextInput autoCapitalize="none" autoCorrect={false} keyboardType="email-address" placeholder="Email" placeholderTextColor="#64748B" style={styles.input} value={email} onChangeText={setEmail} />
        <TextInput secureTextEntry placeholder="Password" placeholderTextColor="#64748B" style={styles.input} value={password} onChangeText={setPassword} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable style={styles.primaryButton} onPress={handleLogin} disabled={signingIn}>
          {signingIn ? <ActivityIndicator color="white" /> : <Text style={styles.primaryText}>Sign in</Text>}
        </Pressable>
        <Text style={styles.footer}>One Aslal backend · one workspace authorization model</Text>
      </ScrollView>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.topBar}>
        <View><Text style={styles.brandSmall}>ASLAL</Text><Text style={styles.welcome}>{boot.user.name}</Text></View>
        <View style={styles.topRight}>
          <SyncBadge state={syncState} pending={pendingCount} />
          <Pressable onPress={handleLogout}><Text style={styles.link}>Sign out</Text></Pressable>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        {boot.workspaces.length > 0 ? <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.workspaceScroller}>
          {boot.workspaces.map((workspace) => <Pressable key={workspace.id} onPress={() => void chooseWorkspace(workspace)} style={[styles.workspaceChip, selectedWorkspace?.id === workspace.id && styles.workspaceChipActive]}>
            <Text style={[styles.workspaceChipText, selectedWorkspace?.id === workspace.id && styles.workspaceChipTextActive]}>{workspace.name}</Text>
          </Pressable>)}
        </ScrollView> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {mobileRole ? <RoleHeader role={mobileRole} workspace={selectedWorkspace} /> : null}
        <MobileSurface role={mobileRole ?? "SALES"} tab={activeTab} pendingCount={pendingCount} onRefresh={() => void handleRefresh()} />
      </ScrollView>
      <View style={styles.bottomNav}>
        {tabs.map((tab) => <Pressable key={tab} style={styles.navItem} onPress={() => setActiveTab(tab)}>
          <Text style={[styles.navLabel, activeTab === tab && styles.navLabelActive]}>{TAB_LABELS[tab]}</Text>
        </Pressable>)}
      </View>
    </SafeAreaView>
  );
}

function RoleHeader({ role, workspace }: { role: MobileRole; workspace: Workspace | null }) {
  const title = role === "ADMIN" ? "Command" : role === "PARTNER" ? "Partner" : role === "CLIENT" ? "Business" : role === "FINANCE" ? "Finance" : "Sales";
  return <View style={styles.hero}>
    <Text style={styles.sectionLabel}>{title.toUpperCase()} / TODAY</Text>
    <Text style={styles.heroTitle}>{workspace?.name ?? "Choose your workspace"}</Text>
    <Text style={styles.body}>Your mobile workspace is organized around actions, people and journeys—not desktop tables.</Text>
  </View>;
}

function MobileSurface({ role, tab, pendingCount, onRefresh }: { role: MobileRole; tab: MobileTab; pendingCount: number; onRefresh: () => void }) {
  if (tab === "more") return <View style={styles.card}>
    <Text style={styles.sectionLabel}>MORE</Text><Text style={styles.cardTitle}>Mobile controls</Text>
    <Text style={styles.body}>Sync status, workspace, profile and role-specific tools belong here. Deep administration remains on web.</Text>
    <Pressable style={styles.secondaryButton} onPress={onRefresh}><Text style={styles.secondaryText}>Refresh connection</Text></Pressable>
  </View>;

  if (tab === "today" || tab === "command") return <View style={styles.stack}>
    <ActionCard title={role === "PARTNER" ? "Campaign opportunities" : "What needs attention?"}
      body={role === "FINANCE" ? "Payment evidence, reconciliation exceptions and orders requiring server confirmation." : role === "PARTNER" ? "Open a campaign, share an approved referral and track attributable outcomes." : "Start with new replies, overdue follow-ups, hot leads and important exceptions."}
      action={role === "PARTNER" ? "Open campaigns" : "Open next action"} />
    <View style={styles.row}><Metric label="Pending sync" value={pendingCount} /><Metric label="Workspace" value={role} /></View>
    <ActionCard title="Offline ready" body="Operational drafts can be stored locally. Server-authoritative financial and permission changes are never declared complete offline." action="View sync center" />
  </View>;

  const descriptions: Record<string, string> = {
    inbox: "Conversation-first handling: read context, respond, hand off and keep the next action aligned.",
    leads: "People to act on: owner, stage, source, next action and due time—not a desktop database table.",
    tasks: "Today, overdue and upcoming follow-up work.",
    campaigns: "Campaign missions, approved assets, rules and partner outcomes.",
    referrals: "Referral links, attributable leads and customer outcomes.",
    earnings: "Pending, eligible and paid partner earnings.",
    customers: "Customer relationship context and commercial journey.",
    orders: "Order state, payment state and customer context.",
    payments: "Server-authoritative payment review, evidence and reconciliation.",
  };
  return <View style={styles.card}>
    <Text style={styles.sectionLabel}>{TAB_LABELS[tab].toUpperCase()}</Text><Text style={styles.cardTitle}>{TAB_LABELS[tab]}</Text>
    <Text style={styles.body}>{descriptions[tab] ?? "This role-specific mobile surface is ready for its contract-backed workflow."}</Text>
    <View style={styles.divider} />
    <Text style={styles.muted}>The next implementation adds real workspace-scoped records without copying website navigation.</Text>
  </View>;
}

function ActionCard({ title, body, action }: { title: string; body: string; action: string }) {
  return <View style={styles.actionCard}>
    <Text style={styles.sectionLabel}>NEXT ACTION</Text><Text style={styles.cardTitle}>{title}</Text><Text style={styles.body}>{body}</Text>
    <Pressable style={styles.primaryButton} onPress={() => undefined}><Text style={styles.primaryText}>{action}</Text></Pressable>
  </View>;
}

function SyncBadge({ state, pending }: { state: SyncState; pending: number }) {
  const label = state === "LIVE" ? "Live" : state === "SYNCING" ? "Syncing" : state === "OFFLINE" ? "Offline" : "Limited";
  return <Text style={styles.sync}>{label}{pending ? " · " + pending + " queued" : ""}</Text>;
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return <View style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: ICE }, center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: ICE, gap: 12 },
  loginContainer: { flexGrow: 1, justifyContent: "center", padding: 24 }, container: { padding: 20, paddingBottom: 100, gap: 16 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 10, paddingBottom: 8 }, topRight: { alignItems: "flex-end", gap: 6 },
  brand: { color: DEEP_BLUE, fontSize: 28, fontWeight: "900", letterSpacing: 2 }, brandSmall: { color: DEEP_BLUE, fontSize: 20, fontWeight: "900", letterSpacing: 2 },
  welcome: { color: SLATE, fontSize: 14, marginTop: 2 }, title: { color: SLATE, fontSize: 32, fontWeight: "800", marginTop: 10 }, subtitle: { color: "#64748B", fontSize: 16, lineHeight: 23, marginTop: 8, marginBottom: 28 },
  input: { backgroundColor: "white", borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 15, fontSize: 16, marginBottom: 12, color: SLATE },
  primaryButton: { backgroundColor: DEEP_BLUE, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16, alignItems: "center", marginTop: 4 }, primaryText: { color: "white", fontSize: 15, fontWeight: "800" },
  secondaryButton: { borderWidth: 1, borderColor: DEEP_BLUE, borderRadius: 14, paddingVertical: 13, alignItems: "center", marginTop: 12 }, secondaryText: { color: DEEP_BLUE, fontWeight: "800" },
  link: { color: DEEP_BLUE, fontWeight: "700" }, sync: { color: "#64748B", fontSize: 11, fontWeight: "800" }, workspaceScroller: { flexGrow: 0, marginBottom: 2 },
  workspaceChip: { borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9, marginRight: 8, backgroundColor: "white" }, workspaceChipActive: { backgroundColor: DEEP_BLUE, borderColor: DEEP_BLUE },
  workspaceChipText: { color: SLATE, fontWeight: "700" }, workspaceChipTextActive: { color: "white" }, hero: { backgroundColor: "#EAF1FF", borderRadius: 22, padding: 20, gap: 7 },
  heroTitle: { color: SLATE, fontSize: 24, fontWeight: "900" }, stack: { gap: 12 }, actionCard: { backgroundColor: DEEP_BLUE, borderRadius: 22, padding: 20, gap: 9 },
  card: { backgroundColor: "white", borderRadius: 20, padding: 18, borderWidth: 1, borderColor: "#E2E8F0", gap: 8 }, sectionLabel: { color: GROWTH_GOLD, fontSize: 11, fontWeight: "900", letterSpacing: 1.4 },
  cardTitle: { color: SLATE, fontSize: 20, fontWeight: "800" }, body: { color: "#475569", lineHeight: 21 }, divider: { height: 1, backgroundColor: "#E2E8F0", marginVertical: 8 },
  row: { flexDirection: "row", gap: 12 }, metric: { flex: 1, backgroundColor: "white", borderRadius: 18, padding: 18, borderWidth: 1, borderColor: "#E2E8F0" },
  metricValue: { color: DEEP_BLUE, fontSize: 22, fontWeight: "900" }, metricLabel: { color: "#64748B", marginTop: 5, fontSize: 12 },
  error: { color: "#B91C1C", backgroundColor: "#FEF2F2", borderRadius: 12, padding: 12 }, muted: { color: "#64748B", lineHeight: 20 }, footer: { textAlign: "center", color: "#64748B", marginTop: 20, fontSize: 12 },
  bottomNav: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#E2E8F0", backgroundColor: "white", paddingVertical: 10, paddingHorizontal: 4 }, navItem: { flex: 1, alignItems: "center", paddingVertical: 8 },
  navLabel: { color: "#64748B", fontSize: 11, fontWeight: "700" }, navLabelActive: { color: DEEP_BLUE, fontWeight: "900" },
});

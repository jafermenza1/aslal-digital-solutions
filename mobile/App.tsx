import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
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
  getLead,
  getLeads,
  login,
  ping,
  refreshSession,
  setWorkspace,
  type Bootstrap,
  type MobileLead,
  type Workspace,
} from "./src/api";
import { getMobileDatabase, listPendingOperations } from "./src/offline";
import {
  resolveMobileRole,
  tabsForRole,
  type MobileRole,
  type MobileTab,
  type SyncState,
} from "./src/contracts";

const DEEP_BLUE = "#0F3E8A";
const GROWTH_GOLD = "#E2B02A";
const SLATE = "#1E293B";
const ICE = "#F8FAFC";

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
  const [leads, setLeads] = useState<MobileLead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(false);

  const mobileRole = useMemo<MobileRole | null>(
    () => boot ? resolveMobileRole(boot.user.role, boot.user.permissions) : null,
    [boot],
  );
  const tabs = useMemo(() => mobileRole ? tabsForRole(mobileRole) : [], [mobileRole]);

  async function loadSession() {
    try {
      const session = await bootstrap();
      setBoot(session);
      const workspace = session.workspaces[0] ?? null;
      if (workspace) {
        await setWorkspace(workspace.id);
        setSelectedWorkspace(workspace);
        setPendingCount((await listPendingOperations(workspace.id)).length);
      }
      await getMobileDatabase();
      setSyncState("LIVE");
    } catch {
      setBoot(null);
      setSyncState("OFFLINE");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadSession(); }, []);

  useEffect(() => {
    if (activeTab !== "leads" || !selectedWorkspace) return;
    setDataLoading(true);
    void getLeads()
      .then((result) => { setLeads(result.leads); setError(""); })
      .catch((e) => setError(e instanceof Error ? e.message : "Unable to load leads."))
      .finally(() => setDataLoading(false));
  }, [activeTab, selectedWorkspace]);

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
    setSelectedLeadId(null);
    setSelectedLead(null);
    setLeads([]);
    setPendingCount((await listPendingOperations(workspace.id)).length);
    setError("");
  }

  async function openLead(id: string) {
    setSelectedLeadId(id);
    setDataLoading(true);
    try {
      const result = await getLead(id);
      setSelectedLead(result.lead);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load lead.");
    } finally {
      setDataLoading(false);
    }
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
    setLeads([]);
    setSelectedLead(null);
    setSelectedLeadId(null);
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
        <Text style={styles.subtitle}>Action-first mobile work for leads, follow-ups, partners, customers and commercial journeys. This is not the Aslal website in a smaller screen.</Text>
        <TextInput autoCapitalize="none" autoCorrect={false} keyboardType="email-address" placeholder="Email" placeholderTextColor="#64748B" style={styles.input} value={email} onChangeText={setEmail} />
        <TextInput secureTextEntry placeholder="Password" placeholderTextColor="#64748B" style={styles.input} value={password} onChangeText={setPassword} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable style={styles.primaryButton} onPress={handleLogin} disabled={signingIn}>
          {signingIn ? <ActivityIndicator color="white" /> : <Text style={styles.primaryText}>Sign in</Text>}
        </Pressable>
        <Text style={styles.footer}>One backend · one authorization model · one workspace boundary</Text>
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
          <Pressable onPress={() => void handleLogout()}><Text style={styles.link}>Sign out</Text></Pressable>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.workspaceScroller}>
          {boot.workspaces.map((workspace) => (
            <Pressable key={workspace.id} onPress={() => void chooseWorkspace(workspace)} style={[styles.workspaceChip, selectedWorkspace?.id === workspace.id && styles.workspaceChipActive]}>
              <Text style={[styles.workspaceChipText, selectedWorkspace?.id === workspace.id && styles.workspaceChipTextActive]}>{workspace.name}</Text>
            </Pressable>
          ))}
        </ScrollView>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {mobileRole ? <RoleHeader role={mobileRole} workspace={selectedWorkspace} /> : null}
        {activeTab === "leads"
          ? <LeadSurface leads={leads} selectedLead={selectedLead} selectedLeadId={selectedLeadId} loading={dataLoading} onOpenLead={(id) => void openLead(id)} onBack={() => setSelectedLead(null)} />
          : <MobileSurface role={mobileRole ?? "SALES"} tab={activeTab} pendingCount={pendingCount} onRefresh={() => void handleRefresh()} />}
      </ScrollView>
      <View style={styles.bottomNav}>
        {tabs.map((tab) => (
          <Pressable key={tab} style={styles.navItem} onPress={() => { setActiveTab(tab); if (tab !== "leads") { setSelectedLead(null); setSelectedLeadId(null); } }}>
            <Text style={[styles.navLabel, activeTab === tab && styles.navLabelActive]}>{TAB_LABELS[tab]}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

function RoleHeader({ role, workspace }: { role: MobileRole; workspace: Workspace | null }) {
  const title = role === "ADMIN" ? "Command" : role === "PARTNER" ? "Partner" : role === "CLIENT" ? "Business" : role === "FINANCE" ? "Finance" : "Sales";
  return <View style={styles.hero}>
    <Text style={styles.sectionLabel}>{title.toUpperCase()} / MOBILE</Text>
    <Text style={styles.heroTitle}>{workspace?.name ?? "Choose your workspace"}</Text>
    <Text style={styles.body}>Action-first records, journeys and next steps. Server-authoritative states stay authoritative.</Text>
  </View>;
}

function LeadSurface({ leads, selectedLead, selectedLeadId, loading, onOpenLead, onBack }: {
  leads: MobileLead[];
  selectedLead: any;
  selectedLeadId: string | null;
  loading: boolean;
  onOpenLead: (id: string) => void;
  onBack: () => void;
}) {
  if (selectedLeadId && selectedLead) return (
    <View style={styles.stack}>
      <Pressable onPress={onBack}><Text style={styles.link}>← Back to leads</Text></Pressable>
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>LEAD JOURNEY</Text>
        <Text style={styles.cardTitle}>{selectedLead.name}</Text>
        <Text style={styles.body}>{selectedLead.company || selectedLead.email || selectedLead.phone || "No contact detail recorded"}</Text>
        <View style={styles.row}><Metric label="Stage" value={selectedLead.status} /><Metric label="Score" value={selectedLead.score} /></View>
        {selectedLead.nextAction ? <Info label="Next action" value={selectedLead.nextAction} /> : null}
        {selectedLead.nextActionDueAt ? <Info label="Due" value={formatDate(selectedLead.nextActionDueAt)} /> : null}
        {selectedLead.message ? <Info label="Context" value={selectedLead.message} /> : null}
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>TIMELINE</Text>
        {selectedLead.stageHistory.length ? selectedLead.stageHistory.map((item: any, i: number) => (
          <View key={i} style={styles.timelineRow}>
            <View style={styles.dot} />
            <View style={{ flex: 1 }}><Text style={styles.cardTitleSmall}>{item.toStage}</Text><Text style={styles.muted}>{item.changedBy || "System"} · {formatDate(item.createdAt)}</Text>{item.note ? <Text style={styles.body}>{item.note}</Text> : null}</View>
          </View>
        )) : <Text style={styles.muted}>No stage history recorded.</Text>}
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>FOLLOW-UP</Text>
        {selectedLead.tasks.length ? selectedLead.tasks.map((task: any) => (
          <View key={task.id} style={styles.taskRow}><Text style={styles.cardTitleSmall}>{task.title}</Text><Text style={styles.muted}>{task.status} · {task.priority}{task.dueAt ? " · " + formatDate(task.dueAt) : ""}</Text></View>
        )) : <Text style={styles.muted}>No tasks recorded for this lead.</Text>}
      </View>
    </View>
  );

  return <View style={styles.stack}>
    <View style={styles.card}><Text style={styles.sectionLabel}>MY LEADS / WORKSPACE</Text><Text style={styles.cardTitle}>Act on people, not tables.</Text><Text style={styles.body}>Priority, stage, owner and next action are kept visible. Tap a lead to open its journey.</Text></View>
    {loading ? <ActivityIndicator color={DEEP_BLUE} /> : leads.length ? leads.map((lead) => (
      <Pressable key={lead.id} style={styles.leadCard} onPress={() => onOpenLead(lead.id)}>
        <View style={styles.leadTop}><Text style={styles.cardTitleSmall}>{lead.name}</Text><Text style={styles.stage}>{lead.status}</Text></View>
        <Text style={styles.body}>{lead.company || lead.email || lead.phone || "No contact detail"}</Text>
        <Text style={styles.muted}>Score {lead.score} · {lead.nextAction || "No next action"}{lead.nextActionDueAt ? " · " + formatDate(lead.nextActionDueAt) : ""}</Text>
      </Pressable>
    )) : <Text style={styles.muted}>No leads available in this workspace.</Text>}
  </View>;
}

function MobileSurface({ role, tab, pendingCount, onRefresh }: { role: MobileRole; tab: MobileTab; pendingCount: number; onRefresh: () => void }) {
  if (tab === "more") return <View style={styles.card}>
    <Text style={styles.sectionLabel}>MORE</Text><Text style={styles.cardTitle}>Mobile controls</Text>
    <Text style={styles.body}>Connection, workspace and sync controls live here. Deep administration remains on web.</Text>
    <Pressable style={styles.secondaryButton} onPress={onRefresh}><Text style={styles.secondaryText}>Refresh connection</Text></Pressable>
  </View>;

  if (tab === "today" || tab === "command") return <View style={styles.stack}>
    <ActionCard title={role === "PARTNER" ? "Campaign opportunities" : "What needs attention?"}
      body={role === "FINANCE" ? "Review orders, payment evidence and reconciliation exceptions. Financial completion is server-authoritative." : role === "PARTNER" ? "Open a campaign, use approved assets and track attributable outcomes." : "Start with replies, overdue follow-ups, high-intent leads and important exceptions."}
      action={role === "PARTNER" ? "Open campaigns" : "Open next action"} />
    <View style={styles.row}><Metric label="Pending sync" value={pendingCount} /><Metric label="Role" value={role} /></View>
    <ActionCard title="Offline ready" body="Operational drafts can be stored locally. Payments, reconciliation, revenue and permissions are never declared complete offline." action="View sync center" />
  </View>;

  const descriptions: Record<string, string> = {
    inbox: "Conversation-first handling: read context, respond, hand off and keep the next action aligned.",
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
    <Text style={styles.muted}>No placeholder business data is shown here; the next surfaces will consume workspace-scoped APIs.</Text>
  </View>;
}

function ActionCard({ title, body, action }: { title: string; body: string; action: string }) {
  return <View style={styles.actionCard}>
    <Text style={styles.sectionLabel}>NEXT ACTION</Text><Text style={styles.cardTitleWhite}>{title}</Text><Text style={styles.bodyWhite}>{body}</Text>
    <Pressable style={styles.goldButton} onPress={() => undefined}><Text style={styles.goldText}>{action}</Text></Pressable>
  </View>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <View style={styles.info}><Text style={styles.muted}>{label}</Text><Text style={styles.body}>{value}</Text></View>;
}

function SyncBadge({ state, pending }: { state: SyncState; pending: number }) {
  const label = state === "LIVE" ? "Live" : state === "SYNCING" ? "Syncing" : state === "OFFLINE" ? "Offline" : "Limited";
  return <Text style={styles.sync}>{label}{pending ? " · " + pending + " queued" : ""}</Text>;
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return <View style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

const TAB_LABELS: Record<MobileTab, string> = {
  today: "Today", inbox: "Inbox", leads: "Leads", tasks: "Tasks", campaigns: "Campaigns",
  referrals: "Referrals", earnings: "Earnings", customers: "Customers", orders: "Orders",
  payments: "Payments", command: "Command", more: "More",
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: ICE }, center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: ICE, gap: 12 },
  loginContainer: { flexGrow: 1, justifyContent: "center", padding: 24 }, container: { padding: 20, paddingBottom: 100, gap: 16 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 10, paddingBottom: 8 }, topRight: { alignItems: "flex-end", gap: 6 },
  brand: { color: DEEP_BLUE, fontSize: 28, fontWeight: "900", letterSpacing: 2 }, brandSmall: { color: DEEP_BLUE, fontSize: 20, fontWeight: "900", letterSpacing: 2 },
  welcome: { color: SLATE, fontSize: 14, marginTop: 2 }, title: { color: SLATE, fontSize: 32, fontWeight: "800", marginTop: 10 }, subtitle: { color: "#64748B", fontSize: 16, lineHeight: 23, marginTop: 8, marginBottom: 28 },
  input: { backgroundColor: "white", borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 15, fontSize: 16, marginBottom: 12, color: SLATE },
  primaryButton: { backgroundColor: DEEP_BLUE, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16, alignItems: "center", marginTop: 4 }, primaryText: { color: "white", fontSize: 15, fontWeight: "800" },
  secondaryButton: { borderWidth: 1, borderColor: DEEP_BLUE, borderRadius: 14, paddingVertical: 13, alignItems: "center", marginTop: 12 }, secondaryText: { color: DEEP_BLUE, fontWeight: "800" },
  goldButton: { backgroundColor: GROWTH_GOLD, borderRadius: 14, paddingVertical: 13, alignItems: "center", marginTop: 8 }, goldText: { color: SLATE, fontWeight: "900" },
  link: { color: DEEP_BLUE, fontWeight: "700" }, sync: { color: "#64748B", fontSize: 11, fontWeight: "800" }, workspaceScroller: { flexGrow: 0 },
  workspaceChip: { borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9, marginRight: 8, backgroundColor: "white" }, workspaceChipActive: { backgroundColor: DEEP_BLUE, borderColor: DEEP_BLUE },
  workspaceChipText: { color: SLATE, fontWeight: "700" }, workspaceChipTextActive: { color: "white" }, hero: { backgroundColor: "#EAF1FF", borderRadius: 22, padding: 20, gap: 7 },
  heroTitle: { color: SLATE, fontSize: 24, fontWeight: "900" }, stack: { gap: 12 }, actionCard: { backgroundColor: DEEP_BLUE, borderRadius: 22, padding: 20, gap: 9 },
  card: { backgroundColor: "white", borderRadius: 20, padding: 18, borderWidth: 1, borderColor: "#E2E8F0", gap: 8 }, leadCard: { backgroundColor: "white", borderRadius: 18, padding: 16, borderWidth: 1, borderColor: "#E2E8F0", gap: 5 },
  sectionLabel: { color: GROWTH_GOLD, fontSize: 11, fontWeight: "900", letterSpacing: 1.4 }, cardTitle: { color: SLATE, fontSize: 20, fontWeight: "800" }, cardTitleSmall: { color: SLATE, fontSize: 15, fontWeight: "800" },
  cardTitleWhite: { color: "white", fontSize: 20, fontWeight: "800" }, body: { color: "#475569", lineHeight: 21 }, bodyWhite: { color: "#E2E8F0", lineHeight: 21 },
  divider: { height: 1, backgroundColor: "#E2E8F0", marginVertical: 8 }, row: { flexDirection: "row", gap: 12 }, metric: { flex: 1, backgroundColor: "white", borderRadius: 18, padding: 18, borderWidth: 1, borderColor: "#E2E8F0" },
  metricValue: { color: DEEP_BLUE, fontSize: 20, fontWeight: "900" }, metricLabel: { color: "#64748B", marginTop: 5, fontSize: 12 },
  info: { borderTopWidth: 1, borderTopColor: "#E2E8F0", paddingTop: 9, marginTop: 3 }, timelineRow: { flexDirection: "row", gap: 10, paddingVertical: 7 }, dot: { width: 9, height: 9, borderRadius: 9, backgroundColor: GROWTH_GOLD, marginTop: 6 }, taskRow: { borderTopWidth: 1, borderTopColor: "#E2E8F0", paddingVertical: 9 },
  leadTop: { flexDirection: "row", justifyContent: "space-between", gap: 8 }, stage: { color: DEEP_BLUE, fontWeight: "900", fontSize: 11 }, error: { color: "#B91C1C", backgroundColor: "#FEF2F2", borderRadius: 12, padding: 12 },
  muted: { color: "#64748B", lineHeight: 20 }, footer: { textAlign: "center", color: "#64748B", marginTop: 20, fontSize: 12 },
  bottomNav: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#E2E8F0", backgroundColor: "white", paddingVertical: 10, paddingHorizontal: 4 }, navItem: { flex: 1, alignItems: "center", paddingVertical: 8 },
  navLabel: { color: "#64748B", fontSize: 11, fontWeight: "700" }, navLabelActive: { color: DEEP_BLUE, fontWeight: "900" },
});

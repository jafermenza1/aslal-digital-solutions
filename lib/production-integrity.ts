import { prisma } from "@/lib/prisma";

type CountRow = { count: bigint };

export type ProductionIntegrityReport = {
  checkedAt: string;
  database: { reachable: boolean; tables: Record<string, boolean>; migration: { tablePresent: boolean; failed: number; latest: string | null } };
  leads: { active: number; missingOwner: number; missingNextAction: number; missingDueDate: number; executionGaps: number; overdue: number; wonMissingDealValue: number };
  tasks: { open: number; missingDueDate: number; unassigned: number; overdue: number };
  journey: { leadsWithoutVisitor: number; opportunitiesWithoutLead: number; wonLeadsWithoutCustomer: number; customersWithoutOpportunity: number };
  passed: boolean;
};

async function count(sql: TemplateStringsArray, ...values: unknown[]) {
  const rows = await prisma.$queryRaw<CountRow[]>(sql, ...values);
  return Number(rows[0]?.count ?? 0);
}

export async function getProductionIntegrityReport(): Promise<ProductionIntegrityReport> {
  const requiredTables = [
    "visitors","events","leads","lead_tasks","lead_stage_history",
    "opportunities","customers","persons","activities","growth_opportunities",
    "conversations","conversation_messages","communication_preferences"
  ];

  try {
    await prisma.$queryRaw`SELECT 1 AS ok`;
    const tableRows = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = DATABASE() AND table_name IN (${prisma.join(requiredTables)})
    `;
    const present = new Set(tableRows.map(row => row.table_name));
    const tables = Object.fromEntries(requiredTables.map(name => [name, present.has(name)]));
    const allCoreTablesPresent = Object.values(tables).every(Boolean);

    let migration = { tablePresent: false, failed: 0, latest: null as string | null };
    const migrationTable = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = DATABASE() AND table_name = "_prisma_migrations"
    `;
    if (migrationTable.length) {
      migration.tablePresent = true;
      const failedRows = await prisma.$queryRaw<CountRow[]>`
        SELECT COUNT(*) AS count FROM _prisma_migrations WHERE finished_at IS NULL AND rolled_back_at IS NULL
      `;
      migration.failed = Number(failedRows[0]?.count ?? 0);
      const latestRows = await prisma.$queryRaw<Array<{ migration_name: string | null }>>`
        SELECT migration_name FROM _prisma_migrations WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL
        ORDER BY finished_at DESC LIMIT 1
      `;
      migration.latest = latestRows[0]?.migration_name ?? null;
    }

    const [active, missingOwner, missingNextAction, missingDueDate, overdue, wonMissingDealValue,
      openTasks, taskMissingDueDate, taskUnassigned, taskOverdue, leadsWithoutVisitor,
      opportunitiesWithoutLead, wonLeadsWithoutCustomer, customersWithoutOpportunity] = await Promise.all([
      count`SELECT COUNT(*) AS count FROM leads WHERE status NOT IN ('WON','LOST')`,
      count`SELECT COUNT(*) AS count FROM leads WHERE status NOT IN ('WON','LOST') AND (owner_email IS NULL OR TRIM(owner_email)='')`,
      count`SELECT COUNT(*) AS count FROM leads WHERE status NOT IN ('WON','LOST') AND (next_action IS NULL OR TRIM(next_action)='')`,
      count`SELECT COUNT(*) AS count FROM leads WHERE status NOT IN ('WON','LOST') AND next_action_due_at IS NULL`,
      count`SELECT COUNT(*) AS count FROM leads WHERE status NOT IN ('WON','LOST') AND next_action_due_at IS NOT NULL AND next_action_due_at < NOW()`,
      count`SELECT COUNT(*) AS count FROM leads WHERE status='WON' AND (deal_value IS NULL OR deal_value <= 0)`,
      count`SELECT COUNT(*) AS count FROM lead_tasks WHERE status IN ('OPEN','IN_PROGRESS')`,
      count`SELECT COUNT(*) AS count FROM lead_tasks WHERE status IN ('OPEN','IN_PROGRESS') AND due_at IS NULL`,
      count`SELECT COUNT(*) AS count FROM lead_tasks WHERE status IN ('OPEN','IN_PROGRESS') AND (assigned_to IS NULL OR TRIM(assigned_to)='')`,
      count`SELECT COUNT(*) AS count FROM lead_tasks WHERE status IN ('OPEN','IN_PROGRESS') AND due_at IS NOT NULL AND due_at < NOW()`,
      count`SELECT COUNT(*) AS count FROM leads WHERE visitor_id IS NULL`,
      count`SELECT COUNT(*) AS count FROM opportunities o LEFT JOIN leads l ON l.id=o.lead_id WHERE l.id IS NULL`,
      count`SELECT COUNT(*) AS count FROM leads l LEFT JOIN opportunities o ON o.lead_id=l.id AND o.stage='WON' LEFT JOIN customers c ON c.opportunity_id=o.id WHERE l.status='WON' AND c.id IS NULL`,
      count`SELECT COUNT(*) AS count FROM customers c LEFT JOIN opportunities o ON o.id=c.opportunity_id WHERE o.id IS NULL`
    ]);

    const executionGaps = missingOwner + missingNextAction + missingDueDate;
    const passed = allCoreTablesPresent && migration.failed === 0 && executionGaps === 0 &&
      wonMissingDealValue === 0 && taskMissingDueDate === 0 && taskUnassigned === 0 &&
      opportunitiesWithoutLead === 0 && wonLeadsWithoutCustomer === 0 && customersWithoutOpportunity === 0;

    return {
      checkedAt: new Date().toISOString(),
      database: { reachable: true, tables, migration },
      leads: { active, missingOwner, missingNextAction, missingDueDate, executionGaps, overdue, wonMissingDealValue },
      tasks: { open: openTasks, missingDueDate: taskMissingDueDate, unassigned: taskUnassigned, overdue: taskOverdue },
      journey: { leadsWithoutVisitor, opportunitiesWithoutLead, wonLeadsWithoutCustomer, customersWithoutOpportunity },
      passed,
    };
  } catch (error) {
    console.error("Production integrity check failed:", error);
    return {
      checkedAt: new Date().toISOString(),
      database: { reachable: false, tables: {}, migration: { tablePresent: false, failed: -1, latest: null } },
      leads: { active: 0, missingOwner: 0, missingNextAction: 0, missingDueDate: 0, executionGaps: 0, overdue: 0, wonMissingDealValue: 0 },
      tasks: { open: 0, missingDueDate: 0, unassigned: 0, overdue: 0 },
      journey: { leadsWithoutVisitor: 0, opportunitiesWithoutLead: 0, wonLeadsWithoutCustomer: 0, customersWithoutOpportunity: 0 },
      passed: false,
    };
  }
}

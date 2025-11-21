import { createClient } from '@libsql/client/web';

const DATABASE_URL = 'libsql://secretsanta-xgazdik.aws-eu-west-1.turso.io';
const TABLE_NAME = 'secret_santa_link_visits';

export interface LinkSeed {
  sessionId: string;
  linkId: string;
  giverName: string;
  receiverName: string;
}

export interface LinkVisit {
  sessionId: string;
  linkId: string;
  giverName: string;
  receiverName: string;
  createdAt: string | null;
  visitCount: number;
  lastVisitedAt: string | null;
}

type LibsqlClient = ReturnType<typeof createClient>;

function createTrackingClient(authToken: string): LibsqlClient {
  return createClient({
    url: DATABASE_URL,
    authToken,
  });
}

async function ensureTable(client: LibsqlClient) {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
      link_id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      giver_name TEXT NOT NULL,
      receiver_name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
      visit_count INTEGER NOT NULL DEFAULT 0,
      last_visited_at TEXT
    )
  `);
}

export async function registerSessionLinks(authToken: string, links: LinkSeed[]) {
  if (!authToken || links.length === 0) {
    return;
  }

  const client = createTrackingClient(authToken);
  await ensureTable(client);

  const insertSql = `
    INSERT INTO ${TABLE_NAME} (session_id, link_id, giver_name, receiver_name)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(link_id) DO UPDATE SET
      session_id = excluded.session_id,
      giver_name = excluded.giver_name,
      receiver_name = excluded.receiver_name
  `;

  await Promise.all(links.map(link => {
    return client.execute({
      sql: insertSql,
      args: [link.sessionId, link.linkId, link.giverName, link.receiverName],
    });
  }));
}

export async function recordLinkVisit(authToken: string, link: LinkSeed) {
  if (!authToken) {
    return;
  }

  const client = createTrackingClient(authToken);
  await ensureTable(client);

  const upsertVisitSql = `
    INSERT INTO ${TABLE_NAME} (session_id, link_id, giver_name, receiver_name, visit_count, last_visited_at)
    VALUES (?, ?, ?, ?, 1, strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
    ON CONFLICT(link_id) DO UPDATE SET
      session_id = excluded.session_id,
      giver_name = excluded.giver_name,
      receiver_name = excluded.receiver_name,
      visit_count = ${TABLE_NAME}.visit_count + 1,
      last_visited_at = excluded.last_visited_at
  `;

  await client.execute({
    sql: upsertVisitSql,
    args: [link.sessionId, link.linkId, link.giverName, link.receiverName],
  });
}

export async function fetchSessionLinks(authToken: string, sessionId: string): Promise<LinkVisit[]> {
  if (!authToken || !sessionId) {
    return [];
  }

  const client = createTrackingClient(authToken);
  await ensureTable(client);

  const result = await client.execute({
    sql: `
      SELECT session_id, link_id, giver_name, receiver_name, created_at, visit_count, last_visited_at
      FROM ${TABLE_NAME}
      WHERE session_id = ?
      ORDER BY giver_name
    `,
    args: [sessionId],
  });

  return result.rows.map((row: Record<string, unknown>) => ({
    sessionId: row.session_id as string,
    linkId: row.link_id as string,
    giverName: row.giver_name as string,
    receiverName: row.receiver_name as string,
    createdAt: (row.created_at as string) ?? null,
    visitCount: Number(row.visit_count ?? 0),
    lastVisitedAt: (row.last_visited_at as string) ?? null,
  }));
}

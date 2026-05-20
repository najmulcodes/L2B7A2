import pool from '../../config/db';
import { Issue, IssueWithReporter, ReporterPublic } from '../../types';

export const createIssue = async (
  title: string,
  description: string,
  type: 'bug' | 'feature_request',
  reporter_id: number
): Promise<Issue> => {
  const result = await pool.query<Issue>(
    `INSERT INTO issues (title, description, type, reporter_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [title, description, type, reporter_id]
  );
  return result.rows[0];
};

export const fetchReportersByIds = async (
  ids: number[]
): Promise<Map<number, ReporterPublic>> => {
  if (ids.length === 0) return new Map();

  const placeholders = ids.map((_: number, i: number) => `$${i + 1}`).join(', ');
  const result = await pool.query<ReporterPublic & { id: number }>(
    `SELECT id, name, role FROM users WHERE id IN (${placeholders})`,
    ids
  );

  const map = new Map<number, ReporterPublic>();
  result.rows.forEach((u: ReporterPublic & { id: number }) => map.set(u.id, u));
  return map;
};

export const getAllIssues = async (
  sort: string,
  type?: string,
  status?: string
): Promise<IssueWithReporter[]> => {
  const conditions: string[] = [];
  const values: (string | number)[] = [];
  let paramIndex = 1;

  if (type) {
    conditions.push(`type = $${paramIndex++}`);
    values.push(type);
  }

  if (status) {
    conditions.push(`status = $${paramIndex++}`);
    values.push(status);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderClause = sort === 'oldest' ? 'ORDER BY created_at ASC' : 'ORDER BY created_at DESC';

  const result = await pool.query<Issue>(
    `SELECT * FROM issues ${whereClause} ${orderClause}`,
    values
  );

  const issues = result.rows;
  if (issues.length === 0) return [];

  const reporterIds: number[] = [...new Set(issues.map((i: Issue) => i.reporter_id))];
  const reporterMap = await fetchReportersByIds(reporterIds);

  return issues.map((issue: Issue) => {
    const { reporter_id, ...rest } = issue;
    return {
      ...rest,
      reporter: reporterMap.get(reporter_id) || { id: reporter_id, name: 'Unknown', role: 'contributor' as const },
    };
  });
};

export const getRawIssueById = async (id: number): Promise<Issue | null> => {
  const result = await pool.query<Issue>('SELECT * FROM issues WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const updateIssue = async (
  id: number,
  fields: { title?: string; description?: string; type?: string }
): Promise<Issue> => {
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (fields.title !== undefined) {
    updates.push(`title = $${paramIndex++}`);
    values.push(fields.title);
  }
  if (fields.description !== undefined) {
    updates.push(`description = $${paramIndex++}`);
    values.push(fields.description);
  }
  if (fields.type !== undefined) {
    updates.push(`type = $${paramIndex++}`);
    values.push(fields.type);
  }

  updates.push(`updated_at = NOW()`);
  values.push(id);

  const result = await pool.query<Issue>(
    `UPDATE issues SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  return result.rows[0];
};

export const deleteIssueById = async (id: number): Promise<void> => {
  await pool.query('DELETE FROM issues WHERE id = $1', [id]);
};
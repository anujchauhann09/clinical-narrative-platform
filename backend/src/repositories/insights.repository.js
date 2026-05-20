import { Prisma } from '@prisma/client';

import { prisma } from '../database/prisma.js';

const MIN_PAIR_SUPPORT = 3;
const MIN_ITEM_SUPPORT = 3;
const TOP_LIMIT = 5;
const CORRELATION_LIMIT = 8;
const TREND_WINDOW_DAYS = 7;

const toNumber = (value) => (value === null || value === undefined ? null : Number(value));

export const insightsRepository = {
  async correlations(userPublicId) {
    const rows = await prisma.$queryRaw(Prisma.sql`
      WITH user_entries AS (
        SELECT e.id
        FROM symptom_entries e
        JOIN users u ON u.id = e.user_id
        WHERE u.public_id = ${userPublicId}::uuid
      ),
      trigger_counts AS (
        SELECT t.id, t.public_id, t.name, COUNT(DISTINCT ue.id)::int AS total
        FROM user_entries ue
        JOIN entry_triggers et ON et.entry_id = ue.id
        JOIN triggers t ON t.id = et.trigger_id
        GROUP BY t.id, t.public_id, t.name
      ),
      symptom_counts AS (
        SELECT s.id, s.public_id, s.name, COUNT(DISTINCT ue.id)::int AS total
        FROM user_entries ue
        JOIN entry_symptoms es ON es.entry_id = ue.id
        JOIN symptoms s ON s.id = es.symptom_id
        GROUP BY s.id, s.public_id, s.name
      ),
      pairs AS (
        SELECT
          es.symptom_id,
          et.trigger_id,
          COUNT(DISTINCT ue.id)::int AS co_occurrences
        FROM user_entries ue
        JOIN entry_symptoms es ON es.entry_id = ue.id
        JOIN entry_triggers et ON et.entry_id = ue.id
        GROUP BY es.symptom_id, et.trigger_id
      )
      SELECT
        sc.public_id::text AS symptom_public_id,
        sc.name             AS symptom_name,
        tc.public_id::text  AS trigger_public_id,
        tc.name             AS trigger_name,
        p.co_occurrences,
        sc.total            AS symptom_total,
        tc.total            AS trigger_total,
        (p.co_occurrences::float / NULLIF(tc.total, 0)) AS symptom_given_trigger,
        (p.co_occurrences::float / NULLIF(sc.total, 0)) AS trigger_given_symptom
      FROM pairs p
      JOIN symptom_counts sc ON sc.id = p.symptom_id
      JOIN trigger_counts tc ON tc.id = p.trigger_id
      WHERE p.co_occurrences >= ${MIN_PAIR_SUPPORT}
      ORDER BY GREATEST(
        p.co_occurrences::float / NULLIF(tc.total, 0),
        p.co_occurrences::float / NULLIF(sc.total, 0)
      ) DESC NULLS LAST,
      p.co_occurrences DESC
      LIMIT ${CORRELATION_LIMIT}
    `);

    return rows.map((row) => ({
      symptom: { publicId: row.symptom_public_id, name: row.symptom_name },
      trigger: { publicId: row.trigger_public_id, name: row.trigger_name },
      coOccurrences: toNumber(row.co_occurrences),
      symptomTotal: toNumber(row.symptom_total),
      triggerTotal: toNumber(row.trigger_total),
      symptomGivenTrigger: toNumber(row.symptom_given_trigger),
      triggerGivenSymptom: toNumber(row.trigger_given_symptom),
    }));
  },

  async severityTrend(userPublicId, windowDays = TREND_WINDOW_DAYS) {
    const rows = await prisma.$queryRaw(Prisma.sql`
      WITH user_entries AS (
        SELECT e.severity, e.logged_at
        FROM symptom_entries e
        JOIN users u ON u.id = e.user_id
        WHERE u.public_id = ${userPublicId}::uuid
      )
      SELECT
        COUNT(*) FILTER (
          WHERE logged_at >= NOW() - (${windowDays} || ' days')::interval
        )::int AS current_count,
        AVG(severity) FILTER (
          WHERE logged_at >= NOW() - (${windowDays} || ' days')::interval
        )::float AS current_avg,
        COUNT(*) FILTER (
          WHERE logged_at >= NOW() - (${windowDays * 2} || ' days')::interval
            AND logged_at <  NOW() - (${windowDays} || ' days')::interval
        )::int AS prior_count,
        AVG(severity) FILTER (
          WHERE logged_at >= NOW() - (${windowDays * 2} || ' days')::interval
            AND logged_at <  NOW() - (${windowDays} || ' days')::interval
        )::float AS prior_avg
      FROM user_entries
    `);

    const row = rows[0] ?? {};
    return {
      windowDays,
      current: {
        count: toNumber(row.current_count) ?? 0,
        average: toNumber(row.current_avg),
      },
      prior: {
        count: toNumber(row.prior_count) ?? 0,
        average: toNumber(row.prior_avg),
      },
    };
  },

  async topSymptoms(userPublicId) {
    const rows = await prisma.$queryRaw(Prisma.sql`
      SELECT
        s.public_id::text AS public_id,
        s.name,
        s.category,
        COUNT(DISTINCT e.id)::int AS count,
        AVG(e.severity)::float    AS average_severity
      FROM symptom_entries e
      JOIN users u ON u.id = e.user_id
      JOIN entry_symptoms es ON es.entry_id = e.id
      JOIN symptoms s ON s.id = es.symptom_id
      WHERE u.public_id = ${userPublicId}::uuid
      GROUP BY s.id, s.public_id, s.name, s.category
      HAVING COUNT(DISTINCT e.id) >= ${MIN_ITEM_SUPPORT}
      ORDER BY count DESC, average_severity DESC
      LIMIT ${TOP_LIMIT}
    `);

    return rows.map((row) => ({
      publicId: row.public_id,
      name: row.name,
      category: row.category,
      count: toNumber(row.count),
      averageSeverity: toNumber(row.average_severity),
    }));
  },

  async topTriggers(userPublicId) {
    const rows = await prisma.$queryRaw(Prisma.sql`
      SELECT
        t.public_id::text AS public_id,
        t.name,
        COUNT(DISTINCT e.id)::int AS count,
        AVG(e.severity)::float    AS average_severity
      FROM symptom_entries e
      JOIN users u ON u.id = e.user_id
      JOIN entry_triggers et ON et.entry_id = e.id
      JOIN triggers t ON t.id = et.trigger_id
      WHERE u.public_id = ${userPublicId}::uuid
      GROUP BY t.id, t.public_id, t.name
      HAVING COUNT(DISTINCT e.id) >= ${MIN_ITEM_SUPPORT}
      ORDER BY count DESC, average_severity DESC
      LIMIT ${TOP_LIMIT}
    `);

    return rows.map((row) => ({
      publicId: row.public_id,
      name: row.name,
      count: toNumber(row.count),
      averageSeverity: toNumber(row.average_severity),
    }));
  },

  async dayOfWeekPattern(userPublicId) {
    const rows = await prisma.$queryRaw(Prisma.sql`
      SELECT
        EXTRACT(DOW FROM logged_at)::int AS day_of_week,
        COUNT(*)::int                    AS count,
        AVG(severity)::float             AS average_severity
      FROM symptom_entries e
      JOIN users u ON u.id = e.user_id
      WHERE u.public_id = ${userPublicId}::uuid
      GROUP BY day_of_week
      ORDER BY day_of_week
    `);

    return rows.map((row) => ({
      dayOfWeek: toNumber(row.day_of_week),
      count: toNumber(row.count),
      averageSeverity: toNumber(row.average_severity),
    }));
  },

  async totalEntries(userPublicId) {
    const rows = await prisma.$queryRaw(Prisma.sql`
      SELECT COUNT(*)::int AS total
      FROM symptom_entries e
      JOIN users u ON u.id = e.user_id
      WHERE u.public_id = ${userPublicId}::uuid
    `);
    return toNumber(rows[0]?.total) ?? 0;
  },
};

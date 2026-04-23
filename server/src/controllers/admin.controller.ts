import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";

export async function adminSummary(_req: Request, res: Response) {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const [
    totalIssues,
    pending,
    inProgress,
    resolved,
    rejected,
    critical,
    today,
    avgResolutionAgg
  ] = await Promise.all([
    prisma.issue.count(),
    prisma.issue.count({ where: { status: "pending" } }),
    prisma.issue.count({ where: { status: "in_progress" } }),
    prisma.issue.count({ where: { status: "resolved" } }),
    prisma.issue.count({ where: { status: "rejected" } }),
    prisma.issue.count({ where: { severity: "critical", status: { not: "resolved" } } }),
    prisma.issue.count({ where: { createdAt: { gte: startOfDay } } }),
    prisma.issue
      .findMany({
        where: { status: "resolved", resolvedAt: { not: null } },
        select: { createdAt: true, resolvedAt: true }
      })
      .then((rows) => {
        if (rows.length === 0) return null;
        const avgMs =
          rows.reduce((acc, r) => acc + ((r.resolvedAt?.getTime() ?? r.createdAt.getTime()) - r.createdAt.getTime()), 0) /
          rows.length;
        return [{ avgMs }];
      })
  ]);

  const avgResolutionMs = avgResolutionAgg?.[0]?.avgMs ?? null;
  return res.json({
    ok: true,
    cards: {
      totalIssues,
      pending,
      inProgress,
      resolved,
      rejected,
      highPriority: critical,
      newToday: today,
      avgResolutionMs
    }
  });
}

export async function adminTrends(_req: Request, res: Response) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const rawData = await prisma.issue.findMany({
    where: {
      OR: [
        { createdAt: { gte: thirtyDaysAgo } },
        { resolvedAt: { gte: thirtyDaysAgo } }
      ]
    },
    select: { createdAt: true, resolvedAt: true }
  });

  const dailyMap = new Map<string, { reported: number; resolved: number }>();
  
  // Initialize map with last 30 days
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    dailyMap.set(key, { reported: 0, resolved: 0 });
  }

  for (const r of rawData) {
    const createdKey = r.createdAt.toISOString().split("T")[0];
    if (dailyMap.has(createdKey)) {
      dailyMap.get(createdKey)!.reported++;
    }
    if (r.resolvedAt) {
      const resolvedKey = r.resolvedAt.toISOString().split("T")[0];
      if (dailyMap.has(resolvedKey)) {
        dailyMap.get(resolvedKey)!.resolved++;
      }
    }
  }

  const dailyStats = Array.from(dailyMap.entries())
    .map(([date, stats]) => ({ date, ...stats }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const byCategory = await prisma.issue.groupBy({
    by: ["category"],
    _count: { category: true },
    orderBy: { _count: { category: "desc" } }
  });

  const byStatus = await prisma.issue.groupBy({
    by: ["status"],
    _count: { status: true },
    orderBy: { _count: { status: "desc" } }
  });

  const byMonthRaw = await prisma.issue.findMany({
    select: { createdAt: true }
  });
  const byMonthMap = new Map<string, number>();
  for (const r of byMonthRaw) {
    const y = r.createdAt.getFullYear();
    const m = r.createdAt.getMonth() + 1;
    const key = `${y}-${String(m).padStart(2, "0")}`;
    byMonthMap.set(key, (byMonthMap.get(key) || 0) + 1);
  }
  const byMonth = Array.from(byMonthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([k, count]) => {
      const [y, m] = k.split("-").map(Number);
      return { _id: { y, m }, count };
    });

  return res.json({
    ok: true,
    dailyStats,
    byMonth,
    byCategory: byCategory.map((x) => ({ _id: x.category, count: x._count.category })),
    byStatus: byStatus.map((x) => ({ _id: x.status, count: x._count.status }))
  });
}

export async function adminUsers(req: Request, res: Response) {
  const page = z.coerce.number().default(1).parse(req.query.page);
  const limit = Math.min(50, z.coerce.number().default(20).parse(req.query.limit));
  const q = z.string().optional().parse(req.query.q);

  const where: any = {};
  if (q) {
    where.OR = [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }];
  }

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: { id: true, name: true, email: true, role: true, isBlocked: true, createdAt: true }
    }),
    prisma.user.count({ where })
  ]);
  return res.json({ ok: true, items, total, page, limit });
}

export async function adminBlockUser(req: Request, res: Response) {
  const id = z.string().min(1).parse(req.params.id);
  const body = z.object({ isBlocked: z.boolean() }).parse(req.body);
  const user = await prisma.user.update({
    where: { id },
    data: { isBlocked: body.isBlocked },
    select: { id: true, name: true, email: true, role: true, isBlocked: true, createdAt: true }
  });
  return res.json({ ok: true, user });
}


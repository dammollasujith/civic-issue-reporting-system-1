import type { Request, Response } from "express";
import { z } from "zod";
import { HttpError } from "../utils/httpError.js";
import { persistUpload } from "../services/uploads.js";
import { emitToUser } from "../services/socket.js";
import { prisma } from "../config/prisma.js";

import { awardPoints } from "../services/gamification.js";

const createSchema = z.object({
  title: z.string().min(4).max(120),
  description: z.string().min(5).max(5000),
  category: z.enum([
    "roads",
    "garbage",
    "water_leakage",
    "drainage",
    "streetlight",
    "traffic_signal",
    "illegal_parking",
    "sanitation",
    "public_safety",
    "others"
  ]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  address: z.string().optional(),
  landmark: z.string().optional(),
  ward: z.string().optional(),
  isAnonymous: z.coerce.boolean().optional().default(false)
});

export async function createIssue(req: Request, res: Response) {
  if (!req.auth) throw new HttpError(401, "Unauthorized");
  const body = createSchema.parse(req.body);

  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  const media: Array<{ url: string; publicId?: string; kind: "image" | "video" }> = [];
  for (const f of files) media.push(await persistUpload(f));

  const issue = await prisma.issue.create({
    data: {
      title: body.title,
      description: body.description,
      category: body.category,
      severity: body.severity,
      isAnonymous: body.isAnonymous,
      latitude: body.latitude,
      longitude: body.longitude,
      address: body.address,
      landmark: body.landmark,
      ward: body.ward,
      media: media as any,
      createdById: req.auth.userId
    }
  });

  // Award gamification points
  await awardPoints(req.auth.userId, "complaint_submitted");

  const notif = await prisma.notification.create({
    data: {
      userId: issue.createdById,
      title: "Complaint submitted",
      message: `Your complaint "${issue.title}" has been received.`,
      kind: "issue_created",
      meta: { issueId: issue.id } as any
    }
  });
  emitToUser(req.auth.userId, "notification", notif);

  return res.json({ ok: true, issue });
}

export async function listIssues(req: Request, res: Response) {
  const page = z.coerce.number().default(1).parse(req.query.page);
  const limit = Math.min(50, z.coerce.number().default(20).parse(req.query.limit));
  const status = z
    .enum(["pending", "reviewed", "assigned", "in_progress", "resolved", "rejected"])
    .optional()
    .parse(req.query.status);
  const category = z
    .enum([
      "roads",
      "garbage",
      "water_leakage",
      "drainage",
      "streetlight",
      "traffic_signal",
      "illegal_parking",
      "sanitation",
      "public_safety",
      "others"
    ])
    .optional()
    .parse(req.query.category);
  const q = z.string().optional().parse(req.query.q);

  const where: any = {};
  if (status) where.status = status;
  if (category) where.category = category;
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } }
    ];
  }

  const [items, total] = await Promise.all([
    prisma.issue.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { upvoteCount: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        category: true,
        severity: true,
        status: true,
        latitude: true,
        longitude: true,
        address: true,
        upvoteCount: true,
        createdAt: true,
        media: true,
        ward: true
      }
    }),
    prisma.issue.count({ where })
  ]);

  const mapped = items.map((it) => ({
    _id: it.id,
    title: it.title,
    category: it.category,
    severity: it.severity,
    status: it.status,
    location: { coordinates: [it.longitude, it.latitude] as [number, number] },
    address: it.address,
    upvoteCount: it.upvoteCount,
    createdAt: it.createdAt,
    media: it.media,
    ward: it.ward
  }));

  return res.json({ ok: true, items: mapped, page, limit, total });
}

export async function myIssues(req: Request, res: Response) {
  if (!req.auth) throw new HttpError(401, "Unauthorized");
  const page = z.coerce.number().default(1).parse(req.query.page);
  const limit = Math.min(50, z.coerce.number().default(20).parse(req.query.limit));

  const [items, total] = await Promise.all([
    prisma.issue.findMany({
      where: { createdById: req.auth.userId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.issue.count({ where: { createdById: req.auth.userId } })
  ]);

  return res.json({
    ok: true,
    items: items.map((it) => ({ ...it, _id: it.id })),
    page,
    limit,
    total
  });
}

export async function getIssue(req: Request, res: Response) {
  const id = z.string().min(1).parse(req.params.id);
  const issue = await prisma.issue.findUnique({
    where: { id },
    include: { createdBy: { select: { id: true, name: true, email: true, role: true } } }
  });
  if (!issue) throw new HttpError(404, "Issue not found");
  return res.json({ ok: true, issue: { ...issue, _id: issue.id } });
}

export async function upvoteIssue(req: Request, res: Response) {
  if (!req.auth) throw new HttpError(401, "Unauthorized");
  const id = z.string().min(1).parse(req.params.id);
  const issue = await prisma.issue.findUnique({ where: { id }, select: { id: true, upvoteCount: true, createdById: true } });
  if (!issue) throw new HttpError(404, "Issue not found");

  try {
    await prisma.issueUpvote.create({ data: { issueId: id, userId: req.auth.userId } });
  } catch {
    throw new HttpError(409, "Already upvoted");
  }

  const updated = await prisma.issue.update({
    where: { id },
    data: { upvoteCount: { increment: 1 } },
    select: { upvoteCount: true }
  });

  // Award points to the creator of the issue 
  await awardPoints(issue.createdById, "upvote_received");

  return res.json({ ok: true, upvoteCount: updated.upvoteCount });
}

const statusSchema = z.object({
  status: z.enum(["pending", "reviewed", "assigned", "in_progress", "resolved", "rejected"]),
  adminNotes: z.string().optional(),
  assignedDepartment: z.enum(["roads", "water", "sanitation", "electrical", "traffic", "other"]).optional(),
  assignedStaffName: z.string().optional(),
  expectedCompletionDate: z.coerce.date().optional()
});

export async function adminUpdateIssue(req: Request, res: Response) {
  const id = z.string().min(1).parse(req.params.id);
  const body = statusSchema.parse(req.body);

  const issue = await prisma.issue.findUnique({ where: { id } });
  if (!issue) throw new HttpError(404, "Issue not found");

  const updatedIssue = await prisma.issue.update({
    where: { id },
    data: {
      status: body.status,
      adminNotes: body.adminNotes ?? undefined,
      assignedDepartment: body.assignedDepartment ?? undefined,
      assignedStaffName: body.assignedStaffName ?? undefined,
      expectedCompletionDate: body.expectedCompletionDate ?? undefined,
      resolvedAt: body.status === "resolved" ? new Date() : undefined
    }
  });

  // Award points for status milestones
  if (body.status === "resolved" && issue.status !== "resolved") {
    await awardPoints(issue.createdById, "issue_resolved");
  } else if (body.status === "reviewed" && issue.status === "pending") {
    await awardPoints(issue.createdById, "complaint_verified");
  }

  const notif = await prisma.notification.create({
    data: {
      userId: updatedIssue.createdById,
      title: "Status updated",
      message: `Your complaint "${updatedIssue.title}" is now ${updatedIssue.status.replaceAll("_", " ")}.`,
      kind: "status_changed",
      meta: { issueId: updatedIssue.id, status: updatedIssue.status } as any
    }
  });
  emitToUser(updatedIssue.createdById, "notification", notif);

  return res.json({ ok: true, issue: { ...updatedIssue, _id: updatedIssue.id } });
}


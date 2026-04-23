import type { Request, Response } from "express";
import { z } from "zod";
import { HttpError } from "../utils/httpError.js";
import { prisma } from "../config/prisma.js";

export async function getMyProfile(req: Request, res: Response) {
  if (!req.auth) throw new HttpError(401, "Unauthorized");
  const user = await prisma.user.findUnique({
    where: { id: req.auth.userId },
    select: { id: true, name: true, email: true, phone: true, address: true, avatarUrl: true, role: true, isBlocked: true }
  });
  if (!user) throw new HttpError(404, "User not found");
  if (user.isBlocked) throw new HttpError(403, "Account blocked");
  return res.json({ ok: true, user });
}

const updateSchema = z.object({
  name: z.string().min(2).max(80).optional().or(z.literal("")),
  phone: z.string().min(5).max(30).optional().or(z.literal("")),
  address: z.string().min(3).max(200).optional().or(z.literal("")),
  avatarUrl: z.string().url().optional().or(z.literal(""))
});

export async function updateMyProfile(req: Request, res: Response) {
  if (!req.auth) throw new HttpError(401, "Unauthorized");
  const body = updateSchema.parse(req.body);
  const user = await prisma.user.update({
    where: { id: req.auth.userId },
    data: body,
    select: { id: true, name: true, email: true, phone: true, address: true, avatarUrl: true, role: true, isBlocked: true }
  });
  if (!user) throw new HttpError(404, "User not found");
  if (user.isBlocked) throw new HttpError(403, "Account blocked");
  return res.json({ ok: true, user });
}
import { getCitizenProfile } from "../services/gamification.js";

export async function getGamificationStats(req: Request, res: Response) {
  if (!req.auth) throw new HttpError(401, "Unauthorized");
  const stats = await getCitizenProfile(req.auth.userId);
  return res.json({ ok: true, stats });
}

import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getMyProfile, updateMyProfile, getGamificationStats } from "../controllers/users.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const usersRouter = Router();

usersRouter.get("/me", requireAuth, asyncHandler(getMyProfile));
usersRouter.patch("/me", requireAuth, asyncHandler(updateMyProfile));
usersRouter.get("/gamification", requireAuth, asyncHandler(getGamificationStats));


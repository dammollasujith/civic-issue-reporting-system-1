import { prisma } from "../config/prisma.js";
import { POINTS_RULES, BADGE_LEVELS } from "../services/gamification.js";

async function backfill() {
  console.log("Starting points backfill...");

  // Seed badges first
  for (const b of BADGE_LEVELS) {
    await prisma.badge.upsert({
      where: { name: b.name },
      update: { minPoints: b.min, maxPoints: b.max === Infinity ? 999999 : b.max, icon: b.icon, color: b.color },
      create: { name: b.name, minPoints: b.min, maxPoints: b.max === Infinity ? 999999 : b.max, icon: b.icon, color: b.color }
    });
  }

  const users = await prisma.user.findMany({
    include: {
      issues: true,
      _count: {
        select: {
          upvotes: true, // these are upvotes THE USER GAVE, we need upvotes RECEIVED
        }
      }
    }
  });

  for (const user of users) {
    // 1. Points for submitting complaints
    const complaintsCount = user.issues.length;
    const submissionPoints = complaintsCount * POINTS_RULES.complaint_submitted;

    // 2. Points for resolved issues
    const resolvedCount = user.issues.filter(i => i.status === "resolved").length;
    const resolutionPoints = resolvedCount * POINTS_RULES.issue_resolved;

    // 3. Points for verified issues (anything not pending)
    const verifiedCount = user.issues.filter(i => i.status !== "pending" && i.status !== "rejected").length;
    const verificationPoints = verifiedCount * POINTS_RULES.complaint_verified;

    // 4. Points for upvotes received
    const issuesWithUpvotes = await prisma.issue.findMany({
      where: { createdById: user.id },
      select: { upvoteCount: true }
    });
    const totalUpvotesReceived = issuesWithUpvotes.reduce((acc, curr) => acc + curr.upvoteCount, 0);
    const upvotePoints = totalUpvotesReceived * POINTS_RULES.upvote_received;

    const totalPoints = submissionPoints + resolutionPoints + verificationPoints + upvotePoints;

    console.log(`User ${user.email}: ${totalPoints} points (${complaintsCount} issues, ${totalUpvotesReceived} upvotes received)`);

    // Update stats
    await prisma.userStats.upsert({
      where: { userId: user.id },
      update: {
        totalPoints,
        monthlyPoints: totalPoints, // Simplified for backfill
        complaintsCount,
        upvotesReceived: totalUpvotesReceived,
      },
      create: {
        userId: user.id,
        totalPoints,
        monthlyPoints: totalPoints,
        complaintsCount,
        upvotesReceived: totalUpvotesReceived,
      }
    });

    // Award badges
    const badge = BADGE_LEVELS.find(b => totalPoints >= b.min && totalPoints <= b.max);
    if (badge) {
      const badgeRecord = await prisma.badge.findUnique({ where: { name: badge.name } });
      if (badgeRecord) {
        await prisma.userBadge.upsert({
          where: { userId_badgeId: { userId: user.id, badgeId: badgeRecord.id } },
          update: {},
          create: { userId: user.id, badgeId: badgeRecord.id }
        });
      }
    }
  }

  console.log("Backfill completed.");
}

backfill().catch(console.error).finally(() => prisma.$disconnect());

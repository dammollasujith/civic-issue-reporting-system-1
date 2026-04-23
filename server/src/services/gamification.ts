import { prisma } from "../config/prisma.js";

export const POINTS_RULES = {
  complaint_submitted: 10,
  complaint_verified: 5,
  upvote_received: 3,
  comment_added: 2,
  issue_resolved: 5,
};

export const BADGE_LEVELS = [
  { name: "Beginner", min: 0, max: 50, icon: "Leaf", color: "#22c55e" },
  { name: "Active Citizen", min: 51, max: 150, icon: "Zap", color: "#3b82f6" },
  { name: "Top Contributor", min: 151, max: 300, icon: "Star", color: "#f59e0b" },
  { name: "City Hero", min: 301, max: Infinity, icon: "Shield", color: "#ef4444" },
];

export async function awardPoints(userId: string, action: keyof typeof POINTS_RULES) {
  const points = POINTS_RULES[action];

  return await prisma.$transaction(async (tx) => {
    // Record history
    await tx.pointsHistory.create({
      data: {
        userId,
        action,
        points,
      },
    });

    // Update stats
    const stats = await tx.userStats.upsert({
      where: { userId },
      update: {
        totalPoints: { increment: points },
        monthlyPoints: { increment: points },
        complaintsCount: action === "complaint_submitted" ? { increment: 1 } : undefined,
        upvotesReceived: action === "upvote_received" ? { increment: 1 } : undefined,
        commentsCount: action === "comment_added" ? { increment: 1 } : undefined,
      },
      create: {
        userId,
        totalPoints: points,
        monthlyPoints: points,
        complaintsCount: action === "complaint_submitted" ? 1 : 0,
        upvotesReceived: action === "upvote_received" ? 1 : 0,
        commentsCount: action === "comment_added" ? 1 : 0,
      },
    });

    // Check for new badges
    const badge = BADGE_LEVELS.find(b => stats.totalPoints >= b.min && stats.totalPoints <= b.max);
    if (badge) {
      // Find or create badge in DB
      let badgeRecord = await tx.badge.findUnique({ where: { name: badge.name } });
      if (!badgeRecord) {
        badgeRecord = await tx.badge.create({
          data: {
            name: badge.name,
            minPoints: badge.min,
            maxPoints: badge.max === Infinity ? 999999 : badge.max,
            icon: badge.icon,
            color: badge.color,
          }
        });
      }

      await tx.userBadge.upsert({
        where: { userId_badgeId: { userId, badgeId: badgeRecord.id } },
        update: {},
        create: { userId, badgeId: badgeRecord.id },
      });
    }

    return stats;
  });
}

export async function getCitizenProfile(userId: string) {
  const stats = await prisma.userStats.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          avatarUrl: true,
          address: true,
          createdAt: true,
        }
      }
    }
  });

  const [badges, recentIssues, topLeaders, totalCount, resolvedCount] = await Promise.all([
    prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { badge: { minPoints: "desc" } }
    }),
    prisma.issue.findMany({
      where: { createdById: userId },
      orderBy: { createdAt: "desc" },
      take: 5
    }),
    prisma.userStats.findMany({
      orderBy: { totalPoints: "desc" },
      take: 3,
      include: { user: { select: { name: true, avatarUrl: true } } }
    }),
    prisma.issue.count({ where: { createdById: userId } }),
    prisma.issue.count({ where: { createdById: userId, status: "resolved" } })
  ]);

  const currentBadge = badges[0]?.badge || BADGE_LEVELS[0];
  const nextBadge = BADGE_LEVELS.find(b => b.min > (stats?.totalPoints || 0));

  return {
    ...stats,
    currentBadge,
    nextBadge,
    badgesEarned: badges.map(b => b.badge),
    recentIssues,
    topLeaders,
    statsOverview: {
      totalIssues: totalCount,
      resolvedIssues: resolvedCount,
      successRate: totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0,
    }
  };
}

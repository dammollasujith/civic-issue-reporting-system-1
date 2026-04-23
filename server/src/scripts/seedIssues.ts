import { prisma } from "../config/prisma.js";

async function seed() {
  let citizen = await prisma.user.findFirst({ where: { role: "citizen" } });
  if (!citizen) {
    citizen = await prisma.user.create({
      data: {
        name: "Test Citizen",
        email: "citizen@test.local",
        passwordHash: "dummy",
        role: "citizen"
      }
    });
    console.log("Created test citizen.");
  }

  const issues = [
    {
      title: "Pothole on Main St",
      description: "Large pothole causing traffic issues.",
      category: "roads",
      ward: "Ward 1",
      severity: "high",
      status: "pending",
      latitude: 12.9716,
      longitude: 77.5946,
      createdById: citizen.id
    },
    {
      title: "Gargabe Overflow",
      description: "Garbage is bin is overflowing for 3 days.",
      category: "garbage",
      ward: "Ward 5",
      severity: "medium",
      status: "in_progress",
      latitude: 12.9750,
      longitude: 77.5960,
      createdById: citizen.id
    },
    {
      title: "Broken Streetlight",
      description: "Streetlight is out for 3 days.",
      category: " streetlight",
      ward: "Ward 12",
      severity: "low",
      status: "resolved",
      resolvedAt: new Date(),
      latitude: 12.9800,
      longitude: 77.6000,
      createdById: citizen.id
    }
  ];

  // Fix category names to match enum exactly (remove spaces etc)
  const fixedIssues = [
    {
      title: "Pothole on Main St",
      description: "Large pothole causing traffic issues.",
      category: "roads",
      ward: "Ward 1",
      severity: "high",
      status: "pending",
      latitude: 12.9716,
      longitude: 77.5946,
      createdById: citizen.id
    },
    {
      title: "Garbage Overflow",
      description: "Garbage bin is overflowing for 3 days.",
      category: "garbage",
      ward: "Ward 5",
      severity: "medium",
      status: "in_progress",
      latitude: 12.9750,
      longitude: 77.5960,
      createdById: citizen.id
    },
    {
      title: "Broken Streetlight",
      description: "Streetlight is out for 3 days.",
      category: "streetlight",
      ward: "Ward 12",
      severity: "low",
      status: "resolved",
      resolvedAt: new Date(),
      latitude: 12.9800,
      longitude: 77.6000,
      createdById: citizen.id
    }
  ];

  for (const issue of fixedIssues) {
    // @ts-ignore
    await prisma.issue.create({ data: issue });
  }

  console.log("Seeded 3 issues.");
}

seed().catch(console.error).finally(() => prisma.$disconnect());

import { prisma } from "../config/prisma.js";
import { hashPassword } from "../services/passwords.js";

async function seed() {
  const email = "suji@gmail.com";
  const password = "suji@123";
  const hashedPassword = await hashPassword(password);

  // Set Suji's creation date to Feb 1st, 2026
  const sujiBatchStart = new Date(2026, 1, 1); 

  let suji = await prisma.user.findUnique({ where: { email } });
  if (suji) {
    await prisma.user.update({
      where: { id: suji.id },
      data: { createdAt: sujiBatchStart }
    });
  } else {
    suji = await prisma.user.create({
      data: {
        name: "Suji",
        email,
        passwordHash: hashedPassword,
        role: "citizen",
        createdAt: sujiBatchStart
      }
    });
    console.log("Created/Updated suji account with Feb 1st creation date.");
  }

  // Clear previous issues for Suji to avoid duplicates during re-seed
  await prisma.issue.deleteMany({ where: { createdById: suji.id } });

  const issues = [
    // FEBRUARY ISSUES (Month 2)
    {
      title: "Broken Streetlight in Koramangala",
      description: "Streetlight has been flickering for 3 days, unsafe at night.",
      category: "streetlight",
      ward: "Ward 15",
      severity: "medium",
      status: "resolved",
      resolvedAt: new Date(2026, 1, 10),
      latitude: 12.9300,
      longitude: 77.6100,
      createdById: suji.id,
      createdAt: new Date(2026, 1, 5) 
    },
    {
      title: "Garbage Overflow near Metro Station",
      description: "Dustbins are overflowing onto the main road.",
      category: "garbage",
      ward: "Ward 22",
      severity: "high",
      status: "pending",
      latitude: 12.9700,
      longitude: 77.5900,
      createdById: suji.id,
      createdAt: new Date(2026, 1, 12)
    },
    {
      title: "Pothole on Indiranagar 100ft Road",
      description: "Large pothole causing traffic jams and potential accidents.",
      category: "roads",
      ward: "Ward 8",
      severity: "critical",
      status: "in_progress",
      latitude: 12.9750,
      longitude: 77.6400,
      createdById: suji.id,
      createdAt: new Date(2026, 1, 20)
    },
    {
      title: "Illegal Street Vending in Indiranagar",
      description: "Vendors blocking the entire pavement during rush hour.",
      category: "others",
      ward: "Ward 8",
      severity: "low",
      status: "pending",
      latitude: 12.9780,
      longitude: 77.6420,
      createdById: suji.id,
      createdAt: new Date(2026, 1, 24)
    },
    {
      title: "Broken Bench in Public Park",
      description: "Wooden bench is broken and has sharp splinters.",
      category: "public_safety",
      ward: "Ward 12",
      severity: "medium",
      status: "resolved",
      resolvedAt: new Date(2026, 1, 28),
      latitude: 12.9340,
      longitude: 77.6120,
      createdById: suji.id,
      createdAt: new Date(2026, 1, 26)
    },
    // MARCH ISSUES (Month 3)
    {
      title: "Unauthorized Construction in Kalyan Nagar",
      description: "Building work happening without visible permits.",
      category: "public_safety",
      ward: "Ward 34",
      severity: "low",
      status: "rejected",
      latitude: 13.0200,
      longitude: 77.6500,
      createdById: suji.id,
      createdAt: new Date(2026, 2, 2)
    },
    {
      title: "Water Pipeline Leak in Whitefield",
      description: "Major water waste due to pipe burst.",
      category: "water_leakage",
      ward: "Ward 45",
      severity: "high",
      status: "resolved",
      resolvedAt: new Date(2026, 2, 10),
      latitude: 12.9600,
      longitude: 77.7500,
      createdById: suji.id,
      createdAt: new Date(2026, 2, 5)
    },
    {
      title: "Debris blocking sidewalk in HSR Layout",
      description: "Construction debris dumped on the pavement.",
      category: "sanitation",
      ward: "Ward 19",
      severity: "medium",
      status: "pending",
      latitude: 12.9100,
      longitude: 77.6300,
      createdById: suji.id,
      createdAt: new Date(2026, 2, 15)
    },
    {
      title: "Broken Drainage Cover in Malleshwaram",
      description: "Hazardous open drain cover near the market.",
      category: "drainage",
      ward: "Ward 3",
      severity: "critical",
      status: "resolved",
      resolvedAt: new Date(2026, 2, 22),
      latitude: 12.9900,
      longitude: 77.5700,
      createdById: suji.id,
      createdAt: new Date(2026, 2, 20)
    }
  ];

  for (const issue of issues) {
    // @ts-ignore
    await prisma.issue.create({ data: issue });
  }

  console.log(`Seeded ${issues.length} issues for Suji.`);
}

seed().catch(console.error).finally(() => prisma.$disconnect());

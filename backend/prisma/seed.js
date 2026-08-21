import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const url = process.env.DATABASE_URL;
console.log("DATABASE_URL resolved in seed script:", url);

if (!url) {
  throw new Error("DATABASE_URL environment variable is missing.");
}

const adapter = new PrismaMariaDb(url);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Start cleaning database...');

  // Delete all dependencies in reverse order
  await prisma.notification.deleteMany();
  await prisma.taskReport.deleteMany();
  await prisma.practicalTask.deleteMany();
  await prisma.roadmapSubModule.deleteMany();
  await prisma.roadmapModule.deleteMany();
  await prisma.projectTask.deleteMany();
  await prisma.project.deleteMany();
  await prisma.onboardingDocument.deleteMany();
  await prisma.trainingRoadmap.deleteMany();
  await prisma.historicalRecord.deleteMany();
  await prisma.user.deleteMany();
  await prisma.application.deleteMany();
  await prisma.dropdownOption.deleteMany();
  await prisma.applicationStatusLog.deleteMany();
  await prisma.onboardingDocLog.deleteMany();

  console.log('Database cleaned. Starting seeding...');

  const adminPasswordHash = await bcrypt.hash('admin123', 12);

  // 1. Seed Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@inara.io',
      passwordHash: adminPasswordHash,
      firstName: 'Admin',
      lastName: 'System',
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log(`Created admin: ${admin.email}`);

  // 2. Seed Supervisors
  const supervisorsData = [
    { email: 'devops.sup@inara.io', firstName: 'DevOps', lastName: 'Lead', department: 'DEVOPS' },
    { email: 'aiml.sup@inara.io', firstName: 'AI/ML', lastName: 'Lead', department: 'AI_ML' },
    { email: 'security.sup@inara.io', firstName: 'Security', lastName: 'Lead', department: 'SECURITY' },
    { email: 'networking.sup@inara.io', firstName: 'Networking', lastName: 'Lead', department: 'NETWORKING' },
    { email: 'dev.sup@inara.io', firstName: 'Development', lastName: 'Lead', department: 'DEVELOPMENT' },
  ];

  const supervisors = {};
  for (const sup of supervisorsData) {
    const passwordText = `${sup.department.toLowerCase()}123`;
    const supervisorPasswordHash = await bcrypt.hash(passwordText, 12);

    const user = await prisma.user.create({
      data: {
        email: sup.email,
        passwordHash: supervisorPasswordHash,
        firstName: sup.firstName,
        lastName: sup.lastName,
        role: 'SUPERVISOR',
        department: sup.department,
        isActive: true,
      },
    });
    supervisors[sup.department] = user.id;
    console.log(`Created supervisor for ${sup.department}: ${user.email} (password: ${passwordText})`);
  }



  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

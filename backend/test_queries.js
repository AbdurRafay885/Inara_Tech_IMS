import { prisma } from './src/db.js';

const dept = 'DEVELOPMENT';

async function t() {
  try {
    const r = await prisma.weeklyReport.groupBy({ by: ['status'], where: { department: dept }, _count: { id: true } });
    console.log('T1 OK:', JSON.stringify(r));
  } catch (e) {
    console.error('T1 FAIL:', e.message);
  }

  try {
    const r = await prisma.user.findMany({
      where: { department: dept, role: 'INTERN', isActive: true },
      include: {
        weeklyReports: { where: { department: dept }, include: { roadmap: true } },
        assignedTasks: { where: { project: { supervisor: { department: dept } } } },
        projects: { where: { supervisor: { department: dept } } }
      }
    });
    console.log('T2 OK:', r.length);
  } catch (e) {
    console.error('T2 FAIL:', e.message);
  }

  try {
    const r = await prisma.projectTask.findMany({
      where: { project: { supervisor: { department: dept } } },
      include: { project: true }
    });
    console.log('T3 OK:', r.length);
  } catch (e) {
    console.error('T3 FAIL:', e.message);
  }

  try {
    const r = await prisma.project.findMany({
      where: { supervisor: { department: dept } },
      include: { supervisor: { select: { id: true } } }
    });
    console.log('T4 OK:', r.length);
  } catch (e) {
    console.error('T4 FAIL:', e.message);
  }

  await prisma.$disconnect();
}

t();

import { prisma } from '../db.js';

export const seedDefaultDropdowns = async () => {
  try {
    const count = await prisma.dropdownOption.count();
    if (count > 0) {
      console.log('[seeder]: Dropdown options already seeded.');
      return;
    }

    console.log('[seeder]: Seeding default dropdown options...');

    const defaults = [
      // currentEducation
      { field: 'currentEducation', value: 'Matric/O-Levels', label: 'Matric/O-Levels' },
      { field: 'currentEducation', value: 'Fsc/A-Levels', label: 'Fsc/A-Levels' },
      { field: 'currentEducation', value: 'Bachelors', label: 'Bachelors' },

      // preferredDepartment
      { field: 'preferredDepartment', value: 'DEVOPS', label: 'DevOps' },
      { field: 'preferredDepartment', value: 'AI_ML', label: 'AI/ML' },
      { field: 'preferredDepartment', value: 'SECURITY', label: 'Security' },
      { field: 'preferredDepartment', value: 'NETWORKING', label: 'Networking' },
      { field: 'preferredDepartment', value: 'DEVELOPMENT', label: 'Development' },

      // internshipMode
      { field: 'internshipMode', value: 'REMOTE', label: 'Remote' },
      { field: 'internshipMode', value: 'HYBRID', label: 'Hybrid' },
      { field: 'internshipMode', value: 'ON_SITE', label: 'On-site' },

      // duration
      { field: 'duration', value: '4', label: '4 Weeks' },
      { field: 'duration', value: '6', label: '6 Weeks' },
      { field: 'duration', value: '8', label: '8 Weeks' },
      { field: 'duration', value: '12', label: '12 Weeks' },
    ];

    await prisma.dropdownOption.createMany({
      data: defaults,
      skipDuplicates: true
    });

    console.log('[seeder]: Seeding complete!');
  } catch (error) {
    console.error('[seeder]: Seeding dropdowns failed:', error);
  }
};

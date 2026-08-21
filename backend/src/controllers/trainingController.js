import { prisma } from '../db.js';
import { notifyRoles } from '../utils/helpers.js';

export const uploadRoadmap = async (req, res) => {
  const supervisorId = req.user.id;
  const department = req.user.department;
  const { title, modules } = req.body;

  if (!department) {
    return res.status(400).json({
      status: 'error',
      message: 'You must belong to a department to upload a training roadmap.',
    });
  }

  if (!modules || !Array.isArray(modules)) {
    return res.status(400).json({
      status: 'error',
      message: 'Roadmap modules array is required.',
    });
  }

  try {
    const supervisor = await prisma.user.findUnique({ where: { id: supervisorId } });
    if (!supervisor) {
      return res.status(401).json({
        status: 'error',
        message: 'Your supervisor profile was not found. Please log out and log back in.',
      });
    }

    // Delete existing roadmap for this department to avoid duplicate roadmaps
    const existing = await prisma.trainingRoadmap.findFirst({
      where: { department },
      include: { modules: true }
    });
    const existingModuleTitles = existing ? existing.modules.map(m => m.title.toLowerCase()) : [];
    if (existing) {
      await prisma.trainingRoadmap.delete({ where: { id: existing.id } });
    }

    // Create the structured hierarchical roadmap in a transaction
    const roadmap = await prisma.trainingRoadmap.create({
      data: {
        title: title || `${department.replace(/_/g, ' ')} Training Roadmap`,
        department,
        uploadedById: supervisorId,
        modules: {
          create: modules.map((mod, modIdx) => ({
            title: mod.title,
            createdAt: new Date(Date.now() + modIdx * 1000),
            subModules: {
              create: mod.subModules.map((sub, subIdx) => ({
                title: sub.title,
                description: sub.description || null,
                createdAt: new Date(Date.now() + modIdx * 1000 + subIdx * 10),
                tasks: {
                  create: sub.tasks.map((task, taskIdx) => ({
                    title: task.title,
                    description: task.description || null,
                    durationHours: parseInt(task.durationHours) || 0,
                    createdAt: new Date(Date.now() + modIdx * 1000 + subIdx * 10 + taskIdx)
                  }))
                }
              }))
            }
          }))
        }
      },
      include: {
        modules: {
          include: {
            subModules: {
              include: {
                tasks: {
                  orderBy: { createdAt: 'asc' }
                }
              },
              orderBy: { createdAt: 'asc' }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    // Notify supervisor and all department interns of the general update
    await notifyRoles({
      roles: ['SUPERVISOR', 'INTERN'],
      department,
      userId: supervisorId,
      title: 'Training Roadmap Updated',
      message: `A new dynamic training roadmap "${roadmap.title}" has been configured for the ${department} department.`,
      type: 'DEPARTMENT_ASSIGNMENT',
      excludeUserId: req.user?.id,
    });

    // Notify internees for each newly assigned module
    const newModuleTitles = modules
      .map(m => m.title)
      .filter(title => title && !existingModuleTitles.includes(title.toLowerCase()));

    for (const newModuleName of newModuleTitles) {
      await notifyRoles({
        roles: ['INTERN'],
        department,
        title: 'New Module Assigned',
        message: `New module named "${newModuleName}" is assigned by supervisor.`,
        type: 'DEPARTMENT_ASSIGNMENT',
        excludeUserId: req.user?.id,
      });
    }

    return res.status(201).json({
      status: 'success',
      message: `Training roadmap for department ${department} uploaded successfully.`,
      data: roadmap,
    });
  } catch (error) {
    console.error('Upload roadmap error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong while uploading the roadmap.',
    });
  }
};

export const deleteRoadmap = async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await prisma.trainingRoadmap.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Roadmap not found.',
      });
    }

    await prisma.trainingRoadmap.delete({ where: { id } });

    return res.status(200).json({
      status: 'success',
      message: 'Roadmap deleted successfully.',
    });
  } catch (error) {
    console.error('Delete roadmap error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong while deleting the roadmap.',
    });
  }
};

export const getRoadmap = async (req, res) => {
  let { department } = req.params;

  if (!department) {
    department = req.user.department;
  }

  if (!department) {
    return res.status(400).json({
      status: 'error',
      message: 'Department not specified and user does not belong to any department.',
    });
  }

  try {
    const roadmap = await prisma.trainingRoadmap.findFirst({
      where: { department },
      include: {
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        modules: {
          include: {
            subModules: {
              include: {
                tasks: {
                  orderBy: { createdAt: 'asc' }
                }
              },
              orderBy: { createdAt: 'asc' }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    return res.status(200).json({
      status: 'success',
      data: roadmap ? [roadmap] : [],
    });
  } catch (error) {
    console.error('Get roadmap error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong while fetching the training roadmap.',
    });
  }
};

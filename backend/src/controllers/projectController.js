import { prisma } from '../db.js';
import { createNotification, notifyRoles } from '../utils/helpers.js';
import path from 'path';

export const createProject = async (req, res) => {
  const { name, description } = req.body;
  const supervisorId = req.user.id;
  const referenceFile = req.file?.filename || null;

  try {
    const project = await prisma.project.create({
      data: {
        name,
        description,
        referenceFile,
        supervisorId,
      },
    });

    // Notify supervisor
    await notifyRoles({
      roles: ['SUPERVISOR'],
      userId: supervisorId,
      title: 'Project Created',
      message: `Project "${name}" has been created.`,
      type: 'PROJECT_ASSIGNMENT',
      excludeUserId: req.user?.id,
    });

    return res.status(201).json({
      status: 'success',
      message: 'Project created successfully.',
      data: project,
    });
  } catch (error) {
    console.error('Create project error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong while creating the project.',
    });
  }
};

export const addProjectMembers = async (req, res) => {
  const { id } = req.params; // Project ID
  const { memberIds } = req.body;

  try {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found.',
      });
    }

    // Connect members to the project
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        members: {
          connect: memberIds.map((memberId) => ({ id: memberId })),
        },
      },
      include: { members: true },
    });

    // Notify each new member
    for (const memberId of memberIds) {
      await notifyRoles({
        roles: ['INTERN'],
        userId: memberId,
        title: 'Added to Project',
        message: `You have been added to the project: "${project.name}".`,
        type: 'PROJECT_ASSIGNMENT',
        excludeUserId: req.user?.id,
      });
    }

    // Notify supervisor
    await notifyRoles({
      roles: ['SUPERVISOR'],
      userId: project.supervisorId,
      title: 'Project Members Updated',
      message: `Supervisor updated members for project "${project.name}".`,
      type: 'PROJECT_ASSIGNMENT',
      excludeUserId: req.user?.id,
    });

    return res.status(200).json({
      status: 'success',
      message: 'Members added to project successfully.',
      data: updatedProject,
    });
  } catch (error) {
    console.error('Add project members error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong while adding members to the project.',
    });
  }
};

export const assignTask = async (req, res) => {
  const { id } = req.params; // Project ID
  const { title, description, dueDate, assignedToId } = req.body;

  if (dueDate) {
    const taskDueDate = new Date(dueDate);
    if (taskDueDate < new Date()) {
      return res.status(400).json({
        status: 'error',
        message: 'Task due date and time cannot be in the past.',
      });
    }
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: { members: true },
    });

    if (!project) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found.',
      });
    }

    // Check if the assigned user is actually a member of the project
    if (assignedToId) {
      const isMember = project.members.some((m) => m.id === assignedToId);
      if (!isMember) {
        return res.status(400).json({
          status: 'error',
          message: 'The assigned user must be a member of the project.',
        });
      }
    }

    const task = await prisma.projectTask.create({
      data: {
        projectId: id,
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedToId: assignedToId || null,
        status: 'PENDING',
      },
    });

    if (assignedToId) {
      // Notify the assigned member and supervisor
      await notifyRoles({
        roles: ['SUPERVISOR', 'INTERN'],
        userId: assignedToId,
        title: 'New Project Task Assigned',
        message: `You have been assigned the task: "${title}" under project: "${project.name}".`,
        type: 'PROJECT_ASSIGNMENT',
        excludeUserId: req.user?.id,
      });
    } else {
      // Notify the supervisor
      await notifyRoles({
        roles: ['SUPERVISOR'],
        userId: project.supervisorId,
        title: 'Project Task Created',
        message: `An unassigned task: "${title}" under project: "${project.name}" has been created.`,
        type: 'PROJECT_ASSIGNMENT',
        excludeUserId: req.user?.id,
      });
    }

    return res.status(201).json({
      status: 'success',
      message: 'Project task assigned successfully.',
      data: task,
    });
  } catch (error) {
    console.error('Assign project task error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong while assigning the project task.',
    });
  }
};

export const updateTaskStatus = async (req, res) => {
  const { id } = req.params; // Task ID
  const { status } = req.body;
  const internId = req.user.id;

  try {
    const task = await prisma.projectTask.findUnique({
      where: { id },
      include: {
        project: {
          select: { supervisorId: true, name: true },
        },
      },
    });

    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Project task not found.',
      });
    }

    // Confirm that the caller is the assigned intern
    if (task.assignedToId !== internId) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only update tasks assigned to you.',
      });
    }

    // Task status cannot be changed to previous status once Completed
    if (task.status === 'COMPLETED' && status !== 'COMPLETED') {
      return res.status(400).json({
        status: 'error',
        message: 'Completed tasks cannot be changed back to a previous status.',
      });
    }

    // Block manual change to COMPLETED without deliverable or deliverableLink
    if (status === 'COMPLETED' && !task.deliverable && !task.deliverableLink) {
      return res.status(400).json({
        status: 'error',
        message: 'To mark this task as Completed, please upload your project deliverable document or provide a deliverable link.',
      });
    }

    const updatedTask = await prisma.projectTask.update({
      where: { id },
      data: { status },
    });

    // Notify intern and supervisor
    await notifyRoles({
      roles: ['SUPERVISOR', 'INTERN'],
      userId: internId,
      title: `Project Task Status Updated: ${status}`,
      message: `Intern ${req.user.firstName} updated the task: "${task.title}" status to "${status}" in project "${task.project.name}".`,
      type: 'PROJECT_ASSIGNMENT',
      excludeUserId: req.user?.id,
    });

    return res.status(200).json({
      status: 'success',
      message: 'Project task status updated successfully.',
      data: updatedTask,
    });
  } catch (error) {
    console.error('Update task status error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong while updating task status.',
    });
  }
};

export const uploadTaskDeliverable = async (req, res) => {
  const { id } = req.params; // Task ID
  const { deliverableLink } = req.body;
  const internId = req.user.id;

  const fileName = req.file ? req.file.filename : null;

  if (!fileName && (!deliverableLink || deliverableLink.trim() === '')) {
    return res.status(400).json({
      status: 'error',
      message: 'At least one deliverable input (either a PDF attachment or a project URL link) must be provided to complete the task.',
    });
  }

  try {
    const task = await prisma.projectTask.findUnique({
      where: { id },
      include: {
        project: {
          select: { supervisorId: true, name: true },
        },
      },
    });

    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Project task not found.',
      });
    }

    if (task.assignedToId !== internId) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only upload deliverables for tasks assigned to you.',
      });
    }

    const updatedTask = await prisma.projectTask.update({
      where: { id },
      data: {
        deliverable: fileName || task.deliverable,
        deliverableLink: (deliverableLink && deliverableLink.trim() !== '') ? deliverableLink : task.deliverableLink,
        status: 'COMPLETED',
      },
    });

    // Notify intern and supervisor
    await notifyRoles({
      roles: ['SUPERVISOR', 'INTERN'],
      userId: internId,
      title: 'Project Deliverable Uploaded',
      message: `Intern ${req.user.firstName} uploaded a deliverable for task: "${task.title}" in project "${task.project.name}".`,
      type: 'PROJECT_ASSIGNMENT',
      excludeUserId: req.user?.id,
    });

    return res.status(200).json({
      status: 'success',
      message: 'Task deliverable uploaded successfully.',
      data: updatedTask,
    });
  } catch (error) {
    console.error('Upload deliverable error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong while uploading task deliverable.',
    });
  }
};

export const getProjects = async (req, res) => {
  const role = req.user.role;
  const userId = req.user.id;

  try {
    const where = {};

    if (role === 'INTERN') {
      // Interns see projects they are member of AND that belong to their active department
      where.members = {
        some: { id: userId },
      };
      where.supervisor = {
        department: req.user.department
      };
    } else if (role === 'SUPERVISOR') {
      // Supervisors see projects they created
      where.supervisorId = userId;
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        supervisor: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        members: {
          where: { isActive: true },
          select: { id: true, firstName: true, lastName: true, email: true, department: true },
        },
        tasks: {
          include: {
            assignedTo: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      status: 'success',
      data: projects,
    });
  } catch (error) {
    console.error('Get projects error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong while retrieving projects.',
    });
  }
};

export const downloadDeliverable = async (req, res) => {
  const { id } = req.params; // Task ID
  const { role, id: userId } = req.user;

  try {
    const task = await prisma.projectTask.findUnique({
      where: { id },
      include: {
        project: true,
        assignedTo: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    if (!task || !task.deliverable) {
      return res.status(404).json({
        status: 'error',
        message: 'Task deliverable file not found.',
      });
    }

    // Security constraints
    if (role === 'INTERN' && task.assignedToId !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to download this deliverable.',
      });
    }

    const interneeName = task.assignedTo
      ? `${task.assignedTo.firstName}_${task.assignedTo.lastName}`
      : 'Intern';

    // Format: ProjectName_InterneeName.ext
    const cleanProjectName = task.project.name.replace(/[^a-zA-Z0-9]/g, '_');
    const cleanInterneeName = interneeName.replace(/[^a-zA-Z0-9]/g, '_');
    const ext = path.extname(task.deliverable);
    const filename = `${cleanProjectName}_${cleanInterneeName}${ext}`;

    const filePath = path.join(process.cwd(), 'uploads', 'deliverables', task.deliverable);
    return res.download(filePath, filename);
  } catch (error) {
    console.error('Download deliverable error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong while downloading the deliverable.',
    });
  }
};

export const downloadReference = async (req, res) => {
  const { id } = req.params; // Project ID
  const { role, id: userId } = req.user;

  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: { members: { select: { id: true } } },
    });

    if (!project || !project.referenceFile) {
      return res.status(404).json({
        status: 'error',
        message: 'Project reference material not found.',
      });
    }

    // Security constraints
    if (role === 'INTERN') {
      const isMember = project.members.some((m) => m.id === userId);
      if (!isMember) {
        return res.status(403).json({
          status: 'error',
          message: 'You are not authorized to download this project material.',
        });
      }
    }

    // Format: ProjectName.ext
    const cleanProjectName = project.name.replace(/[^a-zA-Z0-9]/g, '_');
    const ext = path.extname(project.referenceFile);
    const filename = `${cleanProjectName}${ext}`;

    const filePath = path.join(process.cwd(), 'uploads', 'projects', project.referenceFile);
    return res.download(filePath, filename);
  } catch (error) {
    console.error('Download project reference error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong while downloading the project material.',
    });
  }
};

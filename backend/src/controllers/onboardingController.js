import bcrypt from 'bcryptjs';
import { prisma } from '../db.js';
import { createNotification, notifyRoles } from '../utils/helpers.js';
import { sendEmail } from '../utils/mailer.js';
import path from 'path';

export const createInterneeAccount = async (req, res) => {
  const { applicationId, email, password, firstName, lastName, department } = req.body;

  try {
    // 1. Verify application exists and is SELECTED
    const application = await prisma.application.findUnique({ where: { id: applicationId } });
    if (!application) {
      return res.status(404).json({
        status: 'error',
        message: 'Associated application not found.',
      });
    }

    if (application.status !== 'SELECTED') {
      return res.status(400).json({
        status: 'error',
        message: 'Applicant must be in SELECTED status to activate an internee account.',
      });
    }

    // 2. Check if email is already taken
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'A user account with this email already exists.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const supervisor = await prisma.user.findFirst({
      where: {
        role: 'SUPERVISOR',
        department,
        isActive: true
      }
    });

    // 3. Create user profile as INTERN
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        role: 'INTERN',
        department,
        applicationId,
        supervisorId: supervisor ? supervisor.id : null,
        isActive: true,
      },
    });

    // 4. Send email with portal login details
    await sendEmail({
      to: email,
      subject: 'Welcome to Inara Technologies - Portal Access Activated',
      text: `Hello ${firstName},\n\nYour portal account for the Internship Management System has been created successfully!\n\nPortal Login Details:\nEmail: ${email}\nPassword: ${password}\n\nPlease login and upload your onboarding documents immediately.\n\nBest regards,\nHR Team\nInara Technologies`,
    });

    // Notify intern, supervisor(s), and admins
    await notifyRoles({
      roles: ['ADMIN', 'SUPERVISOR', 'INTERN'],
      department,
      userId: user.id,
      title: 'Portal Access Activated',
      message: `Intern account for ${firstName} ${lastName} has been activated in the ${department} department.`,
      type: 'DEPARTMENT_ASSIGNMENT',
      excludeUserId: req.user?.id,
    });

    return res.status(201).json({
      status: 'success',
      message: 'Internee account created and portal access activated.',
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        department: user.department,
      },
    });
  } catch (error) {
    console.error('Create internee account error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong while creating the internee account.',
    });
  }
};

export const uploadDocument = async (req, res) => {
  const { type } = req.body;
  const internId = req.user.id;

  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'Document file is required.',
      });
    }

    // Always create a new document to support multiple onboarding documents of the same type
    const doc = await prisma.onboardingDocument.create({
      data: {
        type,
        fileName: req.file.filename,
        status: 'UPLOADED',
        internId,
      },
    });

    // Keep logs for onboarding docs uploaded by internee
    await prisma.onboardingDocLog.create({
      data: {
        userId: internId,
        userEmail: req.user.email,
        userName: `${req.user.firstName} ${req.user.lastName}`,
        docType: type,
        fileName: req.file.filename
      }
    });

    // Notify intern and admins
    await notifyRoles({
      roles: ['ADMIN', 'INTERN'],
      userId: internId,
      title: 'Document Uploaded',
      message: `Intern ${req.user.firstName} uploaded onboarding document of type: ${type}.`,
      type: 'DOCUMENT_VERIFICATION',
      excludeUserId: req.user?.id,
    });

    return res.status(200).json({
      status: 'success',
      message: 'Document uploaded successfully.',
      data: doc,
    });
  } catch (error) {
    console.error('Document upload error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong while uploading the document.',
    });
  }
};

export const getDocuments = async (req, res) => {
  const { id: userId, role } = req.user;

  try {
    const whereClause = role === 'INTERN'
      ? { internId: userId }
      : { intern: { isActive: true } };

    const docs = await prisma.onboardingDocument.findMany({
      where: whereClause,
      include: {
        intern: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            department: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      status: 'success',
      data: docs,
    });
  } catch (error) {
    console.error('Get documents error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong while fetching documents.',
    });
  }
};

export const verifyDocument = async (req, res) => {
  const { id } = req.params;
  const { status, feedback } = req.body;

  try {
    const doc = await prisma.onboardingDocument.findUnique({ where: { id } });
    if (!doc) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found.',
      });
    }

    const updatedDoc = await prisma.onboardingDocument.update({
      where: { id },
      data: { status, feedback },
    });

    // Notify internee of document status update
    const message = status === 'VERIFIED'
      ? `Your onboarding document (${doc.type}) has been successfully verified by HR.`
      : `Your onboarding document (${doc.type}) was rejected. Reason: ${feedback || 'No feedback provided'}. Please re-upload.`;

    await notifyRoles({
      roles: ['INTERN'],
      userId: doc.internId,
      title: `Document ${status}`,
      message,
      type: 'DOCUMENT_VERIFICATION',
      excludeUserId: req.user?.id,
    });

    return res.status(200).json({
      status: 'success',
      message: 'Document verification status updated successfully.',
      data: updatedDoc,
    });
  } catch (error) {
    console.error('Verify document error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong during document verification.',
    });
  }
};

export const assignDepartment = async (req, res) => {
  const { id } = req.params; // intern's User ID
  const { department } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || user.role !== 'INTERN') {
      return res.status(404).json({
        status: 'error',
        message: 'Intern user profile not found.',
      });
    }

    const supervisor = await prisma.user.findFirst({
      where: {
        role: 'SUPERVISOR',
        department,
        isActive: true
      }
    });

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        department,
        supervisorId: supervisor ? supervisor.id : null
      },
    });

    // Notify internee of department assignment
    await notifyRoles({
      roles: ['ADMIN', 'SUPERVISOR', 'INTERN'],
      department,
      userId: id,
      title: 'Department Assigned',
      message: `Intern ${user.firstName} ${user.lastName} has been assigned to the ${department} department.`,
      type: 'DEPARTMENT_ASSIGNMENT',
      excludeUserId: req.user?.id,
    });

    return res.status(200).json({
      status: 'success',
      message: 'Department assigned successfully.',
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        department: updatedUser.department,
      },
    });
  } catch (error) {
    console.error('Assign department error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong during department assignment.',
    });
  }
};

export const getInterns = async (req, res) => {
  const { role, department } = req.user;

  try {
    const where = { role: 'INTERN', isActive: true };
    if (role === 'SUPERVISOR') {
      where.department = department;
    }

    const interns = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        department: true,
        isActive: true,
        applicationId: true,
        createdAt: true,
        endDate: true,
        application: {
          select: {
            picture: true,
          },
        },
      },
      orderBy: { firstName: 'asc' },
    });

    return res.status(200).json({
      status: 'success',
      data: interns,
    });
  } catch (error) {
    console.error('Get interns error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong while fetching interns.',
    });
  }
};

export const downloadDoc = async (req, res) => {
  const { id } = req.params;

  try {
    const doc = await prisma.onboardingDocument.findUnique({
      where: { id },
      include: {
        intern: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    if (!doc) {
      return res.status(404).json({
        status: 'error',
        message: 'Onboarding document not found.',
      });
    }

    // Role security check: interns can only download their own onboarding documents
    if (req.user.role === 'INTERN' && doc.internId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only download your own onboarding documents.',
      });
    }

    const ext = path.extname(doc.fileName) || '.pdf';
    const fullName = `${doc.intern.firstName}_${doc.intern.lastName}`;
    const cleanName = fullName.replace(/\s+/g, '_');
    const customFileName = `${cleanName}_${doc.type}${ext}`;

    const filePath = path.join(process.cwd(), 'uploads', 'onboarding_docs', doc.fileName);
    return res.download(filePath, customFileName);
  } catch (error) {
    console.error('Download doc error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong while downloading the onboarding document.',
    });
  }
};

import { prisma } from '../db.js';
import { sendEmail } from '../utils/mailer.js';
import { notifyRoles } from '../utils/helpers.js';
import path from 'path';

export const apply = async (req, res) => {
  const userId = req.user.id;

  try {
    const {
      email,
      cnic,
      currentEducation,
      instituteName,
      firstName,
      lastName,
      phone,
      preferredDepartment,
      internshipMode,
      dob,
      address,
      gender,
      nationality,
      emergencyContact,
      duration,
    } = req.body;

    const durationInt = parseInt(duration, 10);

    const resumeFile = req.files && req.files['resume'] ? req.files['resume'][0] : null;
    const pictureFile = req.files && req.files['picture'] ? req.files['picture'][0] : null;

    if (!resumeFile) {
      return res.status(400).json({
        status: 'error',
        message: 'Resume (CV) document file is required.',
      });
    }

    if (!pictureFile) {
      return res.status(400).json({
        status: 'error',
        message: 'Profile picture file is required.',
      });
    }

    // Check if user already has an active application
    const user = await prisma.user.findUnique({ where: { id: userId } });

    // Check if the CNIC is already in use by any other application
    const cnicExists = await prisma.application.findFirst({
      where: {
        cnic,
        NOT: user?.applicationId ? { id: user.applicationId } : undefined
      }
    });

    if (cnicExists) {
      return res.status(400).json({
        status: 'error',
        message: 'This CNIC is already registered in our system.',
      });
    }
    
    let existingApp = null;
    if (user.applicationId) {
      existingApp = await prisma.application.findUnique({ where: { id: user.applicationId } });
    } else {
      existingApp = await prisma.application.findUnique({ where: { email } });
    }

    if (existingApp) {
      if (existingApp.status !== 'REJECTED') {
        return res.status(400).json({
          status: 'error',
          message: 'You have already submitted an active application.',
        });
      }

      // Check cool-off period (6 months)
      const rejectionDate = new Date(existingApp.updatedAt);
      const eligibleDate = new Date(rejectionDate);
      eligibleDate.setMonth(eligibleDate.getMonth() + 6);
      
      const now = new Date();
      const remainingMs = eligibleDate.getTime() - now.getTime();
      
      if (remainingMs > 0) {
        const remainingMonths = (remainingMs / (30 * 24 * 60 * 60 * 1000)).toFixed(1);
        return res.status(400).json({
          status: 'error',
          message: `You are in a cool-off period. You can apply again after ${remainingMonths} months.`,
          coolOffRemainingMonths: parseFloat(remainingMonths),
          eligibleDate: eligibleDate.toISOString(),
        });
      }

      // Cool-off period has passed, perform in-place update of existing application
      const updatedApp = await prisma.application.update({
        where: { id: existingApp.id },
        data: {
          cnic,
          currentEducation,
          instituteName,
          firstName,
          lastName,
          phone,
          preferredDepartment: preferredDepartment || null,
          internshipMode,
          resumeFile: resumeFile.filename,
          picture: pictureFile.filename,
          gender,
          nationality,
          emergencyContact,
          duration: durationInt,
          status: 'SUBMITTED',
          interviewDate: null,
          createdAt: new Date(),
          dob: new Date(dob),
          address,
        },
      });

      // Link application to user profile if not already linked
      if (user.applicationId !== updatedApp.id) {
        await prisma.user.update({
          where: { id: userId },
          data: { applicationId: updatedApp.id },
        });
      }

      // Send confirmation email
      await sendEmail({
        to: email,
        subject: 'Internship Application Received',
        text: `Hello ${firstName},\n\nThank you for applying for an internship at Inara Technologies. Your application has been successfully submitted.\n\nTracking ID: ${updatedApp.cnic}\nStatus: SUBMITTED\n\nWe will review your profile and get back to you shortly.\n\nBest regards,\nRecruitment Team\nInara Technologies`,
      });

      // Notify admins of new application
      await notifyRoles({
        roles: ['ADMIN'],
        title: 'New Application Submitted',
        message: `A new application has been submitted by ${firstName} ${lastName} for ${preferredDepartment || 'unspecified'}.`,
        type: 'APPLICATION_STATUS_UPDATE',
        excludeUserId: req.user?.id,
      });

      return res.status(201).json({
        status: 'success',
        message: 'Application submitted successfully.',
        data: updatedApp,
      });
    }

    const application = await prisma.application.create({
      data: {
        email,
        cnic,
        currentEducation,
        instituteName,
        firstName,
        lastName,
        phone,
        preferredDepartment: preferredDepartment || null,
        internshipMode,
        resumeFile: resumeFile.filename,
        picture: pictureFile.filename,
        gender,
        nationality,
        emergencyContact,
        duration: durationInt,
        status: 'SUBMITTED',
        dob: new Date(dob),
        address,
      },
    });

    // Link application to user profile
    await prisma.user.update({
      where: { id: userId },
      data: { applicationId: application.id }
    });

    // Send confirmation email
    await sendEmail({
      to: email,
      subject: 'Internship Application Received',
      text: `Hello ${firstName},\n\nThank you for applying for an internship at Inara Technologies. Your application has been successfully submitted.\n\nTracking ID: ${application.cnic}\nStatus: SUBMITTED\n\nWe will review your profile and get back to you shortly.\n\nBest regards,\nRecruitment Team\nInara Technologies`,
    });

    // Notify admins of new application
    await notifyRoles({
      roles: ['ADMIN'],
      title: 'New Application Submitted',
      message: `A new application has been submitted by ${firstName} ${lastName} for ${preferredDepartment || 'unspecified'}.`,
      type: 'APPLICATION_STATUS_UPDATE',
      excludeUserId: req.user?.id,
    });

    return res.status(201).json({
      status: 'success',
      message: 'Application submitted successfully.',
      data: application,
    });
  } catch (error) {
    console.error('Apply error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong while submitting the application.',
    });
  }
};

export const trackApplication = async (req, res) => {
  const { id } = req.params;

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const application = await prisma.application.findUnique({
      where: isUuid ? { id } : { cnic: id }
    });
    if (!application) {
      return res.status(404).json({
        status: 'error',
        message: 'Application not found.',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        id: application.id,
        cnic: application.cnic,
        currentEducation: application.currentEducation,
        instituteName: application.instituteName,
        firstName: application.firstName,
        lastName: application.lastName,
        email: application.email,
        phone: application.phone,
        preferredDepartment: application.preferredDepartment,
        internshipMode: application.internshipMode,
        status: application.status,
        interviewDate: application.interviewDate,
        dob: application.dob,
        address: application.address,
        gender: application.gender,
        nationality: application.nationality,
        picture: application.picture,
        emergencyContact: application.emergencyContact,
        duration: application.duration,
        createdAt: application.createdAt,
        updatedAt: application.updatedAt,
      },
    });
  } catch (error) {
    console.error('Track application error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong while tracking the application.',
    });
  }
};

export const getApplications = async (req, res) => {
  const { status, preferredDepartment, internshipMode, search } = req.query;

  try {
    const where = {
      isDeleted: false,
      NOT: {
        user: {
          OR: [
            { isActive: false },
            { historicalRecords: { some: {} } }
          ]
        }
      }
    };

    if (status) where.status = status;
    if (preferredDepartment) where.preferredDepartment = preferredDepartment;
    if (internshipMode) where.internshipMode = internshipMode;

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const applications = await prisma.application.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      status: 'success',
      results: applications.length,
      data: applications,
    });
  } catch (error) {
    console.error('Get applications error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong while fetching applications.',
    });
  }
};

export const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status, interviewDate, startDate } = req.body;

  try {
    const application = await prisma.application.findUnique({ where: { id } });
    if (!application) {
      return res.status(404).json({
        status: 'error',
        message: 'Application not found.',
      });
    }

    if (application.status === 'SELECTED' || application.status === 'REJECTED') {
      return res.status(400).json({
        status: 'error',
        message: `Application status has already been finalized as ${application.status} and cannot be modified.`,
      });
    }

    const hasInterviewDate = interviewDate && interviewDate.trim() !== '';

    if (hasInterviewDate) {
      const schDate = new Date(interviewDate);
      if (schDate < new Date()) {
        return res.status(400).json({
          status: 'error',
          message: 'Interview date and time cannot be in the past.',
        });
      }
    }

    if (status === 'SELECTED') {
      if (!startDate) {
        return res.status(400).json({
          status: 'error',
          message: 'Internship start date is required.',
        });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const stDate = new Date(startDate);
      stDate.setHours(0, 0, 0, 0);

      if (stDate < today) {
        return res.status(400).json({
          status: 'error',
          message: 'Internship start date cannot be in the past.',
        });
      }
    }

    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        status,
        interviewDate: hasInterviewDate ? new Date(interviewDate) : null,
      },
    });

    // Keep logs for application status changes in db
    await prisma.applicationStatusLog.create({
      data: {
        applicationId: id,
        oldStatus: application.status,
        newStatus: status,
        updatedById: req.user.id,
        updatedByName: `${req.user.firstName} ${req.user.lastName} (${req.user.email})`
      }
    });

    // Notify applicant by email of status change
    let emailText = `Hello ${application.firstName},\n\nYour application status has been updated to: ${status}.\n`;
    
    if (status === 'INTERVIEW_SCHEDULED' && hasInterviewDate) {
      emailText += `Your interview is scheduled for: ${new Date(interviewDate).toLocaleString()}.\n`;
    } else if (status === 'SELECTED') {
      const associatedUser = await prisma.user.findUnique({
        where: { applicationId: id },
      });
      if (associatedUser) {
        const assignedDept = application.preferredDepartment || 'DEVELOPMENT';
        const durationWeeks = application.duration || 6;
        const selectedStartDate = startDate ? new Date(startDate) : new Date();
        const endDate = new Date(selectedStartDate.getTime() + durationWeeks * 7 * 24 * 60 * 60 * 1000);

        const supervisor = await prisma.user.findFirst({
          where: {
            role: 'SUPERVISOR',
            department: assignedDept,
            isActive: true
          }
        });

        await prisma.user.update({
          where: { id: associatedUser.id },
          data: {
            role: 'INTERN',
            department: assignedDept,
            supervisorId: supervisor ? supervisor.id : null,
            createdAt: selectedStartDate,
            endDate: endDate,
          },
        });
        emailText = `Hello ${application.firstName},\n\nCongratulations! You have been selected for the internship at Inara Technologies!\n\nYour portal account has been upgraded to an Intern profile in the ${assignedDept} department. You can now access all internship features (documents upload, weekly report submissions, projects) by logging into the portal using your existing registered email and password.\n\nLogin URL: http://localhost:5173/login\n`;
      } else {
        emailText += `Congratulations! You have been selected for the internship. Our HR team will contact you shortly to activate your portal account.\n`;
      }
    } else if (status === 'REJECTED') {
      emailText += `Thank you for your interest in Inara Technologies. Unfortunately, we will not be moving forward with your application at this time.\n`;
    }

    emailText += `\nBest regards,\nHR Team\nInara Technologies`;

    await sendEmail({
      to: application.email,
      subject: `Internship Application Status Update - ${status}`,
      text: emailText,
    });

    // Notify applicant (if user account exists) and all admins
    const associatedUser = await prisma.user.findUnique({
      where: { applicationId: id },
    });
    await notifyRoles({
      roles: ['ADMIN', ...(associatedUser ? ['INTERN'] : [])],
      userId: associatedUser?.id,
      title: `Application Status Updated: ${status}`,
      message: `Application for ${application.firstName} ${application.lastName} has been updated to ${status}.`,
      type: 'APPLICATION_STATUS_UPDATE',
      excludeUserId: req.user?.id,
    });

    return res.status(200).json({
      status: 'success',
      message: 'Application status updated successfully.',
      data: updatedApplication,
    });
  } catch (error) {
    console.error('Update status error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong while updating application status.',
    });
  }
};

export const downloadCV = async (req, res) => {
  const { id } = req.params;

  try {
    const application = await prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      return res.status(404).json({
        status: 'error',
        message: 'Application not found.',
      });
    }

    if (!application.resumeFile) {
      return res.status(404).json({
        status: 'error',
        message: 'No CV/resume file found for this applicant.',
      });
    }

    const ext = path.extname(application.resumeFile) || '.pdf';
    const fullName = `${application.firstName}_${application.lastName}`;
    const cleanName = fullName.replace(/\s+/g, '_');
    const customFileName = `${cleanName}_CV${ext}`;

    const filePath = path.join(process.cwd(), 'uploads', 'resumes', application.resumeFile);
    return res.download(filePath, customFileName);
  } catch (error) {
    console.error('Download CV error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong while downloading the CV.',
    });
  }
};

export const deleteApplications = async (req, res) => {
  // Soft delete multiple application records
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Please provide an array of application IDs to delete.',
    });
  }

  try {
    // Soft delete: update isDeleted to true
    await prisma.application.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        isDeleted: true,
      },
    });

    return res.status(200).json({
      status: 'success',
      message: `${ids.length} application(s) successfully deleted.`,
    });
  } catch (error) {
    console.error('Delete applications error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong while deleting the applications.',
    });
  }
};

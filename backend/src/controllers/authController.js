import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';
import { sendEmail } from '../utils/mailer.js';

export const register = async (req, res) => {
  const { email, password, firstName, lastName, role, department } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'A user with this email address already exists.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const userRole = 'APPLICANT';

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        role: userRole,
        department: null,
        isActive: true,
      },
    });

    return res.status(201).json({
      status: 'success',
      message: 'User registered successfully.',
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
    console.error('Registration error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong during registration.',
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { application: true },
    });
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        status: 'error',
        message: 'Portal access has been deactivated (e.g. internship completed/archived).',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password.',
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        department: user.department,
        applicationId: user.applicationId,
        picture: user.application?.picture || null,
        createdAt: user.createdAt,
        endDate: user.endDate || null,
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      status: 'success',
      message: 'Login successful.',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          department: user.department,
          applicationId: user.applicationId,
          picture: user.application?.picture || null,
          createdAt: user.createdAt,
          endDate: user.endDate || null,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong during login.',
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        department: true,
        isActive: true,
        applicationId: true,
        createdAt: true,
        updatedAt: true,
        endDate: true,
        application: {
          select: {
            picture: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User profile not found.',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        department: user.department,
        isActive: user.isActive,
        applicationId: user.applicationId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        endDate: user.endDate,
        picture: user.application?.picture || null,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong while retrieving profile.',
    });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'This email address is not registered in our system.',
      });
    }

    // Generate real JWT token containing the user's email
    const resetToken = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '1h' }
    );

    // Send reset email with actual token
    await sendEmail({
      to: email,
      subject: 'Password Reset Request',
      text: `Hello ${user.firstName},\n\nYou requested a password reset. Please use the following link to reset your password:\n\nhttp://localhost:5173/reset-password?token=${resetToken}\n\nThanks,\nInara Technologies`,
    });

    return res.status(200).json({
      status: 'success',
      message: 'If the email exists, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong during the password reset request.',
    });
  }
};

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    const email = decoded.email;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User profile not found.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { email },
      data: { passwordHash },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Password reset successful. You can now log in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(400).json({
      status: 'error',
      message: 'Invalid or expired password reset token.',
    });
  }
};

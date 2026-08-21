import { prisma } from '../db.js';
import bcrypt from 'bcryptjs';

export const getDropdowns = async (req, res) => {
  try {
    const options = await prisma.dropdownOption.findMany({
      orderBy: { label: 'asc' }
    });

    // Group options by field
    const grouped = options.reduce((acc, opt) => {
      if (!acc[opt.field]) {
        acc[opt.field] = [];
      }
      acc[opt.field].push({
        id: opt.id,
        value: opt.value,
        label: opt.label
      });
      return acc;
    }, {
      currentEducation: [],
      preferredDepartment: [],
      internshipMode: [],
      duration: []
    });

    return res.status(200).json({
      status: 'success',
      data: grouped
    });
  } catch (error) {
    console.error('Get dropdowns error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve dropdown options.'
    });
  }
};

export const addDropdownOption = async (req, res) => {
  const { field, value, label } = req.body;

  if (!field || !value || !label) {
    return res.status(400).json({
      status: 'error',
      message: 'Field, value, and label are required.'
    });
  }

  // Validate field name
  const allowedFields = ['currentEducation', 'preferredDepartment', 'internshipMode', 'duration'];
  if (!allowedFields.includes(field)) {
    return res.status(400).json({
      status: 'error',
      message: `Invalid field. Allowed fields: ${allowedFields.join(', ')}`
    });
  }

  try {
    // Check if duplicate option already exists
    const existing = await prisma.dropdownOption.findUnique({
      where: {
        field_value: { field, value }
      }
    });

    if (existing) {
      return res.status(400).json({
        status: 'error',
        message: 'This option already exists for this dropdown.'
      });
    }

    const option = await prisma.dropdownOption.create({
      data: { field, value, label }
    });

    // If a new preferredDepartment is added, automatically create a Supervisor account for it
    if (field === 'preferredDepartment') {
      const formatDeptPrefix = (val) => {
        let clean = val.toLowerCase().replace(/_/g, '');
        if (clean === 'development') return 'dev';
        return clean;
      };

      const prefix = formatDeptPrefix(value);
      const supervisorEmail = `${prefix}.sup@inara.io`;

      const existingUser = await prisma.user.findUnique({
        where: { email: supervisorEmail }
      });

      if (!existingUser) {
        const passwordText = `${prefix}123`;
        const passwordHash = await bcrypt.hash(passwordText, 12);

        await prisma.user.create({
          data: {
            email: supervisorEmail,
            passwordHash,
            firstName: label,
            lastName: 'Lead',
            role: 'SUPERVISOR',
            department: value,
            isActive: true
          }
        });
      }
    }

    return res.status(201).json({
      status: 'success',
      message: 'Option added successfully.',
      data: option
    });
  } catch (error) {
    console.error('Add dropdown option error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to add dropdown option.'
    });
  }
};

export const deleteDropdownOption = async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await prisma.dropdownOption.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Dropdown option not found.'
      });
    }

    await prisma.dropdownOption.delete({
      where: { id }
    });

    return res.status(200).json({
      status: 'success',
      message: 'Option deleted successfully.'
    });
  } catch (error) {
    console.error('Delete dropdown option error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to delete dropdown option.'
    });
  }
};

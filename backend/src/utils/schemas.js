import { z } from 'zod';

const DepartmentEnum = z.string();
const InternshipModeEnum = z.string();
const RoleEnum = z.enum(['ADMIN', 'INTERN', 'SUPERVISOR', 'APPLICANT']);
const ApplicationStatusEnum = z.enum(['SUBMITTED', 'UNDER_REVIEW', 'INTERVIEW_SCHEDULED', 'SELECTED', 'REJECTED']);
const DocumentStatusEnum = z.enum(['PENDING', 'UPLOADED', 'VERIFIED', 'REJECTED']);
const ReportStatusEnum = z.enum(['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'CHANGES_REQUESTED']);
const TaskStatusEnum = z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']);

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    role: RoleEnum.optional(),
    department: DepartmentEnum.optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    password: z.string().min(6),
  }),
});

export const applySchema = z.object({
  body: z.object({
    email: z.string().email(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phone: z.string().min(5),
    preferredDepartment: DepartmentEnum,
    internshipMode: InternshipModeEnum,
    dob: z.string().min(1),
    address: z.string().min(1),
    gender: z.string().min(1),
    nationality: z.string().min(1),
    emergencyContact: z.string().min(1),
    duration: z.coerce.number().int().min(1),
  }),
});

export const updateApplicationStatusSchema = z.object({
  body: z.object({
    status: ApplicationStatusEnum,
    interviewDate: z.string().optional().nullable(),
    startDate: z.string().optional().nullable(),
  }),
});

export const createInterneeAccountSchema = z.object({
  body: z.object({
    applicationId: z.string().uuid(),
    password: z.string().min(6),
    email: z.string().email(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    department: DepartmentEnum,
  }),
});

export const verifyDocumentSchema = z.object({
  body: z.object({
    status: DocumentStatusEnum,
    feedback: z.string().optional().nullable(),
  }),
});

export const assignDepartmentSchema = z.object({
  body: z.object({
    department: DepartmentEnum,
  }),
});

export const submitTaskReportSchema = z.object({
  body: z.object({
    taskId: z.string().uuid(),
    workCompleted: z.string().min(1),
    challengesFaced: z.string().min(1),
  }),
});

export const reviewReportSchema = z.object({
  body: z.object({
    status: ReportStatusEnum,
    feedback: z.string().optional().nullable(),
  }),
});

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    description: z.string().optional().nullable(),
  }),
});

export const projectMembersSchema = z.object({
  body: z.object({
    memberIds: z.array(z.string().uuid()).min(1),
  }),
});

export const assignProjectTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string().optional().nullable(),
    dueDate: z.string().datetime().optional().nullable(),
    assignedToId: z.string().uuid().optional().nullable(),
  }),
});

export const updateTaskStatusSchema = z.object({
  body: z.object({
    status: TaskStatusEnum,
  }),
});

export const archiveInternSchema = z.object({
  body: z.object({
    completionStatus: z.string().min(1),
  }),
});

import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Base uploads directory
const UPLOADS_DIR = 'uploads';

// Subfolders
const folders = {
  resumes: path.join(UPLOADS_DIR, 'resumes'),
  pictures: path.join(UPLOADS_DIR, 'pictures'),
  onboarding: path.join(UPLOADS_DIR, 'onboarding_docs'),
  roadmaps: path.join(UPLOADS_DIR, 'roadmaps'),
  deliverables: path.join(UPLOADS_DIR, 'deliverables'),
  reports: path.join(UPLOADS_DIR, 'reports'),
  projects: path.join(UPLOADS_DIR, 'projects'),
};

// Ensure all target folders exist
Object.values(folders).forEach((folder) => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
});

// Configure disk storage factory function
const createStorage = (subfolder) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, folders[subfolder]);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  });
};

// Multer upload instances
export const uploadResume = multer({
  storage: createStorage('resumes'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF documents are allowed for resumes.'));
    }
  },
});

export const uploadApplicationDocs = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === 'resume') {
        cb(null, folders.resumes);
      } else if (file.fieldname === 'picture') {
        cb(null, folders.pictures);
      } else {
        cb(new Error('Invalid field name'));
      }
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'resume') {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Only PDF documents are allowed for resumes.'));
      }
    } else if (file.fieldname === 'picture') {
      const allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (allowedImageTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only PNG, JPG, or JPEG files are allowed for pictures.'));
      }
    } else {
      cb(new Error('Unexpected file field.'));
    }
  },
});

export const uploadOnboarding = multer({
  storage: createStorage('onboarding'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const docType = req.body.type;
    const allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (docType === 'CNIC_ID' || docType === 'PHOTO') {
      if (file.mimetype === 'application/pdf' || allowedImageTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only PDF or image files (PNG, JPG, JPEG) are allowed for CNIC and Photos.'));
      }
    } else {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Only PDF files are allowed for this document type.'));
      }
    }
  },
});

export const uploadRoadmap = multer({
  storage: createStorage('roadmaps'),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF roadmap files are allowed.'));
    }
  },
});

export const uploadDeliverable = multer({
  storage: createStorage('deliverables'),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
});

export const uploadReportAttachment = multer({
  storage: createStorage('reports'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed for weekly report attachments.'));
    }
  },
});

export const uploadProjectReference = multer({
  storage: createStorage('projects'),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF reference files are allowed for project description.'));
    }
  },
});

import mongoose, { Document, Schema } from 'mongoose';

export interface IAppSettings extends Document {
  teacherLimits: {
    courses: number;
    quizzes: number;
    blogs: number;
  };
  notesLimits?: {
    maxPagesPerUser: number;
    maxWordsPerPage: number;
  };
  featureToggles: {
    enableBlogs: boolean;
    enableQuizzes: boolean;
    enableCourses: boolean;
    enableAnalytics: boolean;
    enableClarity: boolean;
    enableQuizSolutionAnalysis: boolean;
    restrictPublicCourseCreation?: boolean;
    enableEnrollmentManagement?: boolean;
    enablePhoneAuth?: boolean;
    enableNotes?: boolean;
  };
  platformConfig: {
    maintenanceMode: boolean;
    allowRegistration: boolean;
    allowTeacherRegistration: boolean;
    defaultLanguage: 'en' | 'hi';
  };
}

const appSettingsSchema = new Schema<IAppSettings>(
  {
    teacherLimits: {
      courses: {
        type: Number,
        default: 5,
        min: 1,
      },
      quizzes: {
        type: Number,
        default: 10,
        min: 1,
      },
      blogs: {
        type: Number,
        default: 2,
        min: 1,
      },
    },
    notesLimits: {
      maxPagesPerUser: {
        type: Number,
        default: 5,
        min: 1,
      },
      maxWordsPerPage: {
        type: Number,
        default: 1000,
        min: 50,
      },
    },
    featureToggles: {
      enableBlogs: {
        type: Boolean,
        default: true,
      },
      enableQuizzes: {
        type: Boolean,
        default: true,
      },
      enableCourses: {
        type: Boolean,
        default: true,
      },
      enableAnalytics: {
        type: Boolean,
        default: true,
      },
      enableClarity: {
        type: Boolean,
        default: true,
      },
      enableQuizSolutionAnalysis: {
        type: Boolean,
        default: false,
      },
      restrictPublicCourseCreation: {
        type: Boolean,
        default: false,
      },
      enableEnrollmentManagement: {
        type: Boolean,
        default: true,
      },
      enablePhoneAuth: {
        type: Boolean,
        default: true,
      },
      enableNotes: {
        type: Boolean,
        default: true,
      },
    },
    platformConfig: {
      siteName: {
        type: String,
        default: 'Quiz Do',
      },
      siteDescription: {
        type: String,
        default: 'Learning Management System',
      },
      maintenanceMode: {
        type: Boolean,
        default: false,
      },
      allowRegistration: {
        type: Boolean,
        default: true,
      },
      allowTeacherRegistration: {
        type: Boolean,
        default: true,
      },
      defaultLanguage: {
        type: String,
        enum: ['en', 'hi'],
        default: 'en',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one settings document exists
appSettingsSchema.pre('save', async function (next) {
  const count = await mongoose.models.AppSettings.countDocuments();
  if (count >= 1 && this.isNew) {
    throw new Error('Only one AppSettings document is allowed');
  }
  next();
});

// Add index for updatedAt to track settings changes
appSettingsSchema.index({ updatedAt: -1 });

export default mongoose.models.AppSettings || mongoose.model<IAppSettings>('AppSettings', appSettingsSchema);

import mongoose, { Document, Schema } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  code: string; // Unique code for joining (deprecated, use inviteCode)
  inviteCode: string; // Unique invite code for users to join
  description?: string;
  logo?: string; // Logo image URL or base64 data
  primaryColor?: string; // Hex color code for branding (e.g. #4F46E5)
  website?: string; // Organization website URL
  tagline?: string; // Short slogan or motto
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const organizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    inviteCode: { type: String, required: true, unique: true },
    description: String,
    logo: { type: String, default: null },
    primaryColor: { type: String, default: null },
    website: { type: String, default: null },
    tagline: { type: String, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Index for frequently queried fields
organizationSchema.index({ isActive: 1 });

export default mongoose.models.Organization || mongoose.model<IOrganization>('Organization', organizationSchema);

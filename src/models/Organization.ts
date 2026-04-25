import mongoose, { Document, Schema } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  code: string; // Unique code for joining (deprecated, use inviteCode)
  inviteCode: string; // Unique invite code for users to join
  description?: string;
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
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Index for frequently queried fields
organizationSchema.index({ isActive: 1 });

export default mongoose.models.Organization || mongoose.model<IOrganization>('Organization', organizationSchema);

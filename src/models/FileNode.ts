import mongoose, { Document, Schema } from 'mongoose';

export type FileNodeType = 'folder' | 'file';

export interface IFileNode extends Document {
  name: string;
  type: FileNodeType;
  parentId?: mongoose.Types.ObjectId | null;

  // File-specific fields
  fileUrl?: string;
  publicId?: string;
  fileType?: string;
  size?: number;

  uploadedBy: mongoose.Types.ObjectId;
  organizationId?: mongoose.Types.ObjectId | null;

  createdAt: Date;
  updatedAt: Date;
}

const fileNodeSchema = new Schema<IFileNode>(
  {
    name: { type: String, required: true, trim: true, maxlength: 255 },
    type: { type: String, required: true, enum: ['folder', 'file'] },
    parentId: { type: Schema.Types.ObjectId, ref: 'FileNode', default: null },

    fileUrl: { type: String, default: '' },
    publicId: { type: String, default: '' },
    fileType: { type: String, default: '' },
    size: { type: Number, default: 0 },

    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', default: null },
  },
  { timestamps: true }
);

// Prevent duplicate names within the same folder
fileNodeSchema.index({ parentId: 1, name: 1 }, { unique: true });

// Requested indexes
fileNodeSchema.index({ parentId: 1, type: 1 });
fileNodeSchema.index({ organizationId: 1, parentId: 1 });
fileNodeSchema.index({ name: 'text' });

export default mongoose.models.FileNode || mongoose.model<IFileNode>('FileNode', fileNodeSchema);

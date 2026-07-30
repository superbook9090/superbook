import mongoose, { Document, Schema } from 'mongoose';

/**
 * Course completion certificate. Issued automatically when the instructor has
 * marked the course completed AND the student has finished every published
 * lesson and quiz. Name/title snapshots keep the certificate renderable even
 * if the source records are later renamed.
 */
export interface ICertificate extends Document {
  student: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  organizationId?: mongoose.Types.ObjectId | null;
  /** Public serial used for display and verification, e.g. QD-2026-8F3K2A1B. */
  certificateId: string;
  studentName: string;
  courseTitle: string;
  instructorName: string;
  issuedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const certificateSchema = new Schema<ICertificate>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', default: null },
    certificateId: { type: String, required: true },
    studentName: { type: String, required: true },
    courseTitle: { type: String, required: true },
    instructorName: { type: String, default: '' },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

certificateSchema.index({ student: 1, course: 1 }, { unique: true });
certificateSchema.index({ certificateId: 1 }, { unique: true });
certificateSchema.index({ student: 1, issuedAt: -1 });
certificateSchema.index({ course: 1 });

const Certificate =
  (mongoose.models.Certificate as mongoose.Model<ICertificate>) ||
  mongoose.model<ICertificate>('Certificate', certificateSchema);

export default Certificate;

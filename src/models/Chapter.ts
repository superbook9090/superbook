import mongoose, { Document, Schema } from 'mongoose';

export interface IChapter extends Document {
  course: mongoose.Types.ObjectId;
  title: string;
  summary?: string;
  /** null = top-level topic; set = sub-topic under a parent topic */
  parentChapter?: mongoose.Types.ObjectId | null;
  order: number;
  lessonCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const chapterSchema = new Schema<IChapter>(
  {
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    summary: { type: String, maxlength: 2000 },
    parentChapter: { type: Schema.Types.ObjectId, ref: 'Chapter', default: null, index: true },
    order: { type: Number, default: 0 },
    lessonCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

chapterSchema.index(
  { course: 1, parentChapter: 1, order: 1 },
  { unique: true, name: 'course_1_parentChapter_1_order_1' }
);

const Chapter =
  (mongoose.models.Chapter as mongoose.Model<IChapter>) ||
  mongoose.model<IChapter>('Chapter', chapterSchema);

let indexesEnsured = false;

/** Drop legacy { course, order } unique index; sync hierarchical index. */
export async function ensureChapterIndexes(): Promise<void> {
  if (indexesEnsured) return;

  const collection = Chapter.collection;
  const indexes = await collection.indexes();

  const hasLegacyIndex = indexes.some(
    (idx) =>
      idx.name === 'course_1_order_1' &&
      idx.key &&
      'course' in idx.key &&
      'order' in idx.key &&
      !('parentChapter' in idx.key)
  );

  if (hasLegacyIndex) {
    try {
      await collection.dropIndex('course_1_order_1');
    } catch (error) {
      const code = (error as { code?: number }).code;
      if (code !== 27) throw error; // IndexNotFound
    }
  }

  await Chapter.syncIndexes();
  indexesEnsured = true;
}

export default Chapter;

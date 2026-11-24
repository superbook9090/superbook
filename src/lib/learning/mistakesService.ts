import dbConnect from '@/lib/db';
import MistakeBookmark from '@/models/MistakeBookmark';
import mongoose from 'mongoose';

export interface RecordMistakeItem {
  questionId: string;
  prompt: string;
  options: string[];
  correctOption: number;
  selectedOption: number;
  explanation?: string;
}

export async function recordMistakes(params: {
  userId: string;
  items: RecordMistakeItem[];
  sourceType: 'contest' | 'quiz';
  sourceId?: string;
  sourceTitle?: string;
}): Promise<number> {
  const { userId, items, sourceType, sourceId, sourceTitle } = params;
  if (!items || items.length === 0) return 0;

  await dbConnect();

  const operations = items.map((item) => ({
    updateOne: {
      filter: {
        user: new mongoose.Types.ObjectId(userId),
        question: new mongoose.Types.ObjectId(item.questionId),
      },
      update: {
        $set: {
          sourceType,
          sourceId: sourceId && mongoose.Types.ObjectId.isValid(sourceId)
            ? new mongoose.Types.ObjectId(sourceId)
            : null,
          sourceTitle: sourceTitle || 'Practice Test',
          prompt: item.prompt,
          options: item.options,
          correctOption: item.correctOption,
          selectedOption: item.selectedOption,
          explanation: item.explanation || null,
          mastered: false, // Re-opened as mistake
        },
        $inc: { reviewedCount: 1 },
      },
      upsert: true,
    },
  }));

  try {
    const res = await MistakeBookmark.bulkWrite(operations);
    return (res.upsertedCount || 0) + (res.modifiedCount || 0);
  } catch (err) {
    console.error('[MistakesService] Bulk write error:', err);
    return 0;
  }
}

export async function listUserMistakes(params: {
  userId: string;
  mastered?: boolean;
  page?: number;
  limit?: number;
}) {
  await dbConnect();
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, Math.min(100, params.limit || 20));
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {
    user: new mongoose.Types.ObjectId(params.userId),
  };

  if (typeof params.mastered === 'boolean') {
    filter.mastered = params.mastered;
  }

  const [items, total, unmasteredCount] = await Promise.all([
    MistakeBookmark.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    MistakeBookmark.countDocuments(filter),
    MistakeBookmark.countDocuments({
      user: new mongoose.Types.ObjectId(params.userId),
      mastered: false,
    }),
  ]);

  const rawItems = items as unknown as Array<{
    _id: { toString(): string };
    question: { toString(): string };
    user: { toString(): string };
    sourceId?: { toString(): string };
    [key: string]: unknown;
  }>;

  return {
    items: rawItems.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
      question: doc.question.toString(),
      user: doc.user.toString(),
      sourceId: doc.sourceId?.toString(),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      unmasteredCount,
    },
  };
}

export async function toggleMistakeMastered(
  userId: string,
  mistakeId: string,
  mastered: boolean
): Promise<boolean> {
  await dbConnect();
  if (!mongoose.Types.ObjectId.isValid(mistakeId)) return false;

  const res = await MistakeBookmark.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(mistakeId),
      user: new mongoose.Types.ObjectId(userId),
    },
    { $set: { mastered } },
    { new: true }
  );

  return Boolean(res);
}

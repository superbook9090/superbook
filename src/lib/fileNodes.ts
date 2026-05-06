import mongoose from 'mongoose';
import FileNode, { type IFileNode } from '@/models/FileNode';

export function normalizeParentId(parentId: string | null | undefined) {
  if (!parentId) return null;
  if (!mongoose.Types.ObjectId.isValid(parentId)) return null;
  return new mongoose.Types.ObjectId(parentId);
}

export async function assertParentIsFolder(parentId: mongoose.Types.ObjectId | null) {
  if (!parentId) return;
  const parent = await FileNode.findById(parentId)
    .select('_id type')
    .lean<{ _id: mongoose.Types.ObjectId; type: 'folder' | 'file' } | null>();
  if (!parent) {
    const err = new Error('Parent folder not found');
    (err as unknown as { statusCode?: number }).statusCode = 404;
    throw err;
  }
  if (parent.type !== 'folder') {
    const err = new Error('Parent must be a folder');
    (err as unknown as { statusCode?: number }).statusCode = 400;
    throw err;
  }
}

export async function collectSubtreeIds(rootId: mongoose.Types.ObjectId) {
  const ids: mongoose.Types.ObjectId[] = [rootId];
  const queue: mongoose.Types.ObjectId[] = [rootId];

  while (queue.length) {
    const batch = queue.splice(0, 50);
    const children = await FileNode.find({ parentId: { $in: batch } })
      .select('_id')
      .lean();

    for (const c of children) {
      const childId = c._id as mongoose.Types.ObjectId;
      ids.push(childId);
      queue.push(childId);
    }
  }

  return ids;
}

export async function collectSubtreeFiles(rootIds: mongoose.Types.ObjectId[]) {
  const files = await FileNode.find({
    _id: { $in: rootIds },
    type: 'file',
    publicId: { $exists: true, $ne: '' },
  })
    .select('_id publicId')
    .lean();

  return files as Pick<IFileNode, '_id' | 'publicId'>[];
}


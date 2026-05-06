/**
 * Migration: QuestionPaper (courseName -> year -> papers) -> FileNode tree
 *
 * Expected legacy docs live in MongoDB collection: `questionpapers` (or `questionPapers`)
 * and contain some of the following fields (best-effort):
 * - courseName (string)
 * - year (string | number)
 * - name/title/paperName (string)
 * - fileUrl/pdfUrl/url (string)
 * - publicId (string, optional)
 * - fileType (string, optional)
 * - size (number, optional)
 * - organizationId (ObjectId/string/null, optional)
 *
 * This script creates:
 * - root folder per courseName
 * - subfolder per year under the course folder
 * - file nodes under year folder
 *
 * Required env:
 * - MONGODB_URI
 * - MIGRATION_UPLOADED_BY (a User ObjectId string)
 */

import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import FileNode from '@/models/FileNode';

type LegacyPaper = {
  _id: unknown;
  courseName?: unknown;
  year?: unknown;
  name?: unknown;
  title?: unknown;
  paperName?: unknown;
  fileUrl?: unknown;
  pdfUrl?: unknown;
  url?: unknown;
  publicId?: unknown;
  fileType?: unknown;
  size?: unknown;
  organizationId?: unknown;
};

function asString(v: unknown) {
  return typeof v === 'string' ? v : '';
}

function toObjectIdOrNull(v: unknown) {
  if (!v) return null;
  const s = typeof v === 'string' ? v : (v as { toString?: () => string })?.toString?.();
  if (!s) return null;
  return mongoose.Types.ObjectId.isValid(s) ? new mongoose.Types.ObjectId(s) : null;
}

async function upsertFolder(params: {
  name: string;
  parentId: mongoose.Types.ObjectId | null;
  organizationId: mongoose.Types.ObjectId | null;
  uploadedBy: mongoose.Types.ObjectId;
}) {
  const existing = await FileNode.findOne({
    type: 'folder',
    name: params.name,
    parentId: params.parentId,
  })
    .select('_id')
    .lean<{ _id: mongoose.Types.ObjectId } | null>();

  if (existing?._id) return existing._id as mongoose.Types.ObjectId;

  const created = await FileNode.create({
    name: params.name,
    type: 'folder',
    parentId: params.parentId,
    organizationId: params.organizationId,
    uploadedBy: params.uploadedBy,
  });

  return created._id as mongoose.Types.ObjectId;
}

async function migrate() {
  const uploadedByRaw = process.env.MIGRATION_UPLOADED_BY;
  if (!uploadedByRaw || !mongoose.Types.ObjectId.isValid(uploadedByRaw)) {
    throw new Error('Missing/invalid MIGRATION_UPLOADED_BY (must be a User ObjectId)');
  }
  const uploadedBy = new mongoose.Types.ObjectId(uploadedByRaw);

  await dbConnect();

  const db = mongoose.connection.db;
  if (!db) throw new Error('MongoDB not connected');

  const candidates = ['questionpapers', 'questionPapers', 'question_papers'];
  let sourceName: string | null = null;

  for (const name of candidates) {
    const exists = await db.listCollections({ name }).hasNext();
    if (exists) {
      sourceName = name;
      break;
    }
  }

  if (!sourceName) {
    console.log('⚠️  No legacy QuestionPaper collection found. Nothing to migrate.');
    return;
  }

  console.log(`📦 Migrating legacy collection: ${sourceName}`);

  const legacy = (await db.collection(sourceName).find({}).toArray()) as LegacyPaper[];
  console.log(`Found ${legacy.length} legacy records`);

  let createdFolders = 0;
  let createdFiles = 0;
  let skipped = 0;

  for (const doc of legacy) {
    const courseName = asString(doc.courseName).trim();
    const yearRaw = doc.year;
    const year = (typeof yearRaw === 'number' ? String(yearRaw) : asString(yearRaw)).trim();

    const name =
      asString(doc.name).trim() ||
      asString(doc.title).trim() ||
      asString(doc.paperName).trim() ||
      'Paper.pdf';

    const fileUrl = asString(doc.fileUrl).trim() || asString(doc.pdfUrl).trim() || asString(doc.url).trim();
    const organizationId = toObjectIdOrNull(doc.organizationId);

    if (!courseName || !year || !fileUrl) {
      skipped += 1;
      continue;
    }

    const courseFolderId = await upsertFolder({
      name: courseName,
      parentId: null,
      organizationId,
      uploadedBy,
    });

    const yearFolderId = await upsertFolder({
      name: year,
      parentId: courseFolderId,
      organizationId,
      uploadedBy,
    });

    // Track folder creation roughly (upsert doesn't expose whether created)
    createdFolders += 0;

    const existsFile = await FileNode.findOne({
      type: 'file',
      name,
      parentId: yearFolderId,
    }).select('_id').lean();

    if (existsFile) {
      skipped += 1;
      continue;
    }

    await FileNode.create({
      name: name.toLowerCase().endsWith('.pdf') ? name : `${name}.pdf`,
      type: 'file',
      parentId: yearFolderId,
      fileUrl,
      publicId: asString(doc.publicId).trim(),
      fileType: asString(doc.fileType).trim() || 'pdf',
      size: typeof doc.size === 'number' ? doc.size : 0,
      uploadedBy,
      organizationId,
    });

    createdFiles += 1;
  }

  console.log('✅ Migration finished');
  console.log({ createdFolders, createdFiles, skipped });
}

if (require.main === module) {
  migrate()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error('❌ Migration failed:', e);
      process.exit(1);
    });
}

export default migrate;


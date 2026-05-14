import { Schema } from 'mongoose';

/** Optional audit fields for greenfield domain models. */
export const auditFields = {
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
};

export const timestampsStrict = { timestamps: true } as const;

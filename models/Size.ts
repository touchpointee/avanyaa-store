import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISize extends Document {
  name: string;
  sortOrder: number;
  isBigSize: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SizeSchema = new Schema<ISize>(
  {
    name: {
      type: String,
      required: [true, 'Size name is required'],
      trim: true,
      unique: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isBigSize: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

SizeSchema.index({ sortOrder: 1 });

const Size: Model<ISize> = mongoose.models.Size || mongoose.model<ISize>('Size', SizeSchema);

export default Size;

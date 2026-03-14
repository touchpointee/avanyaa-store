import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IColor extends Document {
  name: string;
  hex: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const ColorSchema = new Schema<IColor>(
  {
    name: {
      type: String,
      required: [true, 'Color name is required'],
      trim: true,
      unique: true,
    },
    hex: {
      type: String,
      required: [true, 'Hex color is required'],
      trim: true,
      default: '#000000',
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

ColorSchema.index({ sortOrder: 1 });

const Color: Model<IColor> = mongoose.models.Color || mongoose.model<IColor>('Color', ColorSchema);

export default Color;

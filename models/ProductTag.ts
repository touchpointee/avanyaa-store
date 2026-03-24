import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProductTag extends Document {
  tag: string;
  productIds: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductTagSchema = new Schema<IProductTag>(
  {
    tag: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    productIds: {
      type: [Schema.Types.ObjectId],
      ref: 'Product',
      default: [],
    },
  },
  { timestamps: true }
);

// Index for fast lookups
ProductTagSchema.index({ tag: 1 });

const ProductTag: Model<IProductTag> =
  mongoose.models.ProductTag ||
  mongoose.model<IProductTag>('ProductTag', ProductTagSchema);

export default ProductTag;

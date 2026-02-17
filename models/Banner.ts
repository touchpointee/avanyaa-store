import mongoose, { Schema, Document, Model } from 'mongoose';

export type BannerType = 'hero' | 'promo' | 'category';

export interface IBanner extends Document {
  type: BannerType;
  image: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  link?: string;
  active: boolean;
  order: number;
  categoryId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema = new Schema<IBanner>(
  {
    type: {
      type: String,
      required: true,
      enum: ['hero', 'promo', 'category'],
    },
    image: {
      type: String,
      required: true,
    },
    title: {
      type: String,
    },
    subtitle: {
      type: String,
    },
    buttonText: {
      type: String,
    },
    link: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
  },
  { timestamps: true }
);

BannerSchema.index({ type: 1, order: 1 });

const Banner: Model<IBanner> =
  mongoose.models.Banner || mongoose.model<IBanner>('Banner', BannerSchema);

export default Banner;

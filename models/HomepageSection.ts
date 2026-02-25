import mongoose, { Schema, Document, Model } from 'mongoose';

export type HomepageSectionType = 'hero' | 'featured_categories' | 'trending' | 'new_arrivals' | 'promo' | 'category' | 'big_size' | 'banner' | 'semi_banner';

export interface IHomepageSection extends Document {
  type: HomepageSectionType;
  title: string;
  linkedProductIds: mongoose.Types.ObjectId[];
  categoryId?: mongoose.Types.ObjectId;
  image?: string;
  link?: string;
  image2?: string;
  link2?: string;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HomepageSectionSchema = new Schema<IHomepageSection>(
  {
    type: {
      type: String,
      required: true,
      enum: ['hero', 'featured_categories', 'trending', 'new_arrivals', 'promo', 'category', 'big_size', 'banner', 'semi_banner'],
    },
    title: {
      type: String,
      required: true,
      default: '',
    },
    linkedProductIds: {
      type: [Schema.Types.ObjectId],
      ref: 'Product',
      default: [],
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
    image: {
      type: String,
    },
    link: {
      type: String,
    },
    image2: {
      type: String,
    },
    link2: {
      type: String,
    },
    order: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

HomepageSectionSchema.index({ order: 1 });

const HomepageSection: Model<IHomepageSection> =
  mongoose.models.HomepageSection ||
  mongoose.model<IHomepageSection>('HomepageSection', HomepageSectionSchema);

export default HomepageSection;
